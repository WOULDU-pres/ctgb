
import { useState, useCallback } from "react";
import MenuScreen from "@/components/game/MenuScreen";
import GameScreen from "@/components/game/GameScreen";
import ResultScreen from "@/components/game/ResultScreen";
import { SettingsToggle } from "@/components/SettingsToggle";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { GameMode } from "@/hooks/useGameLogic";

type AppState = 'menu' | 'playing' | 'results';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [results, setResults] = useState<number[]>([]);
  const [profile, setProfile] = useState({ nickname: 'Guest', characteristic: '새로운 도전자' });

  const totalRounds = gameMode === 'ranked' || gameMode === 'target' || gameMode === 'color' || gameMode === 'sequence' ? 10 : 1;

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

  const renderApp = () => {
    switch (appState) {
      case 'menu':
        return <MenuScreen onStartGame={handleStartGame} />;
      case 'playing':
        return (
          <GameScreen
            key={results.length}
            round={results.length + 1}
            totalRounds={totalRounds}
            onRoundComplete={handleRoundComplete}
            gameMode={gameMode}
          />
        );
      case 'results':
        return (
          <ResultScreen
            results={results}
            onRetry={() => handleStartGame(gameMode)}
            onGoToMenu={handleGoToMenu}
            gameMode={gameMode}
          />
        );
      default:
        return <MenuScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
       <header className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <SettingsToggle />
        <ProfileAvatar
          nickname={profile.nickname}
          characteristic={profile.characteristic}
          onProfileChange={setProfile}
        />
      </header>
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="w-full max-w-6xl px-4">
          {renderApp()}
        </div>
      </div>
    </div>
  );
};

export default Index;
