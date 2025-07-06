import { GameMode } from "@/hooks/useGameLogic";

type WaitingScreenProps = {
  gameMode: GameMode;
};

const WaitingScreen = ({ gameMode }: WaitingScreenProps) => {
  const waitingTextColor =
    gameMode === "target" ? "text-foreground" : "text-background";
  const waitingMutedColor =
    gameMode === "target" ? "text-muted-foreground" : "text-background/80";

  const getWaitingMessage = () => {
    switch (gameMode) {
      case "target":
        return "목표물이 나타나면 클릭하세요";
      case "color":
        return "올바른 색상을 선택하세요";
      case "sequence":
        return "순서대로 클릭하세요";
      default:
        return "화면이 녹색으로 바뀌면 클릭하세요";
    }
  };

  return (
    <div
      className="text-center animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <h2 className={`text-4xl sm:text-5xl font-bold ${waitingTextColor}`}>
        준비...
      </h2>
      <p className={`text-lg sm:text-xl ${waitingMutedColor} mt-4`}>
        {getWaitingMessage()}
      </p>
    </div>
  );
};

export default WaitingScreen;
