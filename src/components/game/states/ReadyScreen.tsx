
import type { TargetProps } from "@/hooks/useGameLogic";

type ReadyScreenProps = {
  gameMode: "normal" | "ranked" | "target";
  targetProps: TargetProps | null;
  onTargetClick: (e: React.MouseEvent) => void;
};

const ReadyScreen = ({ gameMode, targetProps, onTargetClick }: ReadyScreenProps) => {
  if (gameMode === "target") {
    return (
      targetProps && (
        <button
          style={{
            position: "absolute",
            top: targetProps.top,
            left: targetProps.left,
            width: `${targetProps.size}px`,
            height: `${targetProps.size}px`,
            transform: "translate(-50%, -50%)",
          }}
          className={`flex items-center justify-center rounded-full transition-colors duration-300 animate-scale-in ${targetProps.color}`}
          onClick={onTargetClick}
          aria-label="목표물"
        >
          <targetProps.shape className="w-2/3 h-2/3 text-primary-foreground" />
        </button>
      )
    );
  }

  return (
    <div className="text-center animate-fade-in" role="status" aria-live="polite">
      <h2 className="text-6xl sm:text-8xl font-bold text-background animate-pulse">클릭!</h2>
    </div>
  );
};

export default ReadyScreen;
