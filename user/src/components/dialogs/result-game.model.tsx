import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ResultGameDialogProps {
  gameResult: {
    draw: boolean;
    winnerId?: string;
  } | null;
  userId?: string;
  onBackToRoom: () => void;
}

const ResultGameDialog = ({
  gameResult,
  userId,
  onBackToRoom,
}: ResultGameDialogProps) => {
  if (!gameResult) return null;

  const isDraw = gameResult.draw;
  const isWinner = !isDraw && gameResult.winnerId === userId;

  return (
    <Dialog open={!!gameResult}>
      <DialogContent className="max-w-sm w-full rounded-2xl text-center">
        <DialogHeader className="items-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
              isDraw ? "bg-gray-100" : isWinner ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {isDraw ? "🤝" : isWinner ? "🏆" : "😔"}
          </div>

          <DialogTitle className="mt-3 text-2xl font-black">
            {isDraw ? "It's a Draw!" : isWinner ? "You Won!" : "You Lost!"}
          </DialogTitle>

          <DialogDescription className="text-sm text-gray-500">
            {isDraw
              ? "The game ended in a draw."
              : isWinner
                ? "Congratulations! You won the game."
                : "Better luck next time!"}
          </DialogDescription>
        </DialogHeader>

        <button
          onClick={onBackToRoom}
          className="mt-3 w-full rounded-xl bg-[#FF6562] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#fa534f]"
        >
          Back to Room
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ResultGameDialog;
