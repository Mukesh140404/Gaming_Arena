import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Gamepad2,
  Play,
  Flame,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { gamesQueryOptions } from "@/hooks/useGame";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useAuth";
import LoginImage from "@/assets/login.webp";

export const Route = createFileRoute("/(protected)/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: GAMES_DATA = [], isLoading } = useQuery(gamesQueryOptions);

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return GAMES_DATA;
    const q = searchQuery.toLowerCase();
    return GAMES_DATA.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q)),
    );
  }, [GAMES_DATA, searchQuery]);

  const displayName = user?.name || "Player";
  const gamerTag = user?.name
    ? user.name.toLowerCase().replace(/[^a-z0-9]/g, "_")
    : user?.email
      ? user.email.split("@")[0]
      : "player";

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP SECTION: USER PROFILE CARD */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/85 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(232,93,86,0.12),0_10px_25px_-5px_rgba(0,0,0,0.04)]"
      >
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-[#FF6562]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[#FFE5DF]/80 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Profile Identity (Left) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left w-full lg:w-auto">
            {/* Mascot Avatar with Ring Glow */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-tr from-[#FF6562] via-[#FFA194] to-amber-300 opacity-70 blur-md group-hover:opacity-100 transition duration-300" />
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-[#FCECE9] border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                <img
                  src={LoginImage}
                  alt="Player Avatar"
                  className="h-full w-full object-cover object-top scale-110"
                />
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-[#FF6562] px-2.5 py-0.5 text-[11px] font-black text-white shadow-md shadow-red-300 uppercase">
                <Sparkles className="h-3 w-3" />
                {user?.role || "Gamer"}
              </div>
            </div>

            {/* Gamer Tag & Meta */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1F2438]">
                  {displayName}
                </h1>
                <span className="flex items-center gap-1 rounded-xl bg-red-50 border border-red-200/70 px-2.5 py-0.5 text-xs font-bold text-[#E85D56] uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user?.role === "admin" ? "ADMIN" : "ARENA PLAYER"}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Gamer Tag:{" "}
                <span className="font-bold text-gray-700">@{gamerTag}</span>
                {user?.email && (
                  <span className="text-gray-400"> • {user.email}</span>
                )}
              </p>

              {/* Status Indicator */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  Ready for Battle (Online)
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Overview Cards Grid (Right) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full lg:w-auto">
            {/* Total Arena Games */}
            <div className="rounded-2xl border border-red-200/80 bg-linear-to-br from-red-50/80 to-[#FCECE9]/60 p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
                  Total Games
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-400/20 text-[#E85D56]">
                  <Gamepad2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-[#1F2438]">
                  {GAMES_DATA.length}
                </span>
                <p className="text-[10px] font-bold text-[#E85D56]">
                  Available in Arena
                </p>
              </div>
            </div>

            {/* Active Playable Games */}
            <div className="rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50/80 to-emerald-100/40 p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Active
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-emerald-950">
                  {GAMES_DATA.filter((g) => g.isActive).length}
                </span>
                <p className="text-[10px] font-bold text-emerald-600">
                  Ready to Play
                </p>
              </div>
            </div>

            {/* Account Role Card */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-200/80 bg-linear-to-br from-white to-gray-50/80 p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Account
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-200/60 text-gray-700">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-base sm:text-lg font-black text-[#1F2438] capitalize">
                  {user?.role || "Gamer"}
                </span>
                <p className="text-[10px] font-bold text-gray-500">
                  Verified Member
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. BOTTOM SECTION: ARENA GAMES CARD */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="rounded-[2.5rem] border border-white/80 bg-white/85 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(232,93,86,0.12),0_10px_25px_-5px_rgba(0,0,0,0.04)]"
      >
        {/* Games Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCECE9] text-[#E85D56] shadow-xs">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1F2438]">
                Arena Games
              </h2>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search arena games..."
              className="w-full rounded-2xl border border-gray-200 bg-white/95 py-2.5 pl-10 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 shadow-xs focus:border-[#FF6562] focus:outline-none focus:ring-2 focus:ring-red-100 transition"
            />
          </div>
        </div>

        {/* Games Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 h-32 animate-pulse rounded-2xl bg-gray-200" />
                <div className="mb-4 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  <div className="h-11 w-full animate-pulse rounded-2xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm hover:shadow-xl hover:border-[#FF6562]/40 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Top Banner with Gradient */}
                <div className="relative mb-4 overflow-hidden rounded-2xl bg-linear-to-br p-4 text-white shadow-xs">
                  <div className="absolute inset-0 bg-linear-to-br from-rose-500 via-red-500 to-amber-500 opacity-90 group-hover:opacity-100 transition" />
                  <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-md" />

                  <div className="relative z-10 mt-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                      <Flame className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                        {game.name}
                      </h3>
                      <p className="text-[11px] text-white/80 font-medium">
                        {game.minPlayers}-{game.maxPlayers} Players Max
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {game.description || "No description provided."}
                </p>

                {/* Play Action Button */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: `/game/${game.slug}` });
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FF6562] py-3 text-xs font-black text-white shadow-md shadow-red-200 hover:bg-[#fa534f] active:scale-[0.98] transition cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    Play Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <Gamepad2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-600">
              {searchQuery
                ? "No matching games found."
                : "No games available in the arena."}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery
                ? "Try searching for another keyword."
                : "Games created in the Admin panel will appear here automatically."}
            </p>
          </div>
        )}
      </motion.section>
    </div>
  );
}
