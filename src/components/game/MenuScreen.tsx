import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Target, Keyboard, Smartphone, BarChart3, Users, Swords, Palette, Brain } from "lucide-react";
import { useState, memo, useCallback } from "react";
import { AchievementsDialog } from "./AchievementsDialog";
import { useAchievements } from "@/hooks/useAchievements";
import { UserStatsDialog } from "@/components/stats/UserStatsDialog";
import { FriendsDialog } from "@/components/social/FriendsDialog";
import { ChallengesDialog } from "@/components/challenges/ChallengesDialog";
import { useAuth } from "@/contexts/AuthContext";
import { GameMode } from "@/hooks/useGameLogic";

type MenuScreenProps = {
  onStartGame: (mode: GameMode) => void;
};

const MenuScreen = ({ onStartGame }: MenuScreenProps) => {
  const [showAchievements, setShowAchievements] = useState(false);
  const { unlockedIds } = useAchievements();
  const { user } = useAuth();

  // Memoize game mode handlers to prevent button re-renders
  const handleNormalMode = useCallback(() => onStartGame('normal'), [onStartGame]);
  const handleRankedMode = useCallback(() => onStartGame('ranked'), [onStartGame]);
  const handleTargetMode = useCallback(() => onStartGame('target'), [onStartGame]);
  const handleColorMode = useCallback(() => onStartGame('color'), [onStartGame]);
  const handleSequenceMode = useCallback(() => onStartGame('sequence'), [onStartGame]);

  // Memoize achievement dialog handlers
  const handleShowAchievements = useCallback(() => setShowAchievements(true), []);
  const handleCloseAchievements = useCallback(() => setShowAchievements(false), []);

  return (
    <>
      <div className="text-center animate-fade-in flex flex-col items-center justify-center h-full py-8 sm:py-16">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-4 text-primary animate-glow">QuickTap Arena</h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-12">플레이할 모드를 선택하세요</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 w-full px-4 sm:px-0 max-w-7xl">
          <Button onClick={handleNormalMode} size="lg" variant="outline" className="h-24 w-full text-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-glow-primary" aria-label="일반 모드 시작">
            <Gamepad2 className="mr-3 h-6 w-6" />
            일반 모드
          </Button>
          <Button onClick={handleRankedMode} size="lg" variant="outline" className="h-24 w-full text-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-glow-primary" aria-label="랭킹 게임 모드 시작">
            <Trophy className="mr-3 h-6 w-6" />
            랭겜 모드
          </Button>
          <Button onClick={handleTargetMode} size="lg" variant="outline" className="h-24 w-full text-xl border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground shadow-glow-secondary" aria-label="타겟 모드 시작">
            <Target className="mr-3 h-6 w-6" />
            타겟 모드
          </Button>
          <Button onClick={handleColorMode} size="lg" variant="outline" className="h-24 w-full text-xl border-green-500 text-green-500 hover:bg-green-500 hover:text-white shadow-glow-green" aria-label="색상 매칭 모드 시작">
            <Palette className="mr-3 h-6 w-6" />
            색상 매칭
          </Button>
          <Button onClick={handleSequenceMode} size="lg" variant="outline" className="h-24 w-full text-xl border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white shadow-glow-purple" aria-label="순서 기억 모드 시작">
            <Brain className="mr-3 h-6 w-6" />
            순서 기억
          </Button>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Button onClick={handleShowAchievements} variant="ghost" className="text-lg">
                <Trophy className="mr-2 h-5 w-5" />
                업적 보기
            </Button>
            {user && (
                <>
                    <UserStatsDialog
                        trigger={
                            <Button variant="ghost" className="text-lg">
                                <BarChart3 className="mr-2 h-5 w-5" />
                                나의 통계
                            </Button>
                        }
                    />
                    <FriendsDialog
                        trigger={
                            <Button variant="ghost" className="text-lg">
                                <Users className="mr-2 h-5 w-5" />
                                친구 관리
                            </Button>
                        }
                    />
                    <ChallengesDialog
                        trigger={
                            <Button variant="ghost" className="text-lg">
                                <Swords className="mr-2 h-5 w-5" />
                                도전 관리
                            </Button>
                        }
                    />
                </>
            )}
        </div>
        
        <div className="mt-12 space-y-6 max-w-xl text-left w-full px-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>일반 모드:</strong> 한 판으로 가볍게 반응 속도를 측정합니다.</p>
            <p><strong>랭겜 모드:</strong> 10판의 평균 반응 속도로 순위를 겨루는 진검승부입니다.</p>
            <p><strong>타겟 모드:</strong> 화면에 나타나는 목표물을 정확하고 빠르게 클릭하세요.</p>
            <p><strong>색상 매칭:</strong> 표시된 색상과 같은 색상을 빠르게 선택하세요.</p>
            <p><strong>순서 기억:</strong> 나타나는 순서를 기억하고 같은 순서로 클릭하세요.</p>
          </div>

          <div className="pt-6 border-t border-border/40">
            <h3 className="font-semibold text-base text-foreground mb-3 text-center">게임 방법</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 justify-center">
                    <Keyboard className="w-4 h-4 text-foreground/80 shrink-0"/>
                    <strong>키보드:</strong>
                    <span>스페이스바를 눌러 시작하고 진행할 수 있습니다.</span>
                </p>
                <p className="flex items-center gap-2 justify-center">
                    <Smartphone className="w-4 h-4 text-foreground/80 shrink-0"/>
                    <strong>모바일:</strong>
                    <span>화면을 터치하여 플레이하세요. 진동 피드백을 지원합니다.</span>
                </p>
            </div>
          </div>
        </div>
      </div>
      <AchievementsDialog
        open={showAchievements}
        onOpenChange={handleCloseAchievements}
        unlockedIds={unlockedIds}
      />
    </>
  );
};

export default memo(MenuScreen);
