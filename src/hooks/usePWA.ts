import { useState, useEffect } from 'react';
import { GameService } from '@/lib/services/game.service';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    isOnline: navigator.onLine,
    installPrompt: null
  });

  useEffect(() => {
    // Check if app is running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        'standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone ||
                        document.referrer.includes('android-app://');

    // Check if app is already installed
    const isInstalled = isStandalone || localStorage.getItem('pwa-installed') === 'true';

    setPwaState(prev => ({
      ...prev,
      isStandalone,
      isInstalled
    }));

    // Service Worker registration
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  if (confirm('새로운 버전이 사용 가능합니다. 새로고침하시겠습니까?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: event
      }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA installed successfully');
      localStorage.setItem('pwa-installed', 'true');
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
    };

    // Online/offline status
    const handleOnline = async () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
      // Attempt to sync offline data when coming back online
      try {
        await GameService.syncOfflineResults();
        console.log('Offline results synced successfully');
      } catch (error) {
        console.error('Failed to sync offline results:', error);
      }
    };
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (!pwaState.installPrompt) return false;

    try {
      await pwaState.installPrompt.prompt();
      const choiceResult = await pwaState.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  };

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        ...options
      });

      setTimeout(() => notification.close(), 5000);
      return notification;
    }
    return null;
  };

  const syncGameResults = async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync-game-results');
        console.log('Background sync registered for game results');
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
  };

  return {
    ...pwaState,
    installPWA,
    enableNotifications,
    showNotification,
    syncGameResults
  };
};