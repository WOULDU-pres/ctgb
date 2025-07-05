
import type { TargetProps, GameMode } from "@/hooks/useGameLogic";
import ColorModeScreen from "./ColorModeScreen";
import SequenceModeScreen from "./SequenceModeScreen";

type ReadyScreenProps = {
  gameMode: GameMode;
  targetProps: TargetProps | null;
  onTargetClick: (e: React.MouseEvent, colorChoice?: string, sequenceChoice?: number) => void;
};

const ReadyScreen = ({ gameMode, targetProps, onTargetClick }: ReadyScreenProps) => {
  const handleColorClick = (color: string) => {
    const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
    onTargetClick(fakeEvent, color);
  };

  const handleSequenceClick = (choice: number) => {
    const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
    onTargetClick(fakeEvent, undefined, choice);
  };

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

  if (gameMode === "color" && targetProps) {
    return <ColorModeScreen targetProps={targetProps} onColorClick={handleColorClick} />;
  }

  if (gameMode === "sequence" && targetProps) {
    return <SequenceModeScreen targetProps={targetProps} onSequenceClick={handleSequenceClick} />;
  }

  return (
    <div className="text-center animate-fade-in" role="status" aria-live="polite">
      <h2 className="text-6xl sm:text-8xl font-bold text-background animate-pulse">클릭!</h2>
    </div>
  );
};

export default ReadyScreen;
