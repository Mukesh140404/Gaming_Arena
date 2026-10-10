import { api } from "./axios";
import type { Room, CreateRoomInput, JoinRoomInput, RoomPlayer } from "../types/room.type";

// 1. Create Room (POST /rooms)
export async function createRoomApi(input: CreateRoomInput): Promise<Room> {
  const generatedCode = input.roomCode || "RM-" + Math.random().toString(36).substring(2, 7).toUpperCase();
  
  const payload = {
    name: input.name,
    gameId: input.gameId,
    roomCode: generatedCode,
    visibility: input.visibility || "public",
    passwordHash: input.password || input.passwordHash || null,
    maxPlayers: Number(input.maxPlayers) || 4,
  };

  const res = await api.post("/rooms", payload);
  if (res.data?.data) {
    return res.data.data;
  }
  throw new Error("Failed to create room");
}

// 2. Get All Rooms of Game (GET /rooms/game/:gameId)
export async function fetchRoomsOfGame(gameId: string): Promise<Room[]> {
  if (!gameId) return [];

  try {
    const res = await api.get(`/rooms/game/${gameId}`);
    if (res.data?.data) {
      return Array.isArray(res.data.data) ? res.data.data : [res.data.data];
    }
  } catch (err) {
    console.error("Failed to fetch rooms of game:", err);
  }

  return [];
}

// 3. Get Single Room Details (GET /rooms/:roomId)
export async function fetchRoomById(roomId: string): Promise<Room | null> {
  if (!roomId) return null;

  try {
    const res = await api.get(`/rooms/${roomId}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch room by id:", err);
  }

  return null;
}

// 4. Join Room (POST /rooms/join)
export async function joinRoomApi(input: JoinRoomInput): Promise<RoomPlayer> {
  const res = await api.post("/rooms/join", input);
  if (res.data?.data) {
    return res.data.data;
  }
  throw new Error("Failed to join room");
}

// 5. Leave Room (GET/POST /rooms/leave/:roomId)
export async function leaveRoomApi(roomId: string): Promise<void> {
  if (!roomId) return;
  try {
    await api.get(`/rooms/leave/${roomId}`);
  } catch {
    await api.post(`/rooms/leave/${roomId}`);
  }
}

// 6. Destroy Room (GET/POST /rooms/destroy/:roomId)
export async function destroyRoomApi(roomId: string): Promise<void> {
  if (!roomId) return;
  try {
    await api.get(`/rooms/destroy/${roomId}`);
  } catch {
    await api.post(`/rooms/destroy/${roomId}`);
  }
}
