
type WaitingScreenProps = {
  gameMode: "normal" | "ranked" | "target";
};

const WaitingScreen = ({ gameMode }: WaitingScreenProps) => {
  const waitingTextColor = gameMode === 'target' ? 'text-foreground' : 'text-background';
  const waitingMutedColor = gameMode === 'target' ? 'text-muted-foreground' : 'text-background/80';

  return (
    <div className="text-center animate-fade-in" role="status" aria-live="polite">
      <h2 className={`text-4xl sm:text-5xl font-bold ${waitingTextColor}`}>준비...</h2>
      <p className={`text-lg sm:text-xl ${waitingMutedColor} mt-4`}>
        {gameMode === "target"
          ? "목표물이 나타나면 클릭하세요"
          : "화면이 녹색으로 바뀌면 클릭하세요"}
      </p>
    </div>
  );
};

export default WaitingScreen;
