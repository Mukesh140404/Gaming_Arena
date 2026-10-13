import { singleGameQueryOptions } from "@/hooks/useGame";
import { useQuery } from "@tanstack/react-query";
import Bingo from "./bingo/bingo";
import ClickRace from "./click-race/click-race";

interface GameWrapperProps {
  gameId: string;
  sendMessage?: (data: object) => void;
  roomId?: string;
}

const GameWrapper = ({ gameId, roomId }: GameWrapperProps) => {

  const {data:game} = useQuery(singleGameQueryOptions(gameId));

  if(!game) return <div>Game not found</div>

  const gameName = game.name.toLowerCase();
  return (
    <div>
      {gameName === "bingo" && <Bingo />}
      {(gameName === "click race" || gameName === "click-race") && <ClickRace roomId={roomId} />}
    </div>
  )
}

export default GameWrapper