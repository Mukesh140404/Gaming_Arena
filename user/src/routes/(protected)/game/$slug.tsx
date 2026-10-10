import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { gamesQueryOptions } from '@/hooks/useGame';
import { GameRoomsLobby } from '@/components/room/game-rooms-lobby';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

export const Route = createFileRoute('/(protected)/game/$slug')({
  component: DynamicGameRoomsRoute,
});

function DynamicGameRoomsRoute() {
  const { slug } = Route.useParams();
  const { data: games = [], isLoading } = useQuery(gamesQueryOptions);

  const matchedGame = games.find((g) => g.slug.toLowerCase() === slug.toLowerCase());

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm font-bold text-gray-500">
        Loading game lobby...
      </div>
    );
  }

  if (!matchedGame) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
        <Gamepad2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-lg font-bold text-gray-800">Game Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          We couldn't find a game matching "{slug}".
        </p>
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Arena Dashboard</span>
      </Link>

      <GameRoomsLobby
        gameId={matchedGame.id}
        gameName={matchedGame.name}
        gameSlug={matchedGame.slug}
        maxPlayersAllowed={matchedGame.maxPlayers || 8}
        description={matchedGame.description || undefined}
      />
    </div>
  );
}
