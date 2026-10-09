import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/game/bingo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/game/bingo"!</div>
}
