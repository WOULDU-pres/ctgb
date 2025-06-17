
import { Zap } from "lucide-react";

type ResultDisplayProps = {
  reactionTime: number | null;
};

const ResultDisplay = ({ reactionTime }: ResultDisplayProps) => {
  return (
    <div className="text-center animate-fade-in text-foreground" role="alert">
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
        <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        <h2 className="text-6xl sm:text-7xl font-bold">{reactionTime?.toFixed(0)} ms</h2>
      </div>
      <p className="text-base sm:text-lg text-muted-foreground">클릭하여 다음 라운드로 진행하세요.</p>
    </div>
  );
};

export default ResultDisplay;
