import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Room } from "@/types/room.type";
import { ArrowRight, Check, Copy, Globe, Lock, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GameCardProps {
    room: Room;
    isFull: boolean;
    currentPlayersCount: number;
    handleDirectJoin: (room: Room) => void;
}

const GameCard = ({ room, isFull, currentPlayersCount, handleDirectJoin }: GameCardProps) => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Copied room code: ${code}`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

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
                <h3 className="font-bold text-base text-[#1F2438] group-hover:text-[#FF6562] transition leading-snug cursor-pointer">
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
                            className={`h-full rounded-full transition-all duration-300 ${isFull ? "bg-amber-500" : "bg-[#FF6562]"
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
                    className={`flex-1 h-9 rounded-xl font-bold text-xs shadow-xs cursor-pointer ${isFull
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "bg-[#FF6562] hover:bg-[#fa534f] text-white shadow-red-200"
                        }`}
                >
                    <span>{isFull ? "Room Full" : "Join Room"}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
            </div>
        </Card>
    )
}

export default GameCard