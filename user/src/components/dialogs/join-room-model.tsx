
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import type { JoinRoomInput, Room } from "@/types/room.type";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useJoinRoomMutation } from "@/hooks/useRoom";

interface JoinRoomDialogProps {
  isJoinCodeOpen: boolean;
  setIsJoinCodeOpen: (value: boolean) => void;
  gameId: string;
  joinCodeForm: JoinRoomInput;
  setJoinCodeForm: (value: JoinRoomInput) => void;
  rooms: Room[]
  maxPlayersAllowed: number;
}

const JoinRoomDialog = ({ isJoinCodeOpen, setIsJoinCodeOpen, gameId, joinCodeForm, setJoinCodeForm, rooms }: JoinRoomDialogProps) => {
  const navigate = useNavigate();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const joinRoomMutation = useJoinRoomMutation(gameId);
  const handleJoinByCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCodeForm.roomCode.trim()) return;

    try {
      const joined = await joinRoomMutation.mutateAsync(joinCodeForm);
      setIsJoinCodeOpen(false);
      const target = rooms.find((r) => r.roomCode.toLowerCase() === joinCodeForm.roomCode.toLowerCase());
      const targetRoomId = target?.id || joined?.roomId;
      if (targetRoomId) {
        navigate({
          to: "/room/$id",
          params: { id: targetRoomId },
        });
      }
    } catch {
      // Error handled by mutation
    }
  };

  return (
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
                placeholder="Optional room password"
                value={joinCodeForm.password}
                onChange={(e) => setJoinCodeForm({ ...joinCodeForm, password: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/95 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
              />
            </div>
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
  )
}

export default JoinRoomDialog