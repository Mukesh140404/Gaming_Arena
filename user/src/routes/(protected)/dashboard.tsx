import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Trophy,
  Coins,
  Flame,
  Play,
  Users,
  Star,
  Gamepad2,
  Sparkles,
  Award,
  Plus,
  ShieldCheck,
  Search,
} from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/(protected)/dashboard")({
  component: RouteComponent,
});

interface GameItem {
  id: string;
  title: string;
  category: "Action" | "Strategy" | "Arcade" | "Multiplayer" | "Racing";
  players: number;
  rating: number;
  rewardCoins: number;
  badge?: string;
  gradient: string;
  iconBg: string;
  description: string;
}

const GAMES_DATA: GameItem[] = [
  {
    id: "cyber-dash",
    title: "Cyber Dash: Neon Arena",
    category: "Action",
    players: 1420,
    rating: 4.9,
    rewardCoins: 500,
    badge: "Trending 🔥",
    gradient: "from-rose-500 via-red-500 to-amber-500",
    iconBg: "bg-red-500/10 text-red-500",
    description: "Fast-paced neon obstacle parkour battle with live online rivals.",
  },
  {
    id: "battle-tanks",
    title: "Battle Tanks 3D League",
    category: "Multiplayer",
    players: 890,
    rating: 4.8,
    rewardCoins: 1200,
    badge: "Tournament 🏆",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    iconBg: "bg-orange-500/10 text-orange-500",
    description: "Command heavy tactical tanks in realistic 4v4 destruction arenas.",
  },
  {
    id: "pixel-quest",
    title: "Pixel Quest: Dragon Slayer",
    category: "Action",
    players: 640,
    rating: 4.9,
    rewardCoins: 850,
    gradient: "from-pink-500 via-rose-500 to-purple-600",
    iconBg: "bg-pink-500/10 text-pink-500",
    description: "Retro roguelike dungeon crawler packed with epic boss encounters.",
  },
  {
    id: "nitro-rush",
    title: "Speed Rush: Nitro League",
    category: "Racing",
    players: 1105,
    rating: 4.7,
    rewardCoins: 1500,
    badge: "Popular ⚡",
    gradient: "from-red-500 via-pink-600 to-rose-700",
    iconBg: "bg-rose-500/10 text-rose-500",
    description: "High-octane street drift racing with turbo nitro boosters.",
  },
  {
    id: "chess-royale",
    title: "Chess Royale 1v1 Ranked",
    category: "Strategy",
    players: 730,
    rating: 5.0,
    rewardCoins: 2000,
    badge: "Ranked 👑",
    gradient: "from-orange-400 via-amber-500 to-rose-500",
    iconBg: "bg-amber-500/10 text-amber-500",
    description: "Speed chess battles with timed blitz clocks and ELO ranking.",
  },
  {
    id: "galaxy-invaders",
    title: "Galaxy Invaders 2: Nova",
    category: "Arcade",
    players: 480,
    rating: 4.6,
    rewardCoins: 400,
    gradient: "from-rose-500 via-purple-500 to-indigo-600",
    iconBg: "bg-purple-500/10 text-purple-500",
    description: "Classic vertical space arcade shooter with bullet-hell waves.",
  },
];

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingGame, setPlayingGame] = useState<string | null>(null);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP SECTION: USER PROFILE CARD */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/85 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(232,93,86,0.12),0_10px_25px_-5px_rgba(0,0,0,0.04)]"
      >
        {/* Ambient Top Glow */}
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
                  src="/assets/login.png"
                  alt="Player Avatar"
                  className="h-full w-full object-cover object-top scale-110"
                />
              </div>
              {/* Level Badge Pill */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-[#FF6562] px-2.5 py-0.5 text-[11px] font-black text-white shadow-md shadow-red-300">
                <Sparkles className="h-3 w-3" />
                LVL 42
              </div>
            </div>

            {/* Gamer Tag & Meta */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1F2438]">
                  Rohit Negi
                </h1>
                <span className="flex items-center gap-1 rounded-xl bg-red-50 border border-red-200/70 px-2.5 py-0.5 text-xs font-bold text-[#E85D56]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  PRO ELITE
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Gamer Tag: <span className="font-bold text-gray-700">@rohit_arena42</span> • Arena Member
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

          {/* Quick Stats Cards Grid (Right) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full lg:w-auto">
            
            {/* Coins Balance Card */}
            <div className="rounded-2xl border border-amber-200/80 bg-linear-to-br from-amber-50/80 to-amber-100/40 p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Arena Coins
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600">
                  <Coins className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-amber-900">
                  12,450
                </span>
                <button
                  type="button"
                  title="Add coins"
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Win Rate / Trophies Card */}
            <div className="rounded-2xl border border-red-200/80 bg-linear-to-br from-red-50/80 to-[#FCECE9]/60 p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
                  Win Rate
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-400/20 text-[#E85D56]">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-[#1F2438]">
                  78.4%
                </span>
                <p className="text-[10px] font-bold text-[#E85D56]">
                  Rank #14 Leaderboard
                </p>
              </div>
            </div>

            {/* Battles Fought Card */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-200/80 bg-linear-to-br from-white to-gray-50/80 p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Battles
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-200/60 text-gray-700">
                  <Gamepad2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-[#1F2438]">
                  342
                </span>
                <p className="text-[10px] font-bold text-emerald-600">
                  +18 Won Today
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* XP Progress Bar to Next Level */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 w-full sm:w-auto">
            <Award className="h-4 w-4 text-[#FF6562]" />
            <span>XP Progress: <strong className="text-[#1F2438]">3,420 / 5,000 XP</strong></span>
          </div>

          <div className="w-full sm:max-w-md flex items-center gap-3">
            <div className="relative h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#FF6562] to-amber-400 transition-all duration-500"
                style={{ width: "68%" }}
              />
            </div>
            <span className="text-xs font-black text-[#FF6562]">68%</span>
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
        {GAMES_DATA.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES_DATA.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm hover:shadow-xl hover:border-[#FF6562]/40 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Top Banner with Gradient */}
                <div className="relative mb-4 overflow-hidden rounded-2xl bg-linear-to-br p-4 text-white shadow-xs">
                  <div className={`absolute inset-0 bg-linear-to-br ${game.gradient} opacity-90 group-hover:opacity-100 transition`} />

                  {/* Decorative Mesh Circle */}
                  <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-md" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="rounded-lg bg-black/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                      {game.category}
                    </span>

                    {game.badge && (
                      <span className="rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-black text-[#1F2438] shadow-xs">
                        {game.badge}
                      </span>
                    )}
                  </div>

                  {/* Title in Banner */}
                  <div className="relative z-10 mt-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                      <Flame className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                        {game.title}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-white/90">
                        <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                        <span>{game.rating} Rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {game.description}
                </p>

                {/* Meta Details: Active Players & Coins Reward */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{game.players.toLocaleString()} Playing</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-lg">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      <span>+{game.rewardCoins} Coins</span>
                    </div>
                  </div>

                  {/* Play Action Button */}
                  <button
                    type="button"
                    onClick={() => setPlayingGame(game.title)}
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
            <p className="text-sm font-bold text-gray-600">No arena games found.</p>
            <p className="text-xs text-gray-400 mt-1">Try searching for a different name or category.</p>
          </div>
        )}
      </motion.section>

      {/* Interactive Launch Modal/Toast when clicking Play */}
      {playingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/80 bg-white p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FCECE9] text-[#FF6562] shadow-sm">
              <Play className="h-8 w-8 fill-[#FF6562] ml-1" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#1F2438]">
                Launching Arena
              </h3>
              <p className="text-xs font-semibold text-gray-500">
                Connecting to match servers for:
              </p>
              <p className="text-sm font-black text-[#E85D56]">{playingGame}</p>
            </div>

            <div className="flex items-center justify-center gap-2 py-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600">
                Server Ready • Low Ping
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPlayingGame(null)}
              className="w-full rounded-xl bg-gray-900 py-2.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
            >
              Close / Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
