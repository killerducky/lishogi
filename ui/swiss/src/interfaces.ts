import { VNode } from 'snabbdom/vnode'

export type MaybeVNode = VNode | string | null | undefined;
export type MaybeVNodes = MaybeVNode[];
export type Redraw = () => void;

export interface SwissOpts {
  data: SwissData;
  userId?: string;
  schedule?: boolean;
  element: HTMLElement;
  $side: JQuery;
  socketSend: SocketSend;
  chat: any;
  i18n: any;
  classes: string | null;
}

export interface SwissData {
  id: string;
  name: string;
  createdBy: number;
  startsAt: string;
  clock: Clock;
  variant: string;
  me?: MyInfo;
  canJoin: boolean;
  joinTeam?: string;
  round: number;
  nbRounds: number;
  nbPlayers: number;
  nbOngoing: number;
  status: Status;
  standing: Standing;
  boards: Board[];
  playerInfo?: PlayerExt;
  socketVersion?: number;
  quote?: {
    author: string;
    text: string;
  };
  nextRound?: {
    at: string;
    in: number;
  }
  animal?: {
    name: string;
    url: string;
  }
  podium?: PodiumPlayer[];
  isRecentlyFinished?: boolean;
  stats?: Stats;
}

export type Status = 'created' | 'started' | 'finished';

export interface MyInfo {
  id: string;
  name: string;
  rank: number;
  absent: boolean;
  gameId?: string;
}

export interface PairingBase {
  g: string; // game
  o?: boolean; // ongoing
  w?: boolean; // won
}

export interface Pairing extends PairingBase {
  c: boolean; // color
}
export interface PairingExt extends Pairing {
  user: LightUser;
  rating: number;
}

export interface Standing {
  page: number;
  players: Player[];
}

export type Outcome = "absent" | "late" | "bye";

export interface BasePlayer {
  user: LightUser;
  rating: number;
  provisional?: boolean;
  withdraw?: boolean;
  points: number;
  tieBreak: number;
  performance?: number;
  absent: boolean;
}

export interface PodiumPlayer extends BasePlayer {
}

export interface Player extends BasePlayer {
  rank: number;
  sheetMin: string;
  sheet: (PairingBase | Outcome)[];
}

export interface Board {
  id: string;
  fen: string;
  color: Color;
  lastMove?: string;
  sente: BoardPlayer;
  gote: BoardPlayer;
}

export interface BoardPlayer extends BasePlayer {
  rank: number;
}

export interface PerfType {
  icon: string;
  name: string;
}

export interface Clock {
  limit: number;
  increment: number;
}

export interface Pager {
  nbResults: number;
  nbPages: number;
  from: number;
  to: number;
  currentPageResults: Page;
}

export type Page = Player[];

export interface Pages {
  [n: number]: Page
}

export interface PlayerExt extends Player {
  sheet: (PairingExt | Outcome)[];
}

export interface Stats {
  games: number;
  senteWins: number;
  goteWins: number;
  draws: number;
  byes: number;
  absences: number;
  averageRating: number;
}
