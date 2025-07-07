import { useEffect, useRef, useCallback } from 'react';

type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Hook to make announcements to screen readers
 * Uses aria-live regions to communicate dynamic content changes
 */
export const useAnnouncement = () => {
  const politeRegionRef = useRef<HTMLDivElement | null>(null);
  const assertiveRegionRef = useRef<HTMLDivElement | null>(null);

  // Create live regions on mount
  useEffect(() => {
    // Create polite live region
    if (!politeRegionRef.current) {
      const politeRegion = document.createElement('div');
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.setAttribute('class', 'sr-only');
      politeRegion.style.position = 'absolute';
      politeRegion.style.left = '-10000px';
      politeRegion.style.width = '1px';
      politeRegion.style.height = '1px';
      politeRegion.style.overflow = 'hidden';
      document.body.appendChild(politeRegion);
      politeRegionRef.current = politeRegion;
    }

    // Create assertive live region
    if (!assertiveRegionRef.current) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.setAttribute('class', 'sr-only');
      assertiveRegion.style.position = 'absolute';
      assertiveRegion.style.left = '-10000px';
      assertiveRegion.style.width = '1px';
      assertiveRegion.style.height = '1px';
      assertiveRegion.style.overflow = 'hidden';
      document.body.appendChild(assertiveRegion);
      assertiveRegionRef.current = assertiveRegion;
    }

    // Cleanup on unmount
    return () => {
      if (politeRegionRef.current) {
        document.body.removeChild(politeRegionRef.current);
        politeRegionRef.current = null;
      }
      if (assertiveRegionRef.current) {
        document.body.removeChild(assertiveRegionRef.current);
        assertiveRegionRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((
    message: string, 
    priority: AnnouncementPriority = 'polite'
  ) => {
    const region = priority === 'assertive' 
      ? assertiveRegionRef.current 
      : politeRegionRef.current;

    if (region) {
      // Clear the region first
      region.textContent = '';
      
      // Add the message after a brief delay to ensure it's announced
      setTimeout(() => {
        region.textContent = message;
      }, 100);

      // Clear the message after it's been announced
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return {
    announce,
    announcePolite,
    announceAssertive
  };
};