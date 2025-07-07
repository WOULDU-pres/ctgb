
import { useState, useCallback, Suspense, lazy, memo, useMemo } from "react";
import { SettingsToggle } from "@/components/SettingsToggle";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { TutorialHelpButton } from "@/components/tutorial/TutorialProvider";
import { GameMode } from "@/hooks/useGameLogic";

// Lazy load game components for better code splitting
const MenuScreen = lazy(() => import("@/components/game/MenuScreen"));
const GameScreen = lazy(() => import("@/components/game/GameScreen"));
const ResultScreen = lazy(() => import("@/components/game/ResultScreen"));

// Memoized loading fallback component to prevent re-creation
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

type AppState = 'menu' | 'playing' | 'results';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [results, setResults] = useState<number[]>([]);
  const [profile, setProfile] = useState({ nickname: 'Guest', characteristic: '새로운 도전자' });

  // Memoize totalRounds calculation to prevent recalculation on every render
  const totalRounds = useMemo(() => {
    return gameMode === 'ranked' || gameMode === 'target' || gameMode === 'color' || gameMode === 'sequence' ? 10 : 1;
  }, [gameMode]);

  const handleStartGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setResults([]);
    setAppState('playing');
  }, []);

  const handleRoundComplete = useCallback((time: number) => {
    setResults(prevResults => {
      const newResults = [...prevResults, time];
      if (newResults.length >= totalRounds) {
        setAppState('results');
      }
      return newResults;
    });
  }, [totalRounds]);

  const handleGoToMenu = useCallback(() => {
    setAppState('menu');
  }, []);

  // Memoize retry handler to prevent ResultScreen re-renders
  const handleRetry = useCallback(() => handleStartGame(gameMode), [handleStartGame, gameMode]);

  // Memoize current round calculation
  const currentRound = useMemo(() => results.length + 1, [results.length]);

  // Memoize the render function to prevent unnecessary re-calculations
  const renderApp = useMemo(() => {
    switch (appState) {
      case 'menu':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MenuScreen onStartGame={handleStartGame} />
          </Suspense>
        );
      case 'playing':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <GameScreen
              key={results.length}
              round={currentRound}
              totalRounds={totalRounds}
              onRoundComplete={handleRoundComplete}
              gameMode={gameMode}
            />
          </Suspense>
        );
      case 'results':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ResultScreen
              results={results}
              onRetry={handleRetry}
              onGoToMenu={handleGoToMenu}
              gameMode={gameMode}
            />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MenuScreen onStartGame={handleStartGame} />
          </Suspense>
        );
    }
  }, [appState, handleStartGame, currentRound, totalRounds, handleRoundComplete, gameMode, results, handleRetry, handleGoToMenu]);

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:no-underline"
      >
        메인 콘텐츠로 건너뛰기
      </a>
      
       <header className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <TutorialHelpButton />
        <SettingsToggle />
        <ProfileAvatar
          nickname={profile.nickname}
          characteristic={profile.characteristic}
          onProfileChange={setProfile}
        />
      </header>
      <main 
        id="main-content" 
        className="min-h-screen w-full flex items-center justify-center"
        role="main"
        aria-label="QuickTap Arena 게임 영역"
      >
        <div className="w-full max-w-6xl px-4">
          {renderApp}
        </div>
      </main>
    </div>
  );
};

// Memo wrap the entire Index component to prevent unnecessary re-renders
export default memo(Index);
