import { useEffect, useRef, RefObject } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  initialFocus?: RefObject<HTMLElement>;
  restoreFocus?: boolean;
}

/**
 * Hook to trap focus within a container (e.g., modal, dialog)
 * Ensures keyboard users can't tab outside of the focused area
 */
export const useFocusTrap = (
  containerRef: RefObject<HTMLElement>,
  { isActive, initialFocus, restoreFocus = true }: UseFocusTrapOptions
) => {
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element to restore later
    lastActiveElementRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ');

      return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Set initial focus
    const setInitialFocus = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    // Add event listener for tab key
    document.addEventListener('keydown', handleTabKey);
    
    // Set initial focus with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(setInitialFocus, 10);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      clearTimeout(timeoutId);
      
      // Restore focus to the previously focused element
      if (restoreFocus && lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocus, restoreFocus]);
};