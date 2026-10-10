import { useState, useMemo, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Lock,
  RefreshCw,
  KeyRound,
  Flame,
  EyeOff,
  Eye
} from "lucide-react";
import {
  roomsOfGameQueryOptions,
  useJoinRoomMutation,
} from "@/hooks/useRoom";
import type { Room, CreateRoomInput, JoinRoomInput } from "@/types/room.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import CreateRoomDialog from "../dialogs/create-room-model";
import JoinRoomDialog from "../dialogs/join-room-model";
import GameCard from "../game-cards";

export interface GameRoomsLobbyProps {
  gameId: string;
  gameName: string;
  gameSlug?: string;
  maxPlayersAllowed?: number;
  description?: string;
  coverImage?: string;
}

export function GameRoomsLobby({
  gameId,
  gameName,
  maxPlayersAllowed = 8,
  description,
}: GameRoomsLobbyProps) {
  const navigate = useNavigate();

  // 1. Fetch Rooms of this Game
  const {
    data: rooms = [],
    isLoading,
    refetch,
    isRefetching
  } = useQuery(roomsOfGameQueryOptions(gameId));

  const joinRoomMutation = useJoinRoomMutation(gameId);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false);
  const [joinCandidate, setJoinCandidate] = useState<Room | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState<CreateRoomInput>(() => ({
    name: `${gameName} Match`,
    gameId: gameId,
    roomCode: `GA-${Math.floor(1000 + Math.random() * 9000)}`,
    visibility: "public",
    password: "",
    maxPlayers: Math.min(4, maxPlayersAllowed),
  }));

  const [joinCodeForm, setJoinCodeForm] = useState<JoinRoomInput>({
    roomCode: "",
    password: "",
  });

  const [privatePasswordInput, setPrivatePasswordInput] = useState("");

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.roomCode.toLowerCase().includes(q);

      const matchVisibility =
        visibilityFilter === "all" || r.visibility === visibilityFilter;

      const statusFilter = r.status === "waiting";

      return matchSearch && matchVisibility && statusFilter;
    });
  }, [rooms, searchQuery, visibilityFilter]);

  // Handlers
  const handleOpenCreate = () => {
    setCreateForm({
      name: `${gameName} Squad`,
      gameId: gameId,
      roomCode: `GA-${Math.floor(1000 + Math.random() * 9000)}`,
      visibility: "public",
      password: "",
      maxPlayers: Math.min(4, maxPlayersAllowed),
    });
    setIsCreateOpen(true);
  };

  const handleDirectJoin = async (room: Room) => {
    if (room.visibility === "private") {
      setJoinCandidate(room);
      setPrivatePasswordInput("");
      return;
    }

    try {
      await joinRoomMutation.mutateAsync({
        roomCode: room.roomCode,
      });
    } catch {
      // Already in room or public entrance
    }

    navigate({
      to: "/room/$id",
      params: { id: room.id },
    });
  };

  const handlePrivateJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCandidate) return;

    try {
      await joinRoomMutation.mutateAsync({
        roomCode: joinCandidate.roomCode,
        password: privatePasswordInput,
      });
      const targetId = joinCandidate.id;
      setJoinCandidate(null);
      navigate({
        to: "/room/$id",
        params: { id: targetId },
      });
    } catch {
      // Error handled
    }
  };

  return (
    <div className="space-y-6">

      {/* Hero Banner for Game Lobby */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 sm:p-7 backdrop-blur-xl shadow-lg shadow-red-950/5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-linear-to-br from-[#FF6562]/20 via-amber-200/20 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="mono" className="text-[10px] tracking-wider uppercase font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                Live Multiplayer Lobby
              </Badge>
              <span className="text-xs text-gray-400 font-mono">
                {rooms.length} {rooms.length === 1 ? "room" : "rooms"} active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1F2438]">
              {gameName} <span className="text-[#FF6562]">Rooms</span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-xl">
              {description || `Join a public room, create your own custom squad lobby, or invite friends using a private room code.`}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsJoinCodeOpen(true)}
              className="flex-1 sm:flex-none border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs h-10 px-4 rounded-xl shadow-xs"
            >
              <KeyRound className="h-4 w-4 mr-1.5 text-gray-500" />
              Join with Code
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-none bg-[#FF6562] hover:bg-[#fa534f] text-white font-black text-xs h-10 px-5 rounded-xl shadow-md shadow-red-200 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5 stroke-3" />
              Create Room
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-gray-200/80 bg-white/90 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search rooms by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs border-gray-200 rounded-xl bg-gray-50/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl border border-gray-200 bg-gray-50 text-xs">
            <button
              onClick={() => setVisibilityFilter("all")}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${visibilityFilter === "all"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
                }`}
            >
              All ({rooms.length})
            </button>
            <button
              onClick={() => setVisibilityFilter("public")}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${visibilityFilter === "public"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Public
            </button>
            <button
              onClick={() => setVisibilityFilter("private")}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${visibilityFilter === "private"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Private
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="h-9 w-9 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            title="Refresh Rooms"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin text-[#FF6562]" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Rooms Grid / Empty State */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-200/80 p-8 shadow-xs">
          <RefreshCw className="h-7 w-7 text-[#FF6562] animate-spin mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading {gameName} rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="py-16 px-6 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300 p-8 shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#FF6562] mb-4">
            <Flame className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-[#1F2438]">
            No rooms found for {gameName}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
            {searchQuery
              ? `No rooms matched "${searchQuery}". Clear your search or create a new room.`
              : `Be the first player to create a room for this game and battle with others!`}
          </p>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#FF6562] hover:bg-[#fa534f] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shadow-red-200"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create First Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const currentPlayersCount = room.activePlayersCount ?? (room.roomPlayersList?.length || 1);
            const isFull = currentPlayersCount >= room.maxPlayers;

            return (
              <GameCard
                key={room.id}
                room={room}
                isFull={isFull}
                currentPlayersCount={currentPlayersCount}
                handleDirectJoin={handleDirectJoin}
              />
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CREATE ROOM MODAL */}
      {/* ========================================================================= */}

      <CreateRoomDialog
        isCreateOpen={isCreateOpen}
        gameId={gameId}
        setIsCreateOpen={setIsCreateOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        gameName={gameName}
        maxPlayersAllowed={maxPlayersAllowed}
      />

      {/* ========================================================================= */}
      {/* 3. JOIN WITH CODE MODAL */}
      {/* ========================================================================= */}

      <JoinRoomDialog
        isJoinCodeOpen={isJoinCodeOpen}
        setIsJoinCodeOpen={setIsJoinCodeOpen}
        gameId={gameId}
        joinCodeForm={joinCodeForm}
        setJoinCodeForm={setJoinCodeForm}
        rooms={rooms}
        maxPlayersAllowed={maxPlayersAllowed}
      />

      {/* ========================================================================= */}
      {/* 4. PRIVATE ROOM PASSWORD PROMPT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!joinCandidate} onOpenChange={(open) => !open && setJoinCandidate(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Private Room Password</DialogTitle>
                <DialogDescription>
                  "{joinCandidate?.name}" requires a password to join.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handlePrivateJoinSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Password *
              </label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showLoginPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={privatePasswordInput}
                  required
                  onChange={(e) => setPrivatePasswordInput(e.target.value)}
                  placeholder="Enter room password"
                  className="w-full rounded-xl border border-gray-200 bg-white/95 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setJoinCandidate(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={joinRoomMutation.isPending}
                className="bg-[#FF6562] hover:bg-[#fa534f] text-white font-bold"
              >
                {joinRoomMutation.isPending ? "Verifying..." : "Join"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
