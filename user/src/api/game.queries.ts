import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllGames, createGame, updateGameApi, deleteGameApi } from "./game";
import type { AddGameInput, UpdateGameInput } from "../types/game.type";
import { toast } from "sonner";

export const gamesQueryOptions = queryOptions({
  queryKey: ["admin", "games"],
  queryFn: fetchAllGames,
  staleTime: 1000 * 30, // 30 seconds
});

export function useAddGameMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddGameInput) => createGame(input),
    onSuccess: (newGame) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "games"] });
      toast.success(`Game "${newGame.name}" added successfully!`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add game");
    },
  });
}

export function useUpdateGameMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateGameInput) => updateGameApi(input),
    onSuccess: (updatedGame) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "games"] });
      toast.success(`Game "${updatedGame.name}" updated successfully!`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update game");
    },
  });
}

export function useDeleteGameMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGameApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "games"] });
      toast.success("Game deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete game");
    },
  });
}
