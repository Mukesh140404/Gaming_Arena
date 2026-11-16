//import Bingo from "@/games/bingo/bingo";
// import { TicTacToe } from "@/games/tic-tac-toe/tic-tak-toe";
import { TypingRace } from "@/games/typing-race/typing-race";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/demo")({
  component: TypingRace,
});
