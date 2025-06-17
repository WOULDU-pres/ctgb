
import { Progress } from "@/components/ui/progress";

type GameHeaderProps = {
  round: number;
  totalRounds: number;
};

const GameHeader = ({ round, totalRounds }: GameHeaderProps) => {
  return (
    <div className="absolute top-4 sm:top-8 left-4 right-4 sm:left-8 sm:right-8 w-auto max-w-4xl mx-auto">
      {totalRounds > 1 ? (
        <>
          <div className="flex justify-between items-center mb-2 text-base sm:text-lg font-bold text-foreground">
            <span>Round {round} / {totalRounds}</span>
          </div>
          <Progress value={((round - 1) / totalRounds) * 100} className="w-full h-2 bg-muted" />
        </>
      ) : (
        <div className="text-center text-xl sm:text-2xl font-bold text-foreground">
          Round {round} / {totalRounds}
        </div>
      )}
    </div>
  );
};

export default GameHeader;
