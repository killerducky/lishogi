import { dragNewPiece } from "shogiground/drag";
import { setDropMode, cancelDropMode } from "shogiground/drop";
import AnalyseCtrl from "../ctrl";
import * as cg from "shogiground/types";
import { Shogi } from "shogiops/shogi"; 
import { parseFen } from "shogiops/fen";
import { parseChessSquare } from "shogiops/compat";
import { PocketRole } from "shogiops/types";
import {defined} from "common";

export function shadowDrop(ctrl: AnalyseCtrl, color: Color, e: cg.MouchEvent): void {
  const el = e.target as HTMLElement;
  const role = (el.getAttribute("data-role") ??
    el.firstElementChild!.getAttribute("data-role")) as cg.Role;
  if (!ctrl.shogiground) return;
  const curPiece = ctrl.shogiground.state.drawable.piece;
  if (curPiece && curPiece.role == role && curPiece.color == color)
    ctrl.shogiground.state.drawable.piece = undefined
  else ctrl.shogiground.state.drawable.piece = { role: role, color: color };
  e.stopPropagation();
  e.preventDefault();
  ctrl.redraw();
}

export function drag(ctrl: AnalyseCtrl, color: Color, e: cg.MouchEvent): void {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (ctrl.shogiground.state.movable.color !== color) return;
  const el = e.target as HTMLElement;
  const role = el.getAttribute("data-role") as cg.Role,
    number = el.getAttribute("data-nb");
  if (!role || !color || number === "0") return;
  e.stopPropagation();
  e.preventDefault();
  dragNewPiece(ctrl.shogiground.state, { color, role }, e);
}

export function selectToDrop(ctrl: AnalyseCtrl, color: Color, e: cg.MouchEvent): void {
  if (e.button !== undefined && e.button !== 0) return;
  if (ctrl.shogiground.state.movable.color !== color) return;
  const el = e.target as HTMLElement;
  const role = el.getAttribute("data-role") as cg.Role,
    number = el.getAttribute("data-nb");
  if (!role || number === "0") return;
  if (!defined(ctrl.shogiground)) return;
  const dropMode = ctrl.shogiground.state.dropmode;
  const dropPiece = ctrl.shogiground.state.dropmode.piece;

  if (!dropMode.active || dropPiece?.role !== role) {
    setDropMode(ctrl.shogiground.state, { color, role });
    ctrl.dropmodeActive = true;
  }
  else {
    cancelDropMode(ctrl.shogiground.state);
    ctrl.dropmodeActive = false;
  }
  e.stopPropagation();
  e.preventDefault();
  ctrl.redraw();
}

export function valid(
  fen: string,
  piece: cg.Piece,
  pos: Key
): boolean {
  const sfen = parseFen(fen).unwrap();
  const shogi = Shogi.fromSetup(sfen, false);
  return shogi.unwrap(
    (s) => {
      return s.turn === piece.color && s.isLegal({role: piece.role as PocketRole, to: parseChessSquare(pos)!})
    },
    (_) => true
  );
}
