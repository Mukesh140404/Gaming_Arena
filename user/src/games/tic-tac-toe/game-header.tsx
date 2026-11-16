import React from "react";
import {
  Zap,
  Volume2,
  VolumeX,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RaceHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  isMultiplayer: boolean;
}

export const GameHeader: React.FC<RaceHeaderProps> = ({
  soundEnabled = true,
  onToggleSound,
  onRestart,
  isMultiplayer,
}) => {

  return (
    <div className=" bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 w-full">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <Zap className="h-5 w-5 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                TIC TAC TOE
              </h2>
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-300 font-bold px-2 py-0.5 text-xs">
                {isMultiplayer ? "Live Room Match" : "Speed Battle"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSound}
            className="h-8 px-2.5 rounded-xl border-gray-200 text-xs font-semibold text-gray-600 cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 mr-1 text-rose-500" />
                <span>Audio</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 mr-1 text-gray-400" />
                <span>Muted</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRestart}
            className="h-8 px-2.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
