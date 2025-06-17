import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Target, Keyboard, Smartphone } from "lucide-react";
import { useState } from "react";
import { AchievementsDialog } from "./AchievementsDialog";
import { useAchievements } from "@/hooks/useAchievements";

type MenuScreenProps = {
  onStartGame: (mode: 'normal' | 'ranked' | 'target') => void;
};

const MenuScreen = ({ onStartGame }: MenuScreenProps) => {
  const [showAchievements, setShowAchievements] = useState(false);
  const { unlockedIds } = useAchievements();

  return (
    <>
      <div className="text-center animate-fade-in flex flex-col items-center justify-center h-full py-8 sm:py-16">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-4 text-primary animate-glow">QuickTap Arena</h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-12">플레이할 모드를 선택하세요</p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-8 w-full px-4 sm:px-0 sm:w-auto">
          <Button onClick={() => onStartGame('normal')} size="lg" variant="outline" className="h-24 w-full sm:w-64 text-2xl border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-glow-primary" aria-label="일반 모드 시작">
            <Gamepad2 className="mr-4 h-8 w-8" />
            일반 모드
          </Button>
          <Button onClick={() => onStartGame('ranked')} size="lg" variant="outline" className="h-24 w-full sm:w-64 text-2xl border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-glow-primary" aria-label="랭킹 게임 모드 시작">
            <Trophy className="mr-4 h-8 w-8" />
            랭겜 모드
          </Button>
          <Button onClick={() => onStartGame('target')} size="lg" variant="outline" className="h-24 w-full sm:w-64 text-2xl border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground shadow-glow-secondary" aria-label="타겟 모드 시작">
            <Target className="mr-4 h-8 w-8" />
            타겟 모드
          </Button>
        </div>
        
        <div className="mt-8">
            <Button onClick={() => setShowAchievements(true)} variant="ghost" className="text-lg">
                <Trophy className="mr-2 h-5 w-5" />
                업적 보기
            </Button>
        </div>
        
        <div className="mt-12 space-y-6 max-w-xl text-left w-full px-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>일반 모드:</strong> 한 판으로 가볍게 반응 속도를 측정합니다.</p>
            <p><strong>랭겜 모드:</strong> 10판의 평균 반응 속도로 순위를 겨루는 진검승부입니다.</p>
            <p><strong>타겟 모드:</strong> 화면에 나타나는 목표물을 정확하고 빠르게 클릭하세요.</p>
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
        onOpenChange={setShowAchievements}
        unlockedIds={unlockedIds}
      />
    </>
  );
};

export default MenuScreen;
