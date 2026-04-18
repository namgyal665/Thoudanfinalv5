export type Screen = 
  | 'home' 
  | 'setup' 
  | 'game' 
  | 'endgame' 
  | 'settle' 
  | 'profiles' 
  | 'profile-edit' 
  | 'profile-view' 
  | 'history' 
  | 'history-detail' 
  | 'debts';

export type WinCondition = '1000' | 'high';
export type SessionMode = 'session' | 'single';

export interface Profile {
  id: string;
  name: string;
  bio: string;
  colorIdx: number;
  photo: string | null; // base64
  wins: number;
  games: number;
  mw: number; // money won
  ml: number; // money lost
}

export interface Round {
  points: Record<number, number>; // playerIndex -> points
  ds: Record<number, 'none' | 'success' | 'fail'>; // playerIndex -> declaration state
}

export interface Game {
  id: string;
  players: string[]; // name or profileId
  finalScores: number[];
  rounds: Round[];
  payouts: PayoutDetail[];
  date: string;
  winnerIndex: number;
}

export interface PayoutDetail {
  from: string;
  to: string;
  amount: number;
  reason?: string;
}

export interface Session {
  id: string;
  date: string;
  mode: SessionMode;
  players: string[];
  games: Game[];
  payoutConfig: Record<string, number>; // p0, p1...
  payments: Payment[]; // resolved/unresolved debts
}

export interface Payment {
  id: string;
  from: string;
  to: string;
  amount: number;
  paid: boolean;
  sessionId: string;
}

export interface AppState {
  screen: Screen;
  mode: SessionMode;
  wc: WinCondition;
  gp: string[]; // current game player names/ids
  po: Record<string, number>; // payouts config {p0, p1, p2, p3, p4}
  games: Game[]; // completed games this session
  cg: Game | null; // current game
  cr: number; // current round number
  ds: Record<number, 'none' | 'success' | 'fail'>; // declaration states
  sessions: Session[];
  profiles: Profile[];
  pp: Payment[]; // pending payments for current settlement
  spids: string[]; // selected profile IDs
  guests: string[]; // guest player names
  vid: string | null; // viewed profile ID
  eid: string | null; // editing profile ID
  eph: string | null; // editing photo
  ec: number; // editing color index
  historyId: string | null; // for history detail
}
