import { User, Users, Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BingoHeaderProps {
  phase: "setup" | "playing" | "won";
  timeLeft: number;
  isMyTurn: boolean;
  playerName?: string;
  opponentName?: string;
}

export const BingoHeader: React.FC<BingoHeaderProps> = ({
  phase,
  timeLeft,
  isMyTurn,
  playerName = "You",
  opponentName = "Opponent",
}) => {
  return (
    <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Title & Phase Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="h-4 w-4" />
          </div>
          <h2 className="font-black text-xl text-gray-900 tracking-tight">
            Bingo
          </h2>
        </div>

        {phase === "setup" ? (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold px-2.5 py-0.5">
            Setup Phase
          </Badge>
        ) : phase === "won" ? (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold px-2.5 py-0.5">
            Finished
          </Badge>
        ) : (
          <Badge className="bg-rose-100 text-rose-700 border-rose-300 font-bold px-2.5 py-0.5">
            Match Live
          </Badge>
        )}
      </div>

      {/* Players: You on Left, Opponent on Right */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: You */}
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            phase === "playing" && isMyTurn
              ? "border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-300 shadow-sm"
              : "border-gray-200 bg-gray-50/70"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900 truncate">
                {playerName}
              </span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                You
              </span>
            </div>
            <div className="text-[11px] font-medium text-gray-500">
              {phase === "setup" ? (
                "Setting board"
              ) : isMyTurn ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Your Turn
                </span>
              ) : (
                "Waiting"
              )}
            </div>
          </div>
        </div>

        {/* Right: Opponent ("mere sath wala dusri side") */}
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            phase === "playing" && !isMyTurn
              ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-300 shadow-sm"
              : "border-gray-200 bg-gray-50/70"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900 truncate">
                {opponentName}
              </span>
              <span className="text-[10px] font-bold text-gray-600 bg-gray-200 px-1.5 py-0.2 rounded">
                P2
              </span>
            </div>
            <div className="text-[11px] font-medium text-gray-500">
              {phase === "setup" ? (
                "Readying up"
              ) : !isMyTurn ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  Opponent's Turn
                </span>
              ) : (
                "Waiting"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Bar (during Setup) or Turn Status */}
      {phase === "setup" && (
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-rose-500" />
              Setup Time Remaining
            </span>
            <span
              className={`font-mono text-sm ${
                timeLeft <= 5 ? "text-rose-600 animate-pulse font-black" : "text-gray-900"
              }`}
            >
              {timeLeft}s
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                timeLeft <= 5 ? "bg-rose-500 animate-pulse" : "bg-rose-400"
              }`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BingoHeader;
