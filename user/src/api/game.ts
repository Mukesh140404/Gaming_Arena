import { api } from "./axios";
import type { Game, AddGameInput, UpdateGameInput } from "../types/game.type";

const STORAGE_KEY = "gaming_arena_admin_games";

function getStoredGames(): Game[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any previous dummy/mock games
      return parsed.filter((g) => g && typeof g.id === "string" && !g.id.startsWith("g-") && !g.id.startsWith("game-"));
    }
    return [];
  } catch {
    return [];
  }
}

function saveStoredGames(games: Game[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (err) {
    console.error("Failed to save games to localStorage:", err);
  }
}

// 1. All List (GET /games)
export async function fetchAllGames(): Promise<Game[]> {
  try {
    const res = await api.get("/games");
    if (res.data?.data && Array.isArray(res.data.data)) {
      saveStoredGames(res.data.data);
      return res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch games from API:", err);
  }
  return getStoredGames();
}

// 2. Single List / Item (GET /games/:id)
export async function fetchGameById(id: string): Promise<Game | null> {
  try {
    const res = await api.get(`/games/${id}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch game by id:", err);
  }
  const all = getStoredGames();
  return all.find((g) => g.id === id) || null;
}

// 3. Add Game (POST /games)
export async function createGame(input: AddGameInput): Promise<Game> {
  const res = await api.post("/games", {
    name: input.name,
    description: input.description,
    minPlayers: Number(input.minPlayers),
    maxPlayers: Number(input.maxPlayers),
    isActive: input.isActive ?? true,
  });

  if (res.data?.data) {
    const serverGame = res.data.data;
    const all = getStoredGames();
    saveStoredGames([serverGame, ...all.filter((g) => g.id !== serverGame.id)]);
    return serverGame;
  }
  throw new Error("Failed to create game");
}

// 4. Update Game (PATCH/PUT /games/:id)
export async function updateGameApi(input: UpdateGameInput): Promise<Game> {
  const res = await api.patch(`/games/${input.id}`, {
    name: input.name,
    description: input.description,
    minPlayers: input.minPlayers,
    maxPlayers: input.maxPlayers,
    isActive: input.isActive,
  });

  if (res.data?.data) {
    const updated = res.data.data;
    const all = getStoredGames();
    saveStoredGames(all.map((g) => (g.id === input.id ? updated : g)));
    return updated;
  }
  throw new Error("Failed to update game");
}

// 5. Delete Game (DELETE /games/:id)
export async function deleteGameApi(id: string): Promise<{ id: string }> {
  await api.delete(`/games/${id}`);
  const all = getStoredGames();
  saveStoredGames(all.filter((g) => g.id !== id));
  return { id };
}
