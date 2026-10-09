import { api } from "./axios";
import type { Room, CreateRoomInput, JoinRoomInput, RoomPlayer } from "../types/room.type";

const STORAGE_ROOMS_KEY = "gaming_arena_rooms_cache";

function getLocalRooms(): Room[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_ROOMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRooms(rooms: Room[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
  } catch (err) {
    console.error("Failed to save rooms to localStorage", err);
  }
}

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

  try {
    const res = await api.post("/rooms", payload);
    if (res.data?.data) {
      const room = res.data.data;
      const all = getLocalRooms();
      saveLocalRooms([room, ...all.filter((r) => r.id !== room.id)]);
      return room;
    }
  } catch {
    // Local fallback
  }

  const localRoom: Room = {
    id: "room-" + Date.now().toString(36),
    roomCode: generatedCode,
    gameId: input.gameId,
    hostId: "user-current",
    name: input.name,
    visibility: input.visibility || "public",
    passwordHash: input.password || null,
    status: "waiting",
    maxPlayers: Number(input.maxPlayers) || 4,
    createdAt: new Date().toISOString(),
    roomPlayersList: [
      {
        id: "rp-" + Date.now(),
        roomId: "room-" + Date.now().toString(36),
        userId: "user-current",
        role: "host",
        status: "active",
        joinedAt: new Date().toISOString(),
        name: "You (Host)",
      },
    ],
    activePlayersCount: 1,
  };

  const all = getLocalRooms();
  saveLocalRooms([localRoom, ...all]);
  return localRoom;
}

// 2. Get All Rooms of Game (GET /rooms/game/:gameId)
export async function fetchRoomsOfGame(gameId: string): Promise<Room[]> {
  try {
    // Try the specific game endpoint first
    const res = await api.get(`/rooms/game/${gameId}`);
    if (res.data?.data) {
      const serverRooms = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
      const all = getLocalRooms();
      // Sync cache
      const otherRooms = all.filter((r) => r.gameId !== gameId);
      saveLocalRooms([...serverRooms, ...otherRooms]);
      return serverRooms;
    }
  } catch {
    try {
      // Fallback try /rooms/:gameId
      const fallbackRes = await api.get(`/rooms/${gameId}`);
      if (fallbackRes.data?.data && Array.isArray(fallbackRes.data.data)) {
        return fallbackRes.data.data;
      }
    } catch {
      // API offline
    }
  }

  // Fallback to local storage filtered by gameId
  const all = getLocalRooms();
  const filtered = all.filter((r) => r.gameId === gameId || r.gameId === "all");
  
  if (filtered.length === 0) {
    // Seed sample demo rooms for this game so UI looks vibrant on first load
    const demoRooms: Room[] = [
      {
        id: `demo-${gameId}-1`,
        roomCode: `GA-${Math.floor(1000 + Math.random() * 9000)}`,
        gameId: gameId,
        hostId: "host-1",
        name: "Casual Play & Practice",
        visibility: "public",
        status: "waiting",
        maxPlayers: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        roomPlayersList: [
          { id: "p1", roomId: `demo-${gameId}-1`, userId: "host-1", role: "host", status: "active", joinedAt: new Date().toISOString(), name: "ShadowSniper" },
          { id: "p2", roomId: `demo-${gameId}-1`, userId: "user-2", role: "player", status: "active", joinedAt: new Date().toISOString(), name: "CyberViper" },
        ],
        activePlayersCount: 2,
      },
      {
        id: `demo-${gameId}-2`,
        roomCode: `GA-${Math.floor(1000 + Math.random() * 9000)}`,
        gameId: gameId,
        hostId: "host-2",
        name: "Ranked Competitive Lobby",
        visibility: "public",
        status: "waiting",
        maxPlayers: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        roomPlayersList: [
          { id: "p3", roomId: `demo-${gameId}-2`, userId: "host-2", role: "host", status: "active", joinedAt: new Date().toISOString(), name: "AceStriker" },
        ],
        activePlayersCount: 1,
      },
    ];
    saveLocalRooms([...all, ...demoRooms]);
    return demoRooms;
  }

  return filtered;
}

// 3. Get Single Room Details (GET /rooms/:roomId)
export async function fetchRoomById(roomId: string): Promise<Room | null> {
  try {
    const res = await api.get(`/rooms/${roomId}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch {
    // Fallback
  }

  const all = getLocalRooms();
  return all.find((r) => r.id === roomId) || null;
}

// 4. Join Room (POST /rooms/join)
export async function joinRoomApi(input: JoinRoomInput): Promise<RoomPlayer> {
  try {
    const res = await api.post("/rooms/join", input);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch {
    // Fallback
  }

  // Local join update
  const all = getLocalRooms();
  const room = all.find((r) => r.roomCode.toLowerCase() === input.roomCode.toLowerCase());
  
  if (!room) {
    throw new Error("Room code not found");
  }

  if (room.visibility === "private" && room.passwordHash && room.passwordHash !== input.password) {
    throw new Error("Invalid room password");
  }

  const newPlayer: RoomPlayer = {
    id: "rp-" + Date.now(),
    roomId: room.id,
    userId: "user-current",
    role: "player",
    status: "active",
    joinedAt: new Date().toISOString(),
    name: "You",
  };

  const currentPlayers = room.roomPlayersList || [];
  const updatedPlayers = [...currentPlayers.filter((p) => p.userId !== "user-current"), newPlayer];
  
  const updatedRoom = {
    ...room,
    roomPlayersList: updatedPlayers,
    activePlayersCount: updatedPlayers.filter((p) => p.status === "active").length,
  };

  saveLocalRooms(all.map((r) => (r.id === room.id ? updatedRoom : r)));
  return newPlayer;
}

// 5. Leave Room (POST /rooms/leave/:roomId)
export async function leaveRoomApi(roomId: string): Promise<void> {
  try {
    await api.post(`/rooms/leave/${roomId}`);
  } catch {
    // Fallback
  }

  const all = getLocalRooms();
  const room = all.find((r) => r.id === roomId);
  if (room && room.roomPlayersList) {
    const updatedPlayers = room.roomPlayersList.filter((p) => p.userId !== "user-current");
    const updatedRoom = {
      ...room,
      roomPlayersList: updatedPlayers,
      activePlayersCount: updatedPlayers.filter((p) => p.status === "active").length,
    };
    saveLocalRooms(all.map((r) => (r.id === roomId ? updatedRoom : r)));
  }
}

// 6. Destroy Room (POST /rooms/destroy/:roomId)
export async function destroyRoomApi(roomId: string): Promise<void> {
  try {
    await api.post(`/rooms/destroy/${roomId}`);
  } catch {
    // Fallback
  }

  const all = getLocalRooms();
  saveLocalRooms(all.filter((r) => r.id !== roomId));
}
