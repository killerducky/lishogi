package lila.round

import chess.format.{ FEN, Forsyth }
import chess.variant._
import chess.{ Game => ChessGame, Board, Color => ChessColor, Clock, Situation, Data }
import ChessColor.{ Gote, Sente }
import com.github.blemale.scaffeine.Cache
import lila.memo.CacheApi
import scala.concurrent.duration._

import lila.common.Bus
import lila.game.{ AnonCookie, Event, Game, GameRepo, PerfPicker, Pov, Rematches, Source }
import lila.memo.ExpireSetMemo
import lila.user.{ User, UserRepo }
import lila.i18n.{ I18nKeys => trans, defaultLang }

final private class Rematcher(
    gameRepo: GameRepo,
    userRepo: UserRepo,
    idGenerator: lila.game.IdGenerator,
    messenger: Messenger,
    onStart: OnStart,
    rematches: Rematches
)(implicit ec: scala.concurrent.ExecutionContext) {

  implicit private val chatLang = defaultLang

  private val declined = new lila.memo.ExpireSetMemo(1 minute)

  private val rateLimit = new lila.memo.RateLimit[String](
    credits = 2,
    duration = 1 minute,
    key = "round.rematch"
  )

  import Rematcher.Offers

  private val offers: Cache[Game.ID, Offers] = CacheApi.scaffeineNoScheduler
    .expireAfterWrite(20 minutes)
    .build[Game.ID, Offers]()

  private val chess960 = new ExpireSetMemo(3 hours)

  def isOffering(pov: Pov): Boolean = offers.getIfPresent(pov.gameId).exists(_(pov.color))

  def yes(pov: Pov): Fu[Events] =
    pov match {
      case Pov(game, color) if game.playerCouldRematch =>
        if (isOffering(!pov) || game.opponent(color).isAi)
          rematches.of(game.id).fold(rematchJoin(pov))(rematchExists(pov))
        else if (!declined.get(pov.flip.fullId) && rateLimit(pov.fullId)(true)(false))
          fuccess(rematchCreate(pov))
        else fuccess(List(Event.RematchOffer(by = none)))
      case _ => fuccess(List(Event.ReloadOwner))
    }

  def no(pov: Pov): Fu[Events] = {
    if (isOffering(pov)) messenger.system(pov.game, trans.rematchOfferCanceled.txt())
    else if (isOffering(!pov)) {
      declined put pov.fullId
      messenger.system(pov.game, trans.rematchOfferDeclined.txt())
    }
    offers invalidate pov.game.id
    fuccess(List(Event.RematchOffer(by = none)))
  }

  private def rematchExists(pov: Pov)(nextId: Game.ID): Fu[Events] =
    gameRepo game nextId flatMap {
      _.fold(rematchJoin(pov))(g => isHandicapOptimized(g) map { redirectEvents(g, _) })
    }

  private def rematchJoin(pov: Pov): Fu[Events] =
    rematches.of(pov.gameId) match {
      case None =>
        for {
          initialFen <- gameRepo initialFen pov.game
          isHandicap = pov.game isHandicap initialFen
          nextGame <- returnGame(pov, initialFen, isHandicap) map (_.start)
          _ = offers invalidate pov.game.id
          _ = rematches.cache.put(pov.gameId, nextGame.id)
          _ = if (pov.game.variant == Chess960 && !chess960.get(pov.gameId)) chess960.put(nextGame.id)
          _ <- gameRepo insertDenormalized nextGame
        } yield {
          messenger.system(pov.game, trans.rematchOfferAccepted.txt())
          onStart(nextGame.id)
          redirectEvents(nextGame, isHandicap)
        }
      case Some(rematchId) => gameRepo game rematchId flatMap {
        _ ?? (g => isHandicapOptimized(g) map { redirectEvents(g, _) })
      }
    }

  private def rematchCreate(pov: Pov): Events = {
    messenger.system(pov.game, trans.rematchOfferSent.txt())
    pov.opponent.userId foreach { forId =>
      Bus.publish(lila.hub.actorApi.round.RematchOffer(pov.gameId), s"rematchFor:$forId")
    }
    offers.put(pov.gameId, Offers(sente = pov.color.sente, gote = pov.color.gote))
    List(Event.RematchOffer(by = pov.color.some))
  }

  private def returnGame(pov: Pov, initialFen: Option[FEN], isHandicap: Boolean): Fu[Game] =
    for {
      users <- userRepo byIds pov.game.userIds
      situation = initialFen flatMap { fen =>
        Forsyth <<< fen.value
      }
      pieces = pov.game.variant match {
        case FromPosition => situation.fold(Standard.pieces)(_.situation.board.pieces)
        case variant      => variant.pieces
      }
      sPlayer = returnPlayer(pov.game, Sente, users)
      gPlayer = returnPlayer(pov.game, Gote, users)
      game <- Game.make(
        chess = ChessGame(
          situation = Situation(
            board = Board(pieces, variant = pov.game.variant).withCrazyData {
              situation.fold[Option[chess.Data]](Some(Data.init))(_.situation.board.crazyData)
            },
            color = situation.fold[chess.Color](Sente)(_.situation.color)
          ),
          clock = pov.game.clock map { c =>
            Clock(c.config)
          },
          turns = situation ?? (_.turns),
          startedAtTurn = situation ?? (_.turns)
        ),
        sentePlayer = if(isHandicap) gPlayer else sPlayer,
        gotePlayer = if(isHandicap) sPlayer else gPlayer,
        mode = if (users.exists(_.lame)) chess.Mode.Casual else pov.game.mode,
        source = pov.game.source | Source.Lobby,
        daysPerTurn = pov.game.daysPerTurn,
        pgnImport = None
      ) withUniqueId idGenerator
    } yield game

  private def returnPlayer(game: Game, color: ChessColor, users: List[User]): lila.game.Player =
    game.opponent(color).aiLevel match {
      case Some(ai) => lila.game.Player.make(color, ai.some)
      case None =>
        lila.game.Player.make(
          color,
          game.opponent(color).userId.flatMap { id =>
            users.find(_.id == id)
          },
          PerfPicker.mainOrDefault(game)
        )
    }

  private def redirectEvents(game: Game, isHandicap: Boolean = false): Events = {
    val senteId = game fullIdOf Sente
    val goteId = game fullIdOf Gote
    List(
      Event.RedirectOwner(if (isHandicap) Gote else Sente, goteId, AnonCookie.json(game pov Gote)),
      Event.RedirectOwner(if (isHandicap) Sente else Gote, senteId, AnonCookie.json(game pov Sente)),
      // tell spectators about the rematch
      Event.RematchTaken(game.id)
    )
  }

  private def isHandicapOptimized(game: Game): Fu[Boolean] =
    if (game.variant == Standard)
      fuccess(false)
    else
      gameRepo initialFen game fallbackTo fuccess(None) map { game isHandicap _ }
}

private object Rematcher {

  case class Offers(sente: Boolean, gote: Boolean) {
    def apply(color: chess.Color) = color.fold(sente, gote)
  }
}
