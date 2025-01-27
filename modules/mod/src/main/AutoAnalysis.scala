package lila.mod

object AutoAnalysis {

  sealed trait Reason

  object Reason {

    case object HoldAlert            extends Reason
    case object SenteMoveTime        extends Reason
    case object GoteMoveTime        extends Reason
    case object Blurs                extends Reason
    case object WinnerRatingProgress extends Reason
    case object NewPlayerWin         extends Reason
  }
}
