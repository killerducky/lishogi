package lila.setup

import chess.format.FEN
import lila.game.{ Game, Player, Pov, Source }
import lila.lobby.Color
import lila.user.User

case class AiConfig(
    variant: chess.variant.Variant,
    timeMode: TimeMode,
    time: Double,
    increment: Int,
    byoyomi: Int,
    periods: Int,
    days: Int,
    level: Int,
    color: Color,
    fen: Option[FEN] = None
) extends Config
    with Positional {

  val strictFen = true

  def >> = (variant.id, timeMode.id, time, increment, byoyomi, periods, days, level, color.name, fen.map(_.value)).some

  def game(user: Option[User]) = {
    fenGame { chessGame =>
      val perfPicker = lila.game.PerfPicker.mainOrDefault(
        chess.Speed(chessGame.clock.map(_.config)),
        chessGame.situation.board.variant,
        makeDaysPerTurn
      )
      Game
        .make(
          chess = chessGame,
          sentePlayer = creatorColor.fold(
            Player.make(chess.Sente, user, perfPicker),
            Player.make(chess.Sente, level.some)
          ),
          gotePlayer = creatorColor.fold(
            Player.make(chess.Gote, level.some),
            Player.make(chess.Gote, user, perfPicker)
          ),
          mode = chess.Mode.Casual,
          source = if (chessGame.board.variant.fromPosition) Source.Position else Source.Ai,
          daysPerTurn = makeDaysPerTurn,
          pgnImport = None
        )
        .sloppy
    } start
  }

  def pov(user: Option[User]) = Pov(game(user), creatorColor)

  def timeControlFromPosition = variant != chess.variant.FromPosition || time >= 1
}

object AiConfig extends BaseConfig {

  def from(v: Int, tm: Int, t: Double, i: Int, b: Int, p: Int, d: Int, level: Int, c: String, fen: Option[String]) =
    new AiConfig(
      variant = chess.variant.Variant(v) err "Invalid game variant " + v,
      timeMode = TimeMode(tm) err s"Invalid time mode $tm",
      time = t,
      increment = i,
      byoyomi = b,
      periods = p,
      days = d,
      level = level,
      color = Color(c) err "Invalid color " + c,
      fen = fen map FEN
    )

  val default = AiConfig(
    variant = variantDefault,
    timeMode = TimeMode.Unlimited,
    time = 5d,
    increment = 0,
    byoyomi = 10,
    periods = 1,
    days = 2,
    level = 1,
    color = Color.default
  )

  val levels = (1 to 8).toList

  val levelChoices = levels map { l =>
    (l.toString, l.toString, none)
  }

  import lila.db.BSON
  import lila.db.dsl._
  import lila.game.BSONHandlers.FENBSONHandler

  implicit private[setup] val aiConfigBSONHandler = new BSON[AiConfig] {

    def reads(r: BSON.Reader): AiConfig =
      AiConfig(
        variant = chess.variant.Variant orDefault (r int "v"),
        timeMode = TimeMode orDefault (r int "tm"),
        time = r double "t",
        increment = r int "i",
        byoyomi = r intD "b",
        periods = r intD "p",
        days = r int "d",
        level = r int "l",
        color = Color.Sente,
        fen = r.getO[FEN]("f") filter (_.value.nonEmpty)
      )

    def writes(w: BSON.Writer, o: AiConfig) =
      $doc(
        "v"  -> o.variant.id,
        "tm" -> o.timeMode.id,
        "t"  -> o.time,
        "i"  -> o.increment,
        "b"  -> o.byoyomi,
        "p"  -> o.periods,
        "d"  -> o.days,
        "l"  -> o.level,
        "f"  -> o.fen
      )
  }
}
