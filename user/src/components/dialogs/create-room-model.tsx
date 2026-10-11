
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Eye, EyeOff, Globe, Lock, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { useCreateRoomMutation } from "@/hooks/useRoom";
import { useState, type FormEvent } from "react";
import type { CreateRoomInput } from "@/types/room.type";

interface createRoomDialogProps {
  isCreateOpen: boolean;
  setIsCreateOpen: (value: boolean) => void;
  gameId: string;
  createForm: CreateRoomInput;
  setCreateForm: (value: CreateRoomInput) => void;
  gameName: string;
  maxPlayersAllowed: number;
}

const CreateRoomDialog = ({ isCreateOpen, setIsCreateOpen, gameId, createForm, setCreateForm, gameName, maxPlayersAllowed }: createRoomDialogProps) => {
  const navigate = useNavigate();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const createRoomMutation = useCreateRoomMutation(gameId);
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
      navigate({
        to: "/room/$id",
        params: { id: created.id },
      });
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
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
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${createForm.visibility === "public"
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
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${createForm.visibility === "private"
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
                  value={createForm.password}
                  required
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Enter secret room password"
                  className="w-full rounded-xl border border-gray-200 bg-white/95 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
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
  )
}

export default CreateRoomDialog