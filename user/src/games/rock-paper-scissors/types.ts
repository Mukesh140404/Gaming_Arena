export type Choice = "rock" | "paper" | "scissors";

export interface RPSPlayer {
  choice: Choice | null;
  score: number;
  hasChosen?: boolean;
}

export interface RoundResult {
  roundNumber: number;
  choices: Record<string, Choice>;
  winnerId: string | null;
  isDraw: boolean;
}

export interface RPSState {
  players: Record<string, RPSPlayer>;
  playerIds: string[];
  currentRound: number;
  targetScore: number;
  phase: "choosing" | "round-resolved";
  lastRound: RoundResult | null;
  history: RoundResult[];
}

export interface ChoiceCardMeta {
  type: Choice;
  label: string;
  emoji: string;
  description: string;
  beats: string;
  colorScheme: {
    bg: string;
    border: string;
    glow: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
}
