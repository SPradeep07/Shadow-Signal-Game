export type GameMode = 'infiltrator' | 'spy';

export type Role = 'citizen' | 'infiltrator' | 'agent' | 'spy';

export type GameState = 'lobby' | 'playing' | 'finished';

export interface Player {
  id: string;
  name: string;
}

export interface Room {
  code: string;
  host: string;
  players: Player[];
  gameState: GameState;
  gameMode: GameMode | null;
  currentRound: number;
  currentSpeaker: string | null;
  speakingPhase: boolean;
  votingPhase: boolean;
  votes: Record<string, string>;
  eliminated: string[];
  words: Record<string, string | null>;
  roles: Record<string, Role>;
  speakingStartTime?: number;
  winner?: string;
}

export interface WordData {
  domains: {
    name: string;
    words: {
      word: string;
      similar: string[];
    }[];
  }[];
}
