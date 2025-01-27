import { h } from 'snabbdom'
import { VNodeData } from 'snabbdom/vnode'
import { Hooks } from 'snabbdom/hooks'
import * as cg from 'shogiground/types'
import { opposite } from 'shogiground/util';
import { Redraw, EncodedDests, Dests, MaterialDiff, Step, CheckCount } from './interfaces';
import {Shogi} from 'shogiops';
import {parseFen} from 'shogiops/fen';
import {shogigroundDropDests} from 'shogiops/compat';

const pieceScores = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  king: 0
};

export function justIcon(icon: string): VNodeData {
  return {
    attrs: { 'data-icon': icon }
  };
}

export function uci2move(uci: string): cg.Key[] | undefined {
  if (!uci) return undefined;
  if (uci[1] === '*') return [uci.slice(2, 4) as cg.Key];
  return [uci.slice(0, 2), uci.slice(2, 4)] as cg.Key[];
}

export function onInsert(f: (el: HTMLElement) => void): Hooks {
  return {
    insert(vnode) {
      f(vnode.elm as HTMLElement);
    }
  };
}

export function bind(eventName: string, f: (e: Event) => void, redraw?: Redraw, passive: boolean = true): Hooks {
  return onInsert(el => {
    el.addEventListener(eventName, !redraw ? f : e => {
      const res = f(e);
      redraw();
      return res;
    }, { passive });
  });
}

export function parsePossibleMoves(dests?: EncodedDests): Dests {
  const dec = new Map();
  if (!dests) return dec;
  if (typeof dests == 'string')
    for (const ds of dests.split(' ')) {
      dec.set(ds.slice(0, 2), ds.slice(2).match(/.{2}/g) as cg.Key[]);
    }
  else for (const k in dests) dec.set(k, dests[k].match(/.{2}/g) as cg.Key[]);
  return dec;
}

export function getDropDests(fen: string): cg.DropDests {
  const m = parseFen(fen).unwrap(
    s => Shogi.fromSetup(s).unwrap(
      sh => shogigroundDropDests(sh),
      _ => new Map()
    ),
    _ => new Map()
  );
  console.log("DOPRDETS: ", m);
  return m;
}

// {sente: {pawn: 3 queen: 1}, gote: {bishop: 2}}
export function getMaterialDiff(pieces: cg.Pieces): MaterialDiff {
  const diff: MaterialDiff = {
    sente: { king: 0, lance: 0, rook: 0, bishop: 0, knight: 0, pawn: 0 },
    gote: { king: 0, lance: 0, rook: 0, bishop: 0, knight: 0, pawn: 0 },
  };
  for (const p of pieces.values()) {
    const them = diff[opposite(p.color)];
    if (them[p.role] > 0) them[p.role]--;
    else diff[p.color][p.role]++;
  }
  return diff;
}

export function getScore(pieces: cg.Pieces): number {
  let score = 0;
  for (const p of pieces.values()) {
    score += pieceScores[p.role] * (p.color === 'sente' ? 1 : -1);
  }
  return score;
}

export const noChecks: CheckCount = {
  sente: 0,
  gote: 0
}

export function countChecks(steps: Step[], ply: Ply): CheckCount {
  const checks: CheckCount = { ...noChecks };
  for (let step of steps) {
    if (ply < step.ply) break;
    if (step.check) {
      if (step.ply % 2 === 1) checks.sente++;
      else checks.gote++;
    }
  }
  return checks;
}

export function spinner() {
  return h('div.spinner', {
    'aria-label': 'loading'
  }, [
    h('svg', { attrs: { viewBox: '0 0 40 40' } }, [
      h('circle', {
        attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
      })])]);
}
