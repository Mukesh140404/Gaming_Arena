import { singleGameQueryOptions } from "@/hooks/useGame";
import { useQuery } from "@tanstack/react-query";
import Bingo from "./bingo/bingo";

interface GameWrapperProps {
  gameId: string;
}

const GameWrapper = ({ gameId }: GameWrapperProps) => {

  const {data:game} = useQuery(singleGameQueryOptions(gameId));

  if(!game) return <div>Game not found</div>

  const gameName = game.name.toLowerCase();
  return (
    <div>
      {gameName === "bingo" && <Bingo />}
    </div>
  )
}

export default GameWrapper