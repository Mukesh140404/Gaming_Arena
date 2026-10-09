import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRoomsOfGame,
  fetchRoomById,
  createRoomApi,
  joinRoomApi,
  leaveRoomApi,
  destroyRoomApi,
} from "./room";
import type { CreateRoomInput, JoinRoomInput } from "../types/room.type";
import { toast } from "sonner";

export const roomsOfGameQueryOptions = (gameId: string) =>
  queryOptions({
    queryKey: ["rooms", "game", gameId],
    queryFn: () => fetchRoomsOfGame(gameId),
    enabled: !!gameId,
    refetchInterval: 5000, // Poll every 5s for live rooms list
  });

export const singleRoomQueryOptions = (roomId: string) =>
  queryOptions({
    queryKey: ["rooms", "single", roomId],
    queryFn: () => fetchRoomById(roomId),
    enabled: !!roomId,
    refetchInterval: 3000, // Poll every 3s when inside a room lobby
  });

export function useCreateRoomMutation(gameId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoomInput) => createRoomApi(input),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      if (gameId) {
        queryClient.invalidateQueries({ queryKey: ["rooms", "game", gameId] });
      }
      toast.success(`Room "${newRoom.name}" created! Code: ${newRoom.roomCode}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create room");
    },
  });
}

export function useJoinRoomMutation(gameId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JoinRoomInput) => joinRoomApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      if (gameId) {
        queryClient.invalidateQueries({ queryKey: ["rooms", "game", gameId] });
      }
      toast.success("Joined room successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to join room");
    },
  });
}

export function useLeaveRoomMutation(gameId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => leaveRoomApi(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      if (gameId) {
        queryClient.invalidateQueries({ queryKey: ["rooms", "game", gameId] });
      }
      toast.success("Left the room");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to leave room");
    },
  });
}

export function useDestroyRoomMutation(gameId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => destroyRoomApi(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      if (gameId) {
        queryClient.invalidateQueries({ queryKey: ["rooms", "game", gameId] });
      }
      toast.success("Room destroyed successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to destroy room");
    },
  });
}
