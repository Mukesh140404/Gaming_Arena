import { createFileRoute } from '@tanstack/react-router';
import { GameRoomsLobby } from '@/components/room/game-rooms-lobby';

export const Route = createFileRoute('/(protected)/game/bingo')({
  component: BingoGameRoute,
});

function BingoGameRoute() {
  return (
    <div className="space-y-6">
      <GameRoomsLobby
        gameId="bingo"
        gameName="Bingo Arena"
        gameSlug="bingo"
        maxPlayersAllowed={10}
        description="Join public rooms or create your own custom room to play real-time Bingo with fellow arena players."
        onStartGame={(room) => {
          console.log("Start match in room", room.roomCode);
        }}
      />
    </div>
  );
}
