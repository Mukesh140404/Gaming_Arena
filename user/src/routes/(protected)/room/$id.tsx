import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Copy,
  Check,
  Crown,
  LogOut,
  Trash2,
  Play,
  ArrowLeft,
  Lock,
  Globe,
  Sparkles,
  RefreshCw,
  Clock,
  Gamepad2,
  UserCheck,
} from "lucide-react";
import {
  singleRoomQueryOptions,
  useLeaveRoomMutation,
  useDestroyRoomMutation,
  useUpdateRoomMutation,
} from "@/hooks/useRoom";
import { currentUserQueryOptions, useCurrentUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { onLeaveRoomLobby } from "@/lib/utils";
import { RoomMessageBox } from "@/components/room/room-message-box";
import { useWebSocket } from "@/hooks/useWebSocket";
import GameWrapper from "@/games/game-wrapper";

export const Route = createFileRoute("/(protected)/room/$id")({
  component: SingleRoomLobbyRoute,
  onLeave: async ({ params, context }) => {
    const roomId = params.id;
    const user = await context.queryClient.ensureQueryData(
      currentUserQueryOptions,
    );
    console.log("user", user);
    await onLeaveRoomLobby(roomId, user.id);
  },
});

function SingleRoomLobbyRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: currentUser } = useCurrentUser();
  const {
    data: room,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery(singleRoomQueryOptions(id));

  const leaveRoomMutation = useLeaveRoomMutation(room?.gameId);
  const destroyRoomMutation = useDestroyRoomMutation(room?.gameId);
  const updateRoomMutation = useUpdateRoomMutation();
  const [copiedCode, setCopiedCode] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const { connected, sendMessage, roomMessages, isGameStarted } =
    useWebSocket();
  const currentRoomMessages = roomMessages.filter((m) => m.roomId === id);

  useEffect(() => {
    if (room?.status === "finished") {
      navigate({
        to: "/dashboard",
      });
    }
  }, [room]);

  useEffect(() => {
    if (id && connected) {
      sendMessage({
        type: "JOIN_ROOM",
        roomId: id,
      });
    }
  }, [id, connected, sendMessage]);
  useEffect(() => {
    if (!isGameStarted) {
      setShowGame(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowGame(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isGameStarted]);

  const handleCopyCode = () => {
    if (!room?.roomCode) return;
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    toast.success(`Copied room code: #${room.roomCode}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeave = async () => {
    if (!room) return;
    try {
      await leaveRoomMutation.mutateAsync(room.id);
      navigate({ to: "/dashboard" });
    } catch {
      navigate({ to: "/dashboard" });
    }
  };

  const handleDestroy = async () => {
    if (!room) return;
    try {
      await destroyRoomMutation.mutateAsync(room.id);
      navigate({ to: "/dashboard" });
    } catch {
      navigate({ to: "/dashboard" });
    }
  };

  const handleStartGame = async () => {
    try {
      await updateRoomMutation.mutateAsync({
        roomId: room?.id,
        status: "started",
      });
      sendMessage({
        type: "START_GAME",
        roomId: id,
        gameId: room?.gameId,
      });
    } catch {}
  };

  const handleSendRoomMessage = (message: string) => {
    if (!message) return;
    sendMessage({
      type: "ROOM_CHAT",
      roomId: id,
      message,
      connectionId: currentUser?.id,
    });
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-[#FF6562]/10 border-2 border-[#FF6562]/30 flex items-center justify-center animate-pulse">
            <Gamepad2 className="h-7 w-7 text-[#FF6562]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6562] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF6562]"></span>
          </span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Entering Room Lobby...
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Connecting to live match session
          </p>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (isError || !room) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm">
        <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
          <Gamepad2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900">Room Not Found</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          This room may have been disbanded, finished, or the room ID is
          invalid.
        </p>
        <Link to="/dashboard">
          <Button className="rounded-xl bg-[#FF6562] hover:bg-[#fa534f] text-white font-bold text-xs">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Arena Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (isGameStarted && !showGame) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <LoaderCircle className="h-10 w-10 text-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="text-sm text-muted-foreground"
          >
            Game starting...
          </motion.div>
        </div>
      </div>
    );
  }

  if (isGameStarted && showGame) {
    return (
      <GameWrapper
        gameId={room.gameId}
        roomId={room.id}
        sendMessage={sendMessage}
      />
    );
  }

  const isHost =
    room.hostId === currentUser?.id || currentUser?.role === "admin";

  const players = room.roomPlayersList || [];
  const activePlayers = players.filter((p) => p.status === "active");
  const emptySlotsCount = Math.max(0, room.maxPlayers - activePlayers.length);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-end gap-3">
        {/* 5-second Polling Live Badge */}
        <div className="flex items-center gap-2 ">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Sync (5s)
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 rounded-xl border-gray-200 text-xs font-bold text-gray-600 hover:text-[#FF6562] hover:border-[#FF6562]/30"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1 ${isRefetching ? "animate-spin text-[#FF6562]" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Hero Room Header Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/90 p-6 sm:p-8 backdrop-blur-xl shadow-lg shadow-red-950/5">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-linear-to-br from-[#FF6562]/15 via-amber-200/20 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            {/* Meta Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="mono"
                className="text-[11px] font-mono font-bold tracking-wider uppercase bg-[#FCECE9] text-[#E85D56] border-[#FAD7D1]"
              >
                Room Lobby
              </Badge>

              {room.visibility === "private" ? (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-amber-700">
                  <Lock className="h-3 w-3" />
                  Private Match
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200/70 text-sky-700">
                  <Globe className="h-3 w-3" />
                  Public Match
                </span>
              )}

              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 capitalize">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {room.status}
              </span>
            </div>

            {/* Room Title */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1F2438]">
              {room.name}
            </h1>

            <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span>
                Created{" "}
                {new Date(room.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>•</span>
              <span>
                {activePlayers.length} of {room.maxPlayers} players joined
              </span>
            </p>
          </div>

          {/* Quick Share Code Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-linear-to-r from-gray-50 to-[#FCECE9]/30 p-3 rounded-2xl border border-gray-200/80">
            <div className="px-3 py-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Room Access Code
              </span>
              <span className="text-lg font-mono font-black text-[#1F2438] tracking-widest">
                #{room.roomCode}
              </span>
            </div>

            <Button
              onClick={handleCopyCode}
              className="bg-[#FF6562] hover:bg-[#fa534f] text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4 mr-1.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Players Section & Match Room Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Players Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FCECE9] text-[#E85D56]">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-black text-[#1F2438]">
                Lobby Players ({activePlayers.length}/{room.maxPlayers})
              </h2>
            </div>

            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
              {emptySlotsCount > 0
                ? `${emptySlotsCount} Slots Open`
                : "Lobby Full"}
            </span>
          </div>

          {/* Active Players Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            {activePlayers.map((player) => {
              const isPlayerHost = player.role === "host";
              const isCurrent = player.userId === currentUser?.id;
              const playerName =
                player.name ||
                (isCurrent ? currentUser?.name || "You" : "Challenger");

              return (
                <Card
                  key={player.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                    isCurrent
                      ? "border-[#FF6562]/50 bg-linear-to-br from-white to-[#FCECE9]/40 shadow-xs"
                      : "border-gray-200/80 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`relative flex h-12 w-12 items-center justify-center rounded-2xl font-black text-sm shadow-xs ${
                          isPlayerHost
                            ? "bg-linear-to-tr from-amber-400 to-amber-500 text-white"
                            : "bg-linear-to-tr from-[#FF6562] to-[#FFA194] text-white"
                        }`}
                      >
                        {playerName.charAt(0).toUpperCase()}

                        {isPlayerHost && (
                          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-white shadow-xs">
                            <Crown className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Player Info */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-[#1F2438]">
                            {playerName}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-red-100 text-[#E85D56]">
                              YOU
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {isPlayerHost ? "Room Host" : "Challenger"}
                        </span>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div>
                      {isPlayerHost ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase">
                          <Crown className="h-3 w-3" />
                          Host
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                          <Gamepad2 className="h-3 w-3" />
                          Player
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Empty Slots */}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-gray-200/80 bg-gray-50/50 p-4 text-center text-gray-400"
              >
                <div className="h-8 w-8 rounded-xl bg-gray-200/50 flex items-center justify-center text-gray-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-gray-400">
                  Waiting for player to join...
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Host / Player Control Panel */}
        <div className="space-y-4 lg:col-span-2 flex flex-col md:flex-row gap-3">
          <RoomMessageBox
            messages={currentRoomMessages}
            handleSendRoomMessage={handleSendRoomMessage}
            currentUserId={currentUser?.id}
          />

          <Card className="rounded-3xl flex-1 border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Session Status
              </span>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-bold text-gray-700">
                  Multiplayer Lobby
                </span>
                <span className="text-xs font-black text-emerald-600 capitalize">
                  {room.status}
                </span>
              </div>
            </div>

            {/* Ready Toggle for Non-Hosts */}
            {!isHost && (
              <Button
                variant={isReady ? "default" : "outline"}
                onClick={() => {
                  setIsReady(!isReady);
                  toast.success(
                    isReady ? "Marked as Not Ready" : "You are READY!",
                  );
                }}
                className={`w-full h-11 rounded-xl text-xs font-black cursor-pointer transition ${
                  isReady
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <UserCheck className="h-4 w-4 mr-1.5" />
                {isReady ? "Ready for Battle!" : "Click to Ready Up"}
              </Button>
            )}

            {/* Start Game Action for Host */}
            {isHost && (
              <Button
                onClick={() => {
                  toast.success("Starting match session! Launching game...");
                  handleStartGame();
                }}
                className="w-full h-12 rounded-2xl bg-[#FF6562] hover:bg-[#fa534f] text-white font-black text-xs shadow-md shadow-red-200 cursor-pointer"
              >
                <Play className="h-4 w-4 mr-2 fill-white" />
                Start Match
              </Button>
            )}

            {/* Leave / Disband Actions */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {isHost ? (
                <Button
                  variant="outline"
                  onClick={handleDestroy}
                  className="w-full h-10 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Disband & Destroy Room
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleLeave}
                  className="w-full h-10 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Leave Room
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
