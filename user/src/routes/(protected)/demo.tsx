import Bingo from '@/games/bingo/bingo'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/demo')({
  component: Bingo,
})