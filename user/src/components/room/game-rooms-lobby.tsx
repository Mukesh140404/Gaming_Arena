import { useState, useMemo, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  Lock,
  Globe,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Trash2,
  Play,
  KeyRound,
  Crown,
  Sparkles,
  Flame,
  ArrowRight
} from "lucide-react";
import {
  roomsOfGameQueryOptions,
  useCreateRoomMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
  useDestroyRoomMutation
} from "@/api/room.queries";
import type { Room, CreateRoomInput, JoinRoomInput } from "@/types/room.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

export interface GameRoomsLobbyProps {
  gameId: string;
  gameName: string;
  gameSlug?: string;
  maxPlayersAllowed?: number;
  description?: string;
  coverImage?: string;
  onStartGame?: (room: Room) => void;
}

export function GameRoomsLobby({
  gameId,
  gameName,
  maxPlayersAllowed = 8,
  description,
  onStartGame,
}: GameRoomsLobbyProps) {
  // 1. Fetch Rooms of this Game
  const {
    data: rooms = [],
    isLoading,
    refetch,
    isRefetching
  } = useQuery(roomsOfGameQueryOptions(gameId));

  const createRoomMutation = useCreateRoomMutation(gameId);
  const joinRoomMutation = useJoinRoomMutation(gameId);
  const leaveRoomMutation = useLeaveRoomMutation(gameId);
  const destroyRoomMutation = useDestroyRoomMutation(gameId);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [joinCandidate, setJoinCandidate] = useState<Room | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

      return matchSearch && matchVisibility;
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

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      const created = await createRoomMutation.mutateAsync({
        ...createForm,
        gameId,
        maxPlayers: Number(createForm.maxPlayers),
      });
      setIsCreateOpen(false);
      setActiveRoom(created);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleJoinByCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCodeForm.roomCode.trim()) return;

    try {
      await joinRoomMutation.mutateAsync(joinCodeForm);
      setIsJoinCodeOpen(false);
      const target = rooms.find((r) => r.roomCode.toLowerCase() === joinCodeForm.roomCode.toLowerCase());
      if (target) {
        setActiveRoom(target);
      }
    } catch {
      // Error handled by mutation
    }
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
      setActiveRoom(room);
    } catch {
      // Error handled by mutation
    }
  };

  const handlePrivateJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCandidate) return;

    try {
      await joinRoomMutation.mutateAsync({
        roomCode: joinCandidate.roomCode,
        password: privatePasswordInput,
      });
      const room = joinCandidate;
      setJoinCandidate(null);
      setActiveRoom(room);
    } catch {
      // Error handled
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    await leaveRoomMutation.mutateAsync(roomId);
    if (activeRoom?.id === roomId) {
      setActiveRoom(null);
    }
  };

  const handleDestroyRoom = async (roomId: string) => {
    await destroyRoomMutation.mutateAsync(roomId);
    if (activeRoom?.id === roomId) {
      setActiveRoom(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied room code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
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
              <Plus className="h-4 w-4 mr-1.5 stroke-[3]" />
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
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                visibilityFilter === "all"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All ({rooms.length})
            </button>
            <button
              onClick={() => setVisibilityFilter("public")}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                visibilityFilter === "public"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setVisibilityFilter("private")}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                visibilityFilter === "private"
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
              <Card
                key={room.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs hover:border-[#FF6562]/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code Badge + Visibility */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(room.roomCode)}
                      className="group/btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200/70 text-gray-700 text-xs font-mono font-bold transition cursor-pointer"
                      title="Click to copy code"
                    >
                      <span>#{room.roomCode}</span>
                      {copiedCode === room.roomCode ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400 group-hover/btn:text-gray-700" />
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {room.visibility === "private" ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-amber-700">
                          <Lock className="h-3 w-3" />
                          Private
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200/70 text-sky-700">
                          <Globe className="h-3 w-3" />
                          Public
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {room.status === "waiting" ? "Waiting" : room.status}
                      </span>
                    </div>
                  </div>

                  {/* Room Name */}
                  <h3 className="font-bold text-base text-[#1F2438] group-hover:text-[#FF6562] transition leading-snug">
                    {room.name}
                  </h3>

                  {/* Player Slot Meter */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                      <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        Slots Filled
                      </span>
                      <span className={isFull ? "text-amber-600" : "text-emerald-600"}>
                        {currentPlayersCount} / {room.maxPlayers}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull ? "bg-amber-500" : "bg-[#FF6562]"
                        }`}
                        style={{
                          width: `${Math.min(100, (currentPlayersCount / room.maxPlayers) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center gap-2">
                  <Button
                    onClick={() => handleDirectJoin(room)}
                    disabled={isFull && room.status !== "waiting"}
                    className={`flex-1 h-9 rounded-xl font-bold text-xs shadow-xs cursor-pointer ${
                      isFull
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "bg-[#FF6562] hover:bg-[#fa534f] text-white shadow-red-200"
                    }`}
                  >
                    <span>{isFull ? "Room Full" : "Join Room"}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveRoom(room)}
                    className="h-9 px-3 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-medium"
                    title="View Room Lobby"
                  >
                    Lobby
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CREATE ROOM MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-50 text-[#FF6562]">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Create Room for {gameName}</DialogTitle>
                <DialogDescription>
                  Configure your squad lobby settings and invite friends.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Room Name */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Room Name *
              </label>
              <Input
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Speed Run Arena"
                className="h-9 text-xs"
              />
            </div>

            {/* Room Code */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Room Code (Auto-generated)
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  value={createForm.roomCode}
                  onChange={(e) => setCreateForm({ ...createForm, roomCode: e.target.value.toUpperCase() })}
                  className="h-9 text-xs font-mono font-bold tracking-wider"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCreateForm({
                      ...createForm,
                      roomCode: `GA-${Math.floor(1000 + Math.random() * 9000)}`,
                    })
                  }
                  className="h-9 px-3 text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Visibility Selector */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Visibility Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, visibility: "public" })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    createForm.visibility === "public"
                      ? "border-[#FF6562] bg-red-50/60 text-[#FF6562]"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>Public</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, visibility: "private" })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    createForm.visibility === "private"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span>Private</span>
                </button>
              </div>
            </div>

            {/* Password input if private */}
            {createForm.visibility === "private" && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Room Password *
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Enter secret room password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Max Players */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Max Players: <span className="text-[#FF6562]">{createForm.maxPlayers}</span>
                </label>
                <span className="text-[10px] text-gray-400">Up to {maxPlayersAllowed} players</span>
              </div>
              <input
                type="range"
                min="2"
                max={maxPlayersAllowed}
                value={createForm.maxPlayers}
                onChange={(e) => setCreateForm({ ...createForm, maxPlayers: Number(e.target.value) })}
                className="w-full accent-[#FF6562] cursor-pointer"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createRoomMutation.isPending}
                className="bg-[#FF6562] hover:bg-[#fa534f] text-white font-bold"
              >
                {createRoomMutation.isPending ? "Creating..." : "Create Room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 3. JOIN WITH CODE MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isJoinCodeOpen} onOpenChange={setIsJoinCodeOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gray-100 text-gray-800">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Join Room by Code</DialogTitle>
                <DialogDescription>
                  Enter the room invite code to join directly.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleJoinByCodeSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Room Code *
              </label>
              <Input
                required
                placeholder="e.g. GA-4921"
                value={joinCodeForm.roomCode}
                onChange={(e) => setJoinCodeForm({ ...joinCodeForm, roomCode: e.target.value.toUpperCase() })}
                className="h-10 text-sm font-mono font-bold uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Password (if private room)
              </label>
              <Input
                type="password"
                placeholder="Optional room password"
                value={joinCodeForm.password}
                onChange={(e) => setJoinCodeForm({ ...joinCodeForm, password: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsJoinCodeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={joinRoomMutation.isPending}
                className="bg-[#FF6562] hover:bg-[#fa534f] text-white font-bold"
              >
                {joinRoomMutation.isPending ? "Joining..." : "Enter Room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <Input
                type="password"
                required
                placeholder="Enter room password"
                value={privatePasswordInput}
                onChange={(e) => setPrivatePasswordInput(e.target.value)}
                className="h-10 text-sm"
              />
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

      {/* ========================================================================= */}
      {/* 5. ACTIVE ROOM LOBBY DETAILS MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!activeRoom} onOpenChange={(open) => !open && setActiveRoom(null)}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-[#FF6562]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle>{activeRoom?.name}</DialogTitle>
                  <DialogDescription>
                    Game: <span className="font-semibold text-gray-700">{gameName}</span>
                  </DialogDescription>
                </div>
              </div>

              {activeRoom && (
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeRoom.roomCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-800 transition"
                  title="Copy code"
                >
                  <span>#{activeRoom.roomCode}</span>
                  {copiedCode === activeRoom.roomCode ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-500" />
                  )}
                </button>
              )}
            </div>
          </DialogHeader>

          {activeRoom && (
            <div className="space-y-4">
              {/* Status Bar */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-gray-700">
                    Status: <span className="text-emerald-600 capitalize">{activeRoom.status}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span>
                    {(activeRoom.roomPlayersList?.length || 1)} / {activeRoom.maxPlayers} Players
                  </span>
                </div>
              </div>

              {/* Players List in Lobby */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Players in Room
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(activeRoom.roomPlayersList && activeRoom.roomPlayersList.length > 0
                    ? activeRoom.roomPlayersList
                    : [
                        {
                          id: "host-player-1",
                          roomId: activeRoom.id,
                          userId: activeRoom.hostId,
                          role: "host" as const,
                          status: "active" as const,
                          joinedAt: activeRoom.createdAt,
                          name: "Room Host",
                        },
                      ]
                  ).map((player, idx) => (
                    <div
                      key={player.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-[#FF6562] font-bold text-xs">
                          {player.name ? player.name.charAt(0).toUpperCase() : `P${idx + 1}`}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">
                            {player.name || `Player ${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {player.role === "host" ? "Room Leader" : "Challenger"}
                          </span>
                        </div>
                      </div>

                      {player.role === "host" && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          <Crown className="h-3 w-3" /> Host
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLeaveRoom(activeRoom.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50 h-9 rounded-xl text-xs font-bold"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Leave Room
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDestroyRoom(activeRoom.id)}
                    className="border-gray-200 text-gray-600 hover:bg-gray-100 h-9 rounded-xl text-xs font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Destroy
                  </Button>

                  {onStartGame && (
                    <Button
                      size="sm"
                      onClick={() => onStartGame(activeRoom)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-xl text-xs shadow-xs"
                    >
                      <Play className="h-3.5 w-3.5 mr-1 fill-white" />
                      Start Game
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
