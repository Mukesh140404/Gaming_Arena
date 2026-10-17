import Bingo from "@/games/bingo/bingo";
import { TicTacToe } from "@/games/tic-tac-toe/tic-tak-toe";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/demo")({
  component: TicTacToe,
});
