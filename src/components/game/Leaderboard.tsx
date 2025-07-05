
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Target, Timer, RefreshCw, Palette, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { GameService } from "@/lib/services/game.service";
import { GameMode } from "@/hooks/useGameLogic";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  id: string;
  nickname: string;
  best_time: number;
  rank: number;
  total_games: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboards, setLeaderboards] = useState<Record<GameMode, LeaderboardEntry[]>>({
    normal: [],
    ranked: [],
    target: [],
    color: [],
    sequence: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<GameMode>('ranked');

  const loadLeaderboard = async (gameMode: GameMode) => {
    try {
      const data = await GameService.getLeaderboard(gameMode, 10);
      setLeaderboards(prev => ({
        ...prev,
        [gameMode]: data
      }));
    } catch (error) {
      console.error(`Failed to load ${gameMode} leaderboard:`, error);
    }
  };

  const loadAllLeaderboards = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLeaderboard('normal'),
        loadLeaderboard('ranked'),
        loadLeaderboard('target'),
        loadLeaderboard('color'),
        loadLeaderboard('sequence')
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllLeaderboards();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadAllLeaderboards, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500"><Crown className="w-3 h-3 mr-1" />1위</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">2위</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">3위</Badge>;
    return <Badge variant="outline">{rank}위</Badge>;
  };

  const isCurrentUser = (userId: string) => user?.id === userId;

  const renderLeaderboard = (gameMode: GameMode) => {
    const entries = leaderboards[gameMode];
    
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-12" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>아직 리더보드에 기록이 없습니다.</p>
          <p className="text-sm mt-2">첫 번째 기록을 남겨보세요!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
              isCurrentUser(entry.id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {getRankBadge(entry.rank)}
              <div>
                <p className={`font-medium ${isCurrentUser(entry.id) ? 'text-primary' : ''}`}>
                  {entry.nickname}
                  {isCurrentUser(entry.id) && <span className="ml-2 text-xs text-primary">(나)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.total_games}게임 플레이
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-secondary">
                {entry.best_time.toFixed(0)}ms
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getTabIcon = (mode: GameMode) => {
    switch (mode) {
      case 'normal':
        return <Timer className="w-4 h-4" />;
      case 'ranked':
        return <Trophy className="w-4 h-4" />;
      case 'target':
        return <Target className="w-4 h-4" />;
      case 'color':
        return <Palette className="w-4 h-4" />;
      case 'sequence':
        return <Brain className="w-4 h-4" />;
    }
  };

  const getTabLabel = (mode: GameMode) => {
    switch (mode) {
      case 'normal':
        return '일반';
      case 'ranked':
        return '랭크';
      case 'target':
        return '타겟';
      case 'color':
        return '색상';
      case 'sequence':
        return '순서';
    }
  };
  return (
    <Card className="w-full shadow-glow-secondary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="text-primary animate-pulse" />
            글로벌 랭킹
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadAllLeaderboards}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GameMode)}>
          <TabsList className="grid w-full grid-cols-5">
            {(['normal', 'ranked', 'target', 'color', 'sequence'] as GameMode[]).map((mode) => (
              <TabsTrigger key={mode} value={mode} className="flex items-center gap-1">
                {getTabIcon(mode)}
                <span className="hidden sm:inline">{getTabLabel(mode)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {(['normal', 'ranked', 'target', 'color', 'sequence'] as GameMode[]).map((mode) => (
            <TabsContent key={mode} value={mode} className="mt-4">
              {renderLeaderboard(mode)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
