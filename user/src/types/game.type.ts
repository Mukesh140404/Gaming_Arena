export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  minPlayers: number;
  maxPlayers: number;
  isActive: boolean;
  coverImage?: string;
  category?: string;
  hourlyRate?: number;
  createdAt?: string | Date;
}

export type AddGameInput = {
  name: string;
  description?: string;
  minPlayers: number;
  maxPlayers: number;
  isActive?: boolean;
  coverImage?: string;
  category?: string;
  hourlyRate?: number;
};

export type UpdateGameInput = Partial<AddGameInput> & {
  id: string;
};
