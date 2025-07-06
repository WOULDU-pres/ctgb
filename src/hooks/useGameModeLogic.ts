import { useCallback } from "react";
import { Target, Square, Triangle, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TargetProps, GameMode } from "./useGameState";

interface UseGameModeLogicProps {
  gameMode: GameMode;
  round: number;
  onSetTargetProps: (props: TargetProps) => void;
  onError?: (error: Error) => void;
}

export const useGameModeLogic = ({
  gameMode,
  round,
  onSetTargetProps,
  onError,
}: UseGameModeLogicProps) => {
  const isMobile = useIsMobile();

  const setupTargetMode = useCallback(() => {
    try {
      const top = `${Math.random() * 80 + 10}%`;
      const left = `${Math.random() * 80 + 10}%`;

      const baseSize = isMobile ? 110 : 90;
      const minSize = isMobile ? 45 : 30;
      const size = Math.max(minSize, baseSize - round * 5);

      const shapes = [Target, Square, Triangle, Star];
      const ShapeComponent = shapes[Math.floor(Math.random() * shapes.length)];

      const targetProps: TargetProps = {
        top,
        left,
        size,
        shape: ShapeComponent,
        color: "bg-primary",
      };

      onSetTargetProps(targetProps);
      return Math.max(1000, 2500 - round * 100); // 시간 제한 반환
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error("Target mode setup failed")
      );
      return 2000; // 기본값
    }
  }, [isMobile, round, onSetTargetProps, onError]);

  const setupColorMode = useCallback(() => {
    try {
      const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
      ];
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
        [displayedColors[i], displayedColors[j]] = [
          displayedColors[j],
          displayedColors[i],
        ];
      }

      const targetProps: TargetProps = {
        top: "50%",
        left: "50%",
        size: 80,
        shape: Square,
        color: displayedColors[0],
        correctColor,
      };

      onSetTargetProps(targetProps);
      return Math.max(2000, 3000 - round * 100); // 시간 제한 반환
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error("Color mode setup failed")
      );
      return 3000; // 기본값
    }
  }, [round, onSetTargetProps, onError]);

  const setupSequenceMode = useCallback(() => {
    try {
      const sequenceLength = Math.min(3 + Math.floor(round / 2), 8);
      const targetSequence = Array.from({ length: sequenceLength }, () =>
        Math.floor(Math.random() * 4)
      );

      const targetProps: TargetProps = {
        top: "50%",
        left: "50%",
        size: 60,
        shape: Square,
        color: "bg-primary",
        targetSequence,
        currentSequence: [],
        sequenceStep: 0,
      };

      onSetTargetProps(targetProps);
      return Math.max(3000, 5000 - round * 200); // 시간 제한 반환
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error("Sequence mode setup failed")
      );
      return 5000; // 기본값
    }
  }, [round, onSetTargetProps, onError]);

  const setupGameMode = useCallback(() => {
    try {
      switch (gameMode) {
        case "target":
          return setupTargetMode();
        case "color":
          return setupColorMode();
        case "sequence":
          return setupSequenceMode();
        default:
          return 0; // normal, ranked 모드는 타겟 설정 불필요
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error("Game mode setup failed")
      );
      return 0;
    }
  }, [gameMode, setupTargetMode, setupColorMode, setupSequenceMode, onError]);

  const getRandomDelay = useCallback(() => {
    return Math.random() * 2000 + 1000;
  }, []);

  return {
    setupGameMode,
    getRandomDelay,
  };
};
