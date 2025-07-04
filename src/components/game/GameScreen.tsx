
import { useState, useEffect } from "react";
import Countdown from "./Countdown";
import GameHeader from "./GameHeader";
import WaitingScreen from "./states/WaitingScreen";
import ReadyScreen from "./states/ReadyScreen";
import TooSoonScreen from "./states/TooSoonScreen";
import ResultDisplay from "./states/ResultDisplay";
import { useGameLogic, GameMode } from "@/hooks/useGameLogic";

type GameScreenProps = {
  onRoundComplete: (time: number) => void;
  round: number;
  totalRounds: number;
  gameMode: GameMode;
};

const GameScreen = ({ onRoundComplete, round, totalRounds, gameMode }: GameScreenProps) => {
  const [showCountdown, setShowCountdown] = useState(round === 1);
  const isCountdownOver = !showCountdown;

  const {
    gameState,
    reactionTime,
    targetProps,
    handleScreenClick,
    handleTargetClick,
    backgroundColor,
    setTargetProps,
  } = useGameLogic({ onRoundComplete, round, gameMode, isCountdownOver });

  const handleCountdownComplete = () => {
    setShowCountdown(false);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleScreenClick();
      }
      
      // Color mode keyboard controls
      if (gameMode === 'color' && gameState === 'ready') {
        const colorKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'];
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
        
        const keyIndex = colorKeys.indexOf(e.code);
        if (keyIndex >= 0) {
          e.preventDefault();
          const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
          handleTargetClick(fakeEvent, colors[keyIndex]);
        }
      }
      
      // Sequence mode keyboard controls
      if (gameMode === 'sequence' && gameState === 'ready') {
        const sequenceKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4'];
        const keyIndex = sequenceKeys.indexOf(e.code);
        if (keyIndex >= 0) {
          e.preventDefault();
          const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
          handleTargetClick(fakeEvent, undefined, keyIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleScreenClick, handleTargetClick, gameMode, gameState]);

  const renderContent = () => {
    switch (gameState) {
      case "waiting":
        return <WaitingScreen gameMode={gameMode} />;
      case "ready":
        return <ReadyScreen gameMode={gameMode} targetProps={targetProps} onTargetClick={handleTargetClick} />;
      case "tooSoon":
        return <TooSoonScreen />;
      case "result":
        return <ResultDisplay reactionTime={reactionTime} />;
      default:
        return null;
    }
  };

  if (showCountdown) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background fixed inset-0">
        <GameHeader round={round} totalRounds={totalRounds} />
        <Countdown onComplete={handleCountdownComplete} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center cursor-pointer transition-colors duration-200 fixed inset-0 ${backgroundColor}`}
      onClick={handleScreenClick}
      role="button"
      aria-label="게임 화면, 클릭 혹은 스페이스바를 눌러 진행하세요"
      tabIndex={0}
    >
      <GameHeader round={round} totalRounds={totalRounds} />
      <div className="w-full max-w-4xl px-4 relative h-full flex items-center justify-center">{renderContent()}</div>
    </div>
  );
};

export default GameScreen;
