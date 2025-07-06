import { useCallback, useEffect, useState } from "react";
import { useGameState, GameMode, GameState, TargetProps } from "./useGameState";
import { useGameTimer } from "./useGameTimer";
import { useGameModeLogic } from "./useGameModeLogic";

type UseGameLogicProps = {
  onRoundComplete: (time: number) => void;
  round: number;
  gameMode: GameMode;
  isCountdownOver: boolean;
  onError?: (error: Error) => void;
};

export const useGameLogic = ({
  onRoundComplete,
  round,
  gameMode,
  isCountdownOver,
  onError,
}: UseGameLogicProps) => {
  const [isGameActive, setIsGameActive] = useState(false);

  const {
    gameState,
    reactionTime,
    targetProps,
    setTargetProps,
    resetGame,
    startGame,
    endGame,
    setTooSoon,
    backgroundColor,
  } = useGameState({ gameMode });

  const handleTimerError = useCallback(
    (error: Error) => {
      console.error("Timer error:", error);
      onError?.(error);
      // 에러 발생 시 게임 상태 초기화
      resetGame();
    },
    [onError, resetGame]
  );

  const handleGameModeError = useCallback(
    (error: Error) => {
      console.error("Game mode error:", error);
      onError?.(error);
    },
    [onError]
  );

  const handleGameReady = useCallback(() => {
    try {
      startGame();
      setIsGameActive(true);
    } catch (error) {
      handleTimerError(
        error instanceof Error ? error : new Error("Game start failed")
      );
    }
  }, [startGame, handleTimerError]);

  const { startTimer, startMissTimer, getElapsedTime, stop, cleanup } =
    useGameTimer({
      onTimeout: handleGameReady,
      onError: handleTimerError,
    });

  const { setupGameMode, getRandomDelay } = useGameModeLogic({
    gameMode,
    round,
    onSetTargetProps: setTargetProps,
    onError: handleGameModeError,
  });

  // 게임 초기화 및 시작
  useEffect(() => {
    if (!isCountdownOver) {
      setIsGameActive(false);
      return;
    }

    try {
      resetGame();
      const delay = getRandomDelay();
      const timeLimit = setupGameMode();

      // 게임 시작 타이머
      startTimer(delay);

      // 타겟 모드의 경우 시간 제한 설정
      if (timeLimit > 0) {
        startMissTimer(delay + timeLimit, () => {
          if ("vibrate" in navigator) navigator.vibrate([100, 30, 100]);
          onRoundComplete(3000);
        });
      }
    } catch (error) {
      handleTimerError(
        error instanceof Error ? error : new Error("Game initialization failed")
      );
    }

    return () => {
      cleanup();
      setIsGameActive(false);
    };
  }, [
    isCountdownOver,
    gameMode,
    round,
    onRoundComplete,
    resetGame,
    getRandomDelay,
    setupGameMode,
    startTimer,
    startMissTimer,
    cleanup,
    handleTimerError,
  ]);

  const handleSuccess = useCallback(() => {
    try {
      if (!isGameActive) return;

      stop();
      const time = getElapsedTime();
      endGame(time);
      setIsGameActive(false);

      if ("vibrate" in navigator) navigator.vibrate(50);
    } catch (error) {
      handleTimerError(
        error instanceof Error ? error : new Error("Success handling failed")
      );
    }
  }, [isGameActive, stop, getElapsedTime, endGame, handleTimerError]);

  const handleScreenClick = useCallback(() => {
    try {
      if (!isCountdownOver) return;

      if (gameState === "waiting") {
        stop();
        setTooSoon();
        setIsGameActive(false);
        if ("vibrate" in navigator) navigator.vibrate([100, 30, 100]);
      } else if (gameState === "ready") {
        if (gameMode === "normal" || gameMode === "ranked") {
          handleSuccess();
        }
      } else if (gameState === "tooSoon") {
        onRoundComplete(5000);
      } else if (gameState === "result" && reactionTime !== null) {
        onRoundComplete(reactionTime);
      }
    } catch (error) {
      handleTimerError(
        error instanceof Error
          ? error
          : new Error("Screen click handling failed")
      );
    }
  }, [
    isCountdownOver,
    gameState,
    gameMode,
    reactionTime,
    onRoundComplete,
    stop,
    setTooSoon,
    handleSuccess,
    handleTimerError,
  ]);

  const handleTargetClick = useCallback(
    (e: React.MouseEvent, colorChoice?: string, sequenceChoice?: number) => {
      try {
        e.stopPropagation();

        if (gameState !== "ready" || !isGameActive) return;

        if (gameMode === "target") {
          handleSuccess();
        } else if (gameMode === "color" && targetProps?.correctColor) {
          if (colorChoice === targetProps.correctColor) {
            handleSuccess();
          } else {
            if ("vibrate" in navigator) navigator.vibrate([100, 30, 100]);
            onRoundComplete(3000);
          }
        } else if (
          gameMode === "sequence" &&
          targetProps?.targetSequence &&
          sequenceChoice !== undefined
        ) {
          const newSequence = [
            ...(targetProps.currentSequence || []),
            sequenceChoice,
          ];
          const currentStep = targetProps.sequenceStep || 0;

          if (sequenceChoice === targetProps.targetSequence[currentStep]) {
            if (newSequence.length === targetProps.targetSequence.length) {
              handleSuccess();
            } else {
              setTargetProps((prev) =>
                prev
                  ? {
                      ...prev,
                      currentSequence: newSequence,
                      sequenceStep: currentStep + 1,
                    }
                  : null
              );
            }
          } else {
            if ("vibrate" in navigator) navigator.vibrate([100, 30, 100]);
            onRoundComplete(3000);
          }
        }
      } catch (error) {
        handleTimerError(
          error instanceof Error
            ? error
            : new Error("Target click handling failed")
        );
      }
    },
    [
      gameState,
      gameMode,
      targetProps,
      isGameActive,
      handleSuccess,
      onRoundComplete,
      setTargetProps,
      handleTimerError,
    ]
  );

  return {
    gameState,
    reactionTime,
    targetProps,
    handleScreenClick,
    handleTargetClick,
    backgroundColor,
    setTargetProps,
  };
};

// 타입들을 re-export
export type { GameState, GameMode, TargetProps } from "./useGameState";
