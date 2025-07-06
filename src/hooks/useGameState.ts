import { useState, useCallback } from "react";

export type GameState = "waiting" | "ready" | "result" | "tooSoon";
export type GameMode = "normal" | "ranked" | "target" | "color" | "sequence";

export type TargetProps = {
  top: string;
  left: string;
  size: number;
  shape: React.ElementType;
  color: string;
  correctColor?: string;
  targetSequence?: number[];
  currentSequence?: number[];
  sequenceStep?: number;
};

interface UseGameStateProps {
  gameMode: GameMode;
}

export const useGameState = ({ gameMode }: UseGameStateProps) => {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [targetProps, setTargetProps] = useState<TargetProps | null>(null);

  const resetGame = useCallback(() => {
    setGameState("waiting");
    setReactionTime(null);
    setTargetProps(null);
  }, []);

  const startGame = useCallback(() => {
    setGameState("ready");
  }, []);

  const endGame = useCallback((time: number) => {
    setReactionTime(time);
    setGameState("result");
  }, []);

  const setTooSoon = useCallback(() => {
    setGameState("tooSoon");
  }, []);

  const getBackgroundColor = useCallback(() => {
    if (
      gameMode === "target" &&
      gameState !== "result" &&
      gameState !== "tooSoon"
    ) {
      return "bg-background";
    }
    switch (gameState) {
      case "waiting":
      case "tooSoon":
        return "bg-destructive";
      case "ready":
        if (gameMode !== "target") {
          return "bg-primary";
        }
        return "bg-background";
      default:
        return "bg-background";
    }
  }, [gameMode, gameState]);

  return {
    gameState,
    reactionTime,
    targetProps,
    setTargetProps,
    resetGame,
    startGame,
    endGame,
    setTooSoon,
    backgroundColor: getBackgroundColor(),
  };
};
