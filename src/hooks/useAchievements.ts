
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GameMode } from './useGameLogic';
import { Award, Trophy, Star, Medal } from 'lucide-react';

export type AchievementID = 'FIRST_GAME' | 'SUB_200' | 'RANKED_FINISHER' | 'TARGET_MASTER';

export interface Achievement {
  id: AchievementID;
  name: string;
  description: string;
  Icon: React.ElementType;
}

export const allAchievements: Achievement[] = [
  { id: 'FIRST_GAME', name: '첫걸음', description: '첫 게임을 완료했습니다.', Icon: Award },
  { id: 'SUB_200', name: '신속의 증명', description: '200ms 미만의 반응 속도를 기록했습니다.', Icon: Star },
  { id: 'RANKED_FINISHER', name: '랭겜 전사', description: '랭겜 모드를 10라운드 완료했습니다.', Icon: Trophy },
  { id: 'TARGET_MASTER', name: '명사수', description: '타겟 모드를 10라운드 완료했습니다.', Icon: Medal },
];

const getUnlockedAchievements = (): Set<AchievementID> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('unlockedAchievements');
      if (saved) {
        return new Set(JSON.parse(saved) as AchievementID[]);
      }
    }
  } catch (error) {
    console.error('Failed to load achievements from localStorage', error);
  }
  return new Set();
};

export const useAchievements = () => {
  const [unlockedIds, setUnlockedIds] = useState<Set<AchievementID>>(getUnlockedAchievements());

  const unlockAchievement = useCallback((id: AchievementID) => {
    if (!unlockedIds.has(id)) {
      const achievement = allAchievements.find(a => a.id === id);
      if (achievement) {
        toast.success(`업적 달성: ${achievement.name}!`, {
          description: achievement.description,
        });
      }
      
      setUnlockedIds(prevIds => {
        const newUnlockedIds = new Set(prevIds);
        newUnlockedIds.add(id);
        try {
          localStorage.setItem('unlockedAchievements', JSON.stringify(Array.from(newUnlockedIds)));
        } catch (error) {
          console.error('Failed to save achievements to localStorage', error);
        }
        return newUnlockedIds;
      });
    }
  }, [unlockedIds]);

  const checkAchievements = useCallback((results: number[], gameMode: GameMode) => {
    // FIRST_GAME
    unlockAchievement('FIRST_GAME');

    // SUB_200
    if (results.some(r => r < 200)) {
      unlockAchievement('SUB_200');
    }

    // RANKED_FINISHER
    if (gameMode === 'ranked' && results.length >= 10) {
      unlockAchievement('RANKED_FINISHER');
    }

    // TARGET_MASTER
    if (gameMode === 'target' && results.length >= 10) {
      unlockAchievement('TARGET_MASTER');
    }
  }, [unlockAchievement]);

  return { unlockedIds, checkAchievements, allAchievements };
};
