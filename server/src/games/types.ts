// src/games/types.ts
export interface GameEngine<State = any, Action = any> {
  id: string;
  minPlayers: number;
  maxPlayers: number;
  name?: string;

  // Build the starting state from the list of player ids
  createInitialState: (playerIds: string[]) => State;

  // Apply one action from one player and return the new state.
  // Throw an Error if the action is not allowed.
  applyAction: (state: State, playerId: string, action: Action) => State;

  // Return null while the game is running.
  // Return a result object when the game is over.
  getResult: (
    state: State,
  ) => { winnerId: string | null; draw?: boolean } | null;

  // Optional: what a specific player is allowed to see.
  // If not defined, everyone gets the full state.
  getPlayerView?: (state: State, playerId: string) => any;
}
