export type RoomVisibility = "public" | "private";
export type RoomStatus = "waiting" | "started" | "finished";
export type PlayerRole = "host" | "player";
export type PlayerStatus = "active" | "left";

export interface RoomPlayer {
  id: string;
  roomId: string;
  userId: string;
  role: PlayerRole;
  status: PlayerStatus;
  joinedAt: string | Date;
  leftAt?: string | Date | null;
  name?: string;
  email?: string;
}

export interface Room {
  id: string;
  roomCode: string;
  gameId: string;
  hostId: string;
  name: string;
  visibility: RoomVisibility;
  passwordHash?: string | null;
  status: RoomStatus;
  maxPlayers: number;
  createdAt: string | Date;
  startedAt?: string | Date | null;
  finishedAt?: string | Date | null;
  // Computed UI properties
  roomPlayersList?: RoomPlayer[];
  activePlayersCount?: number;
}

export interface CreateRoomInput {
  name: string;
  gameId: string;
  roomCode?: string;
  visibility?: RoomVisibility;
  password?: string;
  passwordHash?: string;
  maxPlayers: number;
}

export interface JoinRoomInput {
  roomCode: string;
  password?: string;
}
