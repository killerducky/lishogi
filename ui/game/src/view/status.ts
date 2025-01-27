import { Ctrl } from "../interfaces";

export default function status(ctrl: Ctrl): string {
  const noarg = ctrl.trans.noarg,
    d = ctrl.data;
  switch (d.game.status.name) {
    case "started":
      return noarg("playingRightNow");
    case "aborted":
      return noarg("gameAborted");
    case "mate":
      return noarg("checkmate");
    case "resign":
      return noarg(
        d.game.winner == "sente" ? "whiteResigned" : "blackResigned"
      );
    case "stalemate":
      return noarg("stalemate");
    case "impasse":
      return "Impasse (Try Rule)";
    case "perpetualCheck":
      return "Perpetual check (Illegal move)";
    case "timeout":
      switch (d.game.winner) {
        case "sente":
          return noarg("whiteLeftTheGame");
        case "gote":
          return noarg("blackLeftTheGame");
      }
      return noarg("draw");
    case "draw":
      return noarg("draw");
    case "outoftime":
      return noarg("timeOut");
    case "noStart":
      return (d.game.winner == "sente" ? "Gote" : "Sente") + " didn't move";
    case "cheat":
      return "Cheat detected";
    case "variantEnd":
      return noarg("variantEnding");
    default:
      return d.game.status.name;
  }
}
