import type { Games } from "@/constants";

export type GameType = typeof Games[number];

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  minPlayers: number;
  maxPlayers: number;
  isActive: boolean;
  createdAt?: string | Date;
}

export type AddGameInput = {
  name: string;
  description?: string;
  minPlayers: number;
  maxPlayers: number;
  isActive?: boolean;
};

export type UpdateGameInput = Partial<AddGameInput> & {
  id: string;
};
