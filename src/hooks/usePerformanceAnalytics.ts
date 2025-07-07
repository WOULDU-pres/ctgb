import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnalysisResult, AnalyticsSettings } from '@/types/analytics';
import { GameMode } from '@/hooks/useGameLogic';
import { AnalyticsManager } from '@/lib/analytics/analyticsManager';

/**
 * 성과 분석 훅
 * 게임 결과 저장, 분석 실행, 통계 조회 등을 제공
 */
export const usePerformanceAnalytics = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

  // 분석 매니저 인스턴스 (메모이제이션)
  const analyticsManager = useMemo(() => new AnalyticsManager(), []);

  /**
   * 게임 결과 저장 및 분석
   */
  const analyzeGameResult = useCallback(async (
    results: number[],
    gameMode: GameMode,
    accuracy: number = 100,
    sessionDuration: number = 0
  ): Promise<AnalysisResult> => {
    setIsAnalyzing(true);
    
    try {
      // 게임 결과 저장
      analyticsManager.saveGameResult(results, gameMode, accuracy, sessionDuration);
      
      // 분석 실행 (비동기 처리로 UI 블로킹 방지)
      const gameResult = {
        gameId: `current_${Date.now()}`,
        results,
        gameMode,
        timestamp: Date.now(),
        accuracy,
        deviceInfo: {
          type: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' as const : 'desktop' as const,
          userAgent: navigator.userAgent
        },
        sessionDuration
      };

      // 약간의 지연을 통해 분석 중임을 시각적으로 표현
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const analysis = analyticsManager.analyzeGameResult(gameResult);
      setLastAnalysis(analysis);
      
      return analysis;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyticsManager]);

  /**
   * 통계 정보 조회
   */
  const getStatistics = useCallback(() => {
    return analyticsManager.getStatistics();
  }, [analyticsManager]);

  /**
   * 설정 업데이트
   */
  const updateSettings = useCallback((newSettings: Partial<AnalyticsSettings>) => {
    analyticsManager.updateSettings(newSettings);
  }, [analyticsManager]);

  /**
   * 목표 달성 기록
   */
  const recordGoalAchievement = useCallback((goalId: string) => {
    analyticsManager.recordGoalAchievement(goalId);
  }, [analyticsManager]);

  /**
   * 데이터 관리 함수들
   */
  const dataManagement = useMemo(() => ({
    reset: () => analyticsManager.resetData(),
    export: () => analyticsManager.exportData(),
    import: (jsonData: string) => analyticsManager.importData(jsonData)
  }), [analyticsManager]);

  /**
   * 성과 요약 정보 (자주 사용되는 정보를 미리 계산)
   */
  const performanceSummary = useMemo(() => {
    const stats = analyticsManager.getStatistics();
    
    // 전체 평균 계산
    const allTimes: number[] = [];
    stats.modeBasedPerformance.forEach(mode => {
      // 각 모드의 평균 시간에 게임 수를 곱해서 전체 시간 추정
      for (let i = 0; i < mode.gamesPlayed; i++) {
        allTimes.push(mode.averageTime);
      }
    });

    const overallAverage = allTimes.length > 0 
      ? allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length 
      : 0;

    // 최근 트렌드
    const recentTrend = stats.trends.overall;
    
    // 최고 성과 모드
    const bestMode = stats.modeBasedPerformance
      .filter(mode => mode.gamesPlayed > 0)
      .sort((a, b) => a.averageTime - b.averageTime)[0];

    return {
      totalGames: stats.totalGames,
      overallAverage,
      recentTrend,
      bestMode: bestMode?.mode || 'normal',
      bestModeTime: bestMode?.averageTime || 0
    };
  }, [analyticsManager]);

  /**
   * 개인화된 추천사항
   */
  const recommendations = useMemo(() => {
    if (!lastAnalysis) return null;

    const { insights, metrics } = lastAnalysis;
    const recommendations: Array<{
      type: 'mode' | 'time' | 'goal';
      title: string;
      description: string;
      action?: string;
    }> = [];

    // 모드 추천
    if (insights.recommendedMode !== insights.bestGameMode) {
      recommendations.push({
        type: 'mode',
        title: `${insights.recommendedMode} 모드 추천`,
        description: '현재 실력 향상에 가장 도움이 될 모드입니다.',
        action: `play_${insights.recommendedMode}`
      });
    }

    // 시간대 추천
    const currentHour = new Date().getHours();
    if (Math.abs(currentHour - insights.bestTimeOfDay.hour) >= 2) {
      const timeText = insights.bestTimeOfDay.hour < 12 
        ? `오전 ${insights.bestTimeOfDay.hour}시` 
        : `오후 ${insights.bestTimeOfDay.hour - 12}시`;
      
      recommendations.push({
        type: 'time',
        title: '최적 플레이 시간',
        description: `${timeText} 근처에서 가장 좋은 성과를 보이고 있습니다.`
      });
    }

    // 목표 추천
    if (insights.nextGoal.progress < 80) {
      const goalTypes = {
        time: '반응속도',
        consistency: '일관성',
        accuracy: '정확도',
        streak: '연속 성공'
      };

      recommendations.push({
        type: 'goal',
        title: `${goalTypes[insights.nextGoal.type]} 목표`,
        description: `${insights.nextGoal.target}${insights.nextGoal.type === 'time' ? '초' : insights.nextGoal.type === 'streak' ? '회' : ''} 달성까지 ${(100 - insights.nextGoal.progress).toFixed(0)}% 남았습니다.`
      });
    }

    return recommendations;
  }, [lastAnalysis]);

  /**
   * 성취 알림 (새로운 기록이나 목표 달성 시)
   */
  const achievements = useMemo(() => {
    if (!lastAnalysis) return [];

    const achievements: Array<{
      type: 'record' | 'goal' | 'rank';
      title: string;
      description: string;
      isNew: boolean;
    }> = [];

    const { metrics, comparisons } = lastAnalysis;

    // 개인 기록 갱신
    if (comparisons.personalBest && metrics.averageTime <= comparisons.personalBest.averageTime) {
      achievements.push({
        type: 'record',
        title: '개인 최고 기록!',
        description: `${metrics.averageTime.toFixed(3)}초로 새로운 기록을 세웠습니다!`,
        isNew: true
      });
    }

    // 순위 상승
    if (comparisons.previousGame && metrics.rank < comparisons.previousGame.rank) {
      const improvement = comparisons.previousGame.rank - metrics.rank;
      achievements.push({
        type: 'rank',
        title: '순위 상승!',
        description: `${improvement}% 순위가 올랐습니다! (상위 ${metrics.rank}%)`,
        isNew: true
      });
    }

    return achievements;
  }, [lastAnalysis]);

  return {
    // 분석 실행
    analyzeGameResult,
    isAnalyzing,
    lastAnalysis,
    
    // 통계 및 정보
    getStatistics,
    performanceSummary,
    
    // 설정 및 목표
    updateSettings,
    recordGoalAchievement,
    
    // 개인화 정보
    recommendations,
    achievements,
    
    // 데이터 관리
    dataManagement
  };
};