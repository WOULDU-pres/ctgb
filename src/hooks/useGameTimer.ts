import { useRef, useCallback, useEffect } from "react";

interface UseGameTimerProps {
  onTimeout: () => void;
  onError?: (error: Error) => void;
}

export const useGameTimer = ({ onTimeout, onError }: UseGameTimerProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const missTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    try {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (missTimeoutRef.current) {
        clearTimeout(missTimeoutRef.current);
        missTimeoutRef.current = null;
      }
      isActiveRef.current = false;
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error("Timer cleanup failed")
      );
    }
  }, [onError]);

  // 컴포넌트 언마운트 시 반드시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startTimer = useCallback(
    (delay: number) => {
      try {
        cleanup(); // 기존 타이머 정리

        isActiveRef.current = true;
        timerRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            startTimeRef.current = performance.now();
            onTimeout();
          }
        }, delay);
      } catch (error) {
        onError?.(
          error instanceof Error ? error : new Error("Timer start failed")
        );
      }
    },
    [cleanup, onTimeout, onError]
  );

  const startMissTimer = useCallback(
    (delay: number, onMiss: () => void) => {
      try {
        if (missTimeoutRef.current) {
          clearTimeout(missTimeoutRef.current);
        }

        missTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            onMiss();
          }
        }, delay);
      } catch (error) {
        onError?.(
          error instanceof Error ? error : new Error("Miss timer start failed")
        );
      }
    },
    [onError]
  );

  const getElapsedTime = useCallback(() => {
    try {
      if (startTimeRef.current === 0) {
        throw new Error("Timer not started");
      }
      return performance.now() - startTimeRef.current;
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error("Failed to get elapsed time")
      );
      return 0;
    }
  }, [onError]);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    startTimer,
    startMissTimer,
    getElapsedTime,
    stop,
    cleanup,
    isActive: isActiveRef.current,
  };
};
