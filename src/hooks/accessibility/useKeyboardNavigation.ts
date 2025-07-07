import { useCallback, useEffect } from 'react';

interface UseKeyboardNavigationOptions {
  isActive: boolean;
  onEscape?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  preventDefault?: boolean;
}

/**
 * Hook to handle keyboard navigation patterns
 * Provides consistent keyboard interaction across components
 */
export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions) => {
  const {
    isActive,
    onEscape,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onEnter,
    onSpace,
    onHome,
    onEnd,
    preventDefault = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;

    let handled = false;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          onEscape();
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          onArrowLeft();
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          onArrowRight();
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          onArrowUp();
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          onArrowDown();
          handled = true;
        }
        break;
      case 'Enter':
        if (onEnter) {
          onEnter();
          handled = true;
        }
        break;
      case ' ':
      case 'Space':
        if (onSpace) {
          onSpace();
          handled = true;
        }
        break;
      case 'Home':
        if (onHome) {
          onHome();
          handled = true;
        }
        break;
      case 'End':
        if (onEnd) {
          onEnd();
          handled = true;
        }
        break;
    }

    if (handled && preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [
    isActive,
    onEscape,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onEnter,
    onSpace,
    onHome,
    onEnd,
    preventDefault
  ]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isActive, handleKeyDown]);
};