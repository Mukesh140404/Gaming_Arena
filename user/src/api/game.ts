import { api } from "./axios";
import type { Game, AddGameInput, UpdateGameInput } from "../types/game.type";

const STORAGE_KEY = "gaming_arena_admin_games";

const INITIAL_DEFAULT_GAMES: Game[] = [
  {
    id: "g-1",
    name: "Valorant",
    slug: "valorant",
    description: "5v5 character-based tactical FPS where precise gunplay meets unique agent abilities.",
    minPlayers: 1,
    maxPlayers: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "g-2",
    name: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    description: "Open-world action-adventure RPG set in the dystopian megalopolis of Night City.",
    minPlayers: 1,
    maxPlayers: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "g-3",
    name: "EA SPORTS FC 24",
    slug: "ea-sports-fc-24",
    description: "The next chapter in the world's game featuring HyperMotionV technology and cross-play.",
    minPlayers: 1,
    maxPlayers: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "g-4",
    name: "Tekken 8",
    slug: "tekken-8",
    description: "Fist Meets Fate. Next-gen 3D fighting action with aggressive new combat mechanics.",
    minPlayers: 1,
    maxPlayers: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "g-5",
    name: "Counter-Strike 2",
    slug: "counter-strike-2",
    description: "The largest technical leap forward in Counter-Strike history built on the Source 2 engine.",
    minPlayers: 1,
    maxPlayers: 10,
    isActive: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "g-6",
    name: "Forza Horizon 5",
    slug: "forza-horizon-5",
    description: "Lead breathtaking expeditions across the vibrant and ever-evolving landscapes of Mexico.",
    minPlayers: 1,
    maxPlayers: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

function getStoredGames(): Game[] {
  if (typeof window === "undefined") return INITIAL_DEFAULT_GAMES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_GAMES));
      return INITIAL_DEFAULT_GAMES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEFAULT_GAMES;
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
  } catch {
    // API server may be offline; fallback to storage
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
  } catch {
    // Fallback
  }
  const all = getStoredGames();
  return all.find((g) => g.id === id) || null;
}

// 3. Add Game (POST /games)
export async function createGame(input: AddGameInput): Promise<Game> {
  const localSlug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const localGame: Game = {
    id: "game-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: input.name,
    slug: localSlug,
    description: input.description || "",
    minPlayers: Number(input.minPlayers) || 1,
    maxPlayers: Number(input.maxPlayers) || 4,
    isActive: input.isActive ?? true,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await api.post("/games", {
      name: input.name,
      description: input.description,
      minPlayers: Number(input.minPlayers),
      maxPlayers: Number(input.maxPlayers),
      isActive: input.isActive ?? true,
    });
    if (res.data?.data) {
      const serverGame: Game = {
        ...localGame,
        ...res.data.data,
      };
      const all = getStoredGames();
      saveStoredGames([serverGame, ...all.filter(g => g.id !== serverGame.id)]);
      return serverGame;
    }
  } catch {
    // Fallback
  }

  const all = getStoredGames();
  saveStoredGames([localGame, ...all]);
  return localGame;
}

// 4. Update Game (PATCH/PUT /games/:id)
export async function updateGameApi(input: UpdateGameInput): Promise<Game> {
  const all = getStoredGames();
  const existing = all.find(g => g.id === input.id);
  const updated: Game = {
    ...(existing || ({} as Game)),
    ...input,
    id: input.id,
    name: input.name ?? (existing?.name || "Game"),
    slug: input.name ? input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") : (existing?.slug || "game"),
    description: input.description !== undefined ? input.description : (existing?.description || ""),
    minPlayers: input.minPlayers !== undefined ? Number(input.minPlayers) : (existing?.minPlayers || 1),
    maxPlayers: input.maxPlayers !== undefined ? Number(input.maxPlayers) : (existing?.maxPlayers || 4),
    isActive: input.isActive !== undefined ? input.isActive : (existing?.isActive ?? true),
  };

  try {
    const res = await api.patch(`/games/${input.id}`, {
      name: input.name,
      description: input.description,
      minPlayers: input.minPlayers,
      maxPlayers: input.maxPlayers,
      isActive: input.isActive,
    });
    if (res.data?.data) {
      const merged = { ...updated, ...res.data.data };
      saveStoredGames(all.map(g => (g.id === input.id ? merged : g)));
      return merged;
    }
  } catch {
    // Fallback
  }

  saveStoredGames(all.map(g => (g.id === input.id ? updated : g)));
  return updated;
}

// 5. Delete Game (DELETE /games/:id)
export async function deleteGameApi(id: string): Promise<{ id: string }> {
  try {
    await api.delete(`/games/${id}`);
  } catch {
    // Fallback
  }

  const all = getStoredGames();
  saveStoredGames(all.filter(g => g.id !== id));
  return { id };
}
