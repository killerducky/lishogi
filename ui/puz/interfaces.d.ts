/// <reference types="lishogi" />
import { Role } from 'shogiground/types';
import { VNode } from 'snabbdom/vnode';
import { Clock } from './clock';
import { Combo } from './combo';
import CurrentPuzzle from './current';
export declare type MaybeVNode = VNode | string | null | undefined;
export declare type MaybeVNodes = MaybeVNode[];
export declare type Redraw = () => void;
export interface Promotion {
    start(orig: Key, dest: Key, callback: (orig: Key, dest: Key, prom: Role) => void): boolean;
    cancel(): void;
    view(): MaybeVNode;
}
export interface PuzPrefs {
    coords: 0 | 1 | 2;
    is3d: boolean;
    destination: boolean;
    rookCastle: boolean;
    moveEvent: number;
    highlight: boolean;
}
export declare type UserMove = (orig: Key, dest: Key) => void;
export interface Puzzle {
    id: string;
    fen: string;
    line: string;
    rating: number;
}
export interface Run {
    pov: Color;
    moves: number;
    errors: number;
    current: CurrentPuzzle;
    clock: Clock;
    history: Round[];
    combo: Combo;
    modifier: Modifier;
    endAt?: number;
}
export interface Round {
    puzzle: Puzzle;
    win: boolean;
    millis: number;
}
export interface Modifier {
    moveAt: number;
    malus?: TimeMod;
    bonus?: TimeMod;
}
export interface TimeMod {
    seconds: number;
    at: number;
}
export interface Config {
    clock: {
        initial: number;
        malus: number;
    };
    combo: {
        levels: [number, number][];
    };
}
