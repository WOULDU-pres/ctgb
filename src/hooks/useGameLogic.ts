
import { useState, useRef, useEffect, useCallback } from "react";
import { Target, Square, Triangle, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

type UseGameLogicProps = {
  onRoundComplete: (time: number) => void;
  round: number;
  gameMode: GameMode;
  isCountdownOver: boolean;
};

export const useGameLogic = ({ onRoundComplete, round, gameMode, isCountdownOver }: UseGameLogicProps) => {
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [targetProps, setTargetProps] = useState<TargetProps | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const missTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanupTimeouts = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!isCountdownOver) return;

    const randomDelay = Math.random() * 2000 + 1000;
    timerRef.current = setTimeout(() => {
      if (gameMode === "target") {
        const top = `${Math.random() * 80 + 10}%`;
        const left = `${Math.random() * 80 + 10}%`;
        
        const baseSize = isMobile ? 110 : 90;
        const minSize = isMobile ? 45 : 30;
        const size = Math.max(minSize, baseSize - round * 5);

        const shapes = [Target, Square, Triangle, Star];
        const ShapeComponent = shapes[Math.floor(Math.random() * shapes.length)];
        
        setTargetProps({ top, left, size, shape: ShapeComponent, color: 'bg-primary' });

        const timeLimit = Math.max(1000, 2500 - round * 100);
        missTimeoutRef.current = setTimeout(() => {
            if ('vibrate' in navigator) navigator.vibrate([100, 30, 100]);
            onRoundComplete(3000);
        }, timeLimit);

        setTimeout(() => {
            setTargetProps(prev => prev ? { ...prev, color: 'bg-secondary' } : null);
        }, timeLimit / 2);
      } else if (gameMode === "color") {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
        const correctColor = colors[Math.floor(Math.random() * colors.length)];
        const displayedColors = [correctColor];
        
        // Add 2-3 incorrect colors
        while (displayedColors.length < 4) {
          const wrongColor = colors[Math.floor(Math.random() * colors.length)];
          if (!displayedColors.includes(wrongColor)) {
            displayedColors.push(wrongColor);
          }
        }
        
        // Shuffle the colors
        for (let i = displayedColors.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [displayedColors[i], displayedColors[j]] = [displayedColors[j], displayedColors[i]];
        }

        setTargetProps({ 
          top: '50%', 
          left: '50%', 
          size: 80, 
          shape: Square, 
          color: displayedColors[0],
          correctColor 
        });

        const timeLimit = Math.max(2000, 3000 - round * 100);
        missTimeoutRef.current = setTimeout(() => {
            if ('vibrate' in navigator) navigator.vibrate([100, 30, 100]);
            onRoundComplete(3000);
        }, timeLimit);
      } else if (gameMode === "sequence") {
        const sequenceLength = Math.min(3 + Math.floor(round / 2), 8);
        const targetSequence = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * 4));
        
        setTargetProps({ 
          top: '50%', 
          left: '50%', 
          size: 60, 
          shape: Square, 
          color: 'bg-primary',
          targetSequence,
          currentSequence: [],
          sequenceStep: 0
        });

        const timeLimit = Math.max(3000, 5000 - round * 200);
        missTimeoutRef.current = setTimeout(() => {
            if ('vibrate' in navigator) navigator.vibrate([100, 30, 100]);
            onRoundComplete(3000);
        }, timeLimit);
      }
      setGameState("ready");
      startTimeRef.current = performance.now();
    }, randomDelay);

    return cleanupTimeouts;
  }, [isCountdownOver, gameMode, round, onRoundComplete, cleanupTimeouts, isMobile]);

  const handleSuccess = useCallback(() => {
    cleanupTimeouts();
    const endTime = performance.now();
    const time = endTime - startTimeRef.current;
    setReactionTime(time);
    setGameState("result");
    if ('vibrate' in navigator) navigator.vibrate(50);
  }, [cleanupTimeouts]);
  
  const handleScreenClick = useCallback(() => {
    if (!isCountdownOver) return;

    if (gameState === "waiting") {
      cleanupTimeouts();
      setGameState("tooSoon");
      if ('vibrate' in navigator) navigator.vibrate([100, 30, 100]);
    } else if (gameState === "ready") {
      if (gameMode === "normal" || gameMode === "ranked") {
        handleSuccess();
      }
    } else if (gameState === "tooSoon") {
      onRoundComplete(5000);
    } else if (gameState === "result" && reactionTime !== null) {
      onRoundComplete(reactionTime);
    }
  }, [isCountdownOver, gameState, gameMode, reactionTime, onRoundComplete, cleanupTimeouts, handleSuccess]);
  
  const handleTargetClick = useCallback((e: React.MouseEvent, colorChoice?: string, sequenceChoice?: number) => {
    e.stopPropagation();
    if (gameState === "ready") {
      if (gameMode === "target") {
        handleSuccess();
      } else if (gameMode === "color" && targetProps?.correctColor) {
        if (colorChoice === targetProps.correctColor) {
          handleSuccess();
        } else {
          if ('vibrate' in navigator) navigator.vibrate([100, 30, 100]);
          onRoundComplete(3000);
        }
      } else if (gameMode === "sequence" && targetProps?.targetSequence && sequenceChoice !== undefined) {
        const newSequence = [...(targetProps.currentSequence || []), sequenceChoice];
        const currentStep = targetProps.sequenceStep || 0;
        
        if (sequenceChoice === targetProps.targetSequence[currentStep]) {
          if (newSequence.length === targetProps.targetSequence.length) {
            handleSuccess();
          } else {
            setTargetProps(prev => prev ? {
              ...prev,
              currentSequence: newSequence,
              sequenceStep: currentStep + 1
            } : null);
          }
        } else {
          if ('vibrate' in navigator) navigator.vibrate([100, 30, 100]);
          onRoundComplete(3000);
        }
      }
    }
  }, [gameState, gameMode, targetProps, handleSuccess, onRoundComplete]);

  const getBackgroundColor = () => {
    if (gameMode === "target" && gameState !== "result" && gameState !== "tooSoon") {
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
  };

  return {
    gameState,
    reactionTime,
    targetProps,
    handleScreenClick,
    handleTargetClick,
    backgroundColor: getBackgroundColor(),
    setTargetProps,
  };
};
