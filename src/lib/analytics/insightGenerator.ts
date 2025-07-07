import { 
  PerformanceMetrics, 
  UserInsights, 
  PersonalizedMessage,
  TimeBasedPerformance,
  ModeBasedPerformance,
  GameResult,
  StoredAnalyticsData 
} from '@/types/analytics';
import { GameMode } from '@/hooks/useGameLogic';

/**
 * 인사이트 생성기
 * 성과 데이터를 바탕으로 개인화된 통찰과 조언을 생성
 */
export class InsightGenerator {
  private data: StoredAnalyticsData;

  constructor(data: StoredAnalyticsData) {
    this.data = data;
  }

  /**
   * 사용자 인사이트 생성
   */
  generateUserInsights(
    metrics: PerformanceMetrics,
    timeBasedPerformance: TimeBasedPerformance[],
    modeBasedPerformance: ModeBasedPerformance[]
  ): UserInsights {
    const strongPoints = this.identifyStrengths(metrics, modeBasedPerformance);
    const weakPoints = this.identifyWeaknesses(metrics, modeBasedPerformance);
    const bestTimeOfDay = this.findBestTimeOfDay(timeBasedPerformance);
    const bestGameMode = this.findBestGameMode(modeBasedPerformance);
    const recommendedMode = this.recommendGameMode(modeBasedPerformance, metrics);
    const nextGoal = this.generateNextGoal(metrics, modeBasedPerformance);

    return {
      strongPoints,
      weakPoints,
      bestTimeOfDay,
      bestGameMode,
      recommendedMode,
      nextGoal
    };
  }

  /**
   * 강점 식별
   */
  private identifyStrengths(
    metrics: PerformanceMetrics, 
    modePerformance: ModeBasedPerformance[]
  ): string[] {
    const strengths: string[] = [];

    // 순위 기반 강점
    if (metrics.rank <= 10) {
      strengths.push('상위권 반응속도');
    } else if (metrics.rank <= 25) {
      strengths.push('우수한 반응속도');
    }

    // 일관성 기반 강점
    if (metrics.consistency < 0.1) {
      strengths.push('뛰어난 일관성');
    } else if (metrics.consistency < 0.2) {
      strengths.push('안정적인 성과');
    }

    // 개선률 기반 강점
    if (metrics.improvement > 10) {
      strengths.push('빠른 학습능력');
    } else if (metrics.improvement > 5) {
      strengths.push('꾸준한 향상');
    }

    // 연속 성공 기반 강점
    if (metrics.streak >= 10) {
      strengths.push('높은 집중력');
    } else if (metrics.streak >= 5) {
      strengths.push('좋은 집중력');
    }

    // 모드별 강점
    const bestMode = modePerformance
      .filter(mode => mode.gamesPlayed > 3)
      .sort((a, b) => a.averageTime - b.averageTime)[0];
    
    if (bestMode) {
      const modeNames = {
        normal: '기본 모드',
        ranked: '랭크 모드',
        target: '타겟 모드',
        color: '색상 모드',
        sequence: '순서 모드'
      };
      strengths.push(`${modeNames[bestMode.mode]} 특화`);
    }

    return strengths.length > 0 ? strengths : ['성장 잠재력'];
  }

  /**
   * 약점 식별
   */
  private identifyWeaknesses(
    metrics: PerformanceMetrics, 
    modePerformance: ModeBasedPerformance[]
  ): string[] {
    const weaknesses: string[] = [];

    // 순위 기반 약점
    if (metrics.rank > 70) {
      weaknesses.push('반응속도 개선 필요');
    }

    // 일관성 기반 약점
    if (metrics.consistency > 0.3) {
      weaknesses.push('일관성 부족');
    }

    // 개선률 기반 약점
    if (metrics.improvement < -5) {
      weaknesses.push('성과 하락세');
    }

    // 모드별 약점
    const worstMode = modePerformance
      .filter(mode => mode.gamesPlayed > 3)
      .sort((a, b) => b.averageTime - a.averageTime)[0];
    
    if (worstMode && worstMode.averageTime > metrics.averageTime * 1.2) {
      const modeNames = {
        normal: '기본 모드',
        ranked: '랭크 모드', 
        target: '타겟 모드',
        color: '색상 모드',
        sequence: '순서 모드'
      };
      weaknesses.push(`${modeNames[worstMode.mode]} 연습 필요`);
    }

    return weaknesses.length > 0 ? weaknesses : ['꾸준한 연습으로 향상 가능'];
  }

  /**
   * 최적 시간대 찾기
   */
  private findBestTimeOfDay(timeBasedPerformance: TimeBasedPerformance[]): UserInsights['bestTimeOfDay'] {
    if (timeBasedPerformance.length === 0) {
      return { hour: 14, performance: 0 }; // 기본값: 오후 2시
    }

    const validPerformances = timeBasedPerformance.filter(
      time => time.gamesPlayed >= 2 && time.averageTime > 0
    );

    if (validPerformances.length === 0) {
      return { hour: 14, performance: 0 };
    }

    const best = validPerformances.reduce((best, current) => 
      current.averageTime < best.averageTime ? current : best
    );

    return {
      hour: best.hour,
      performance: best.averageTime
    };
  }

  /**
   * 최고 게임 모드 찾기
   */
  private findBestGameMode(modeBasedPerformance: ModeBasedPerformance[]): GameMode {
    const validModes = modeBasedPerformance.filter(mode => mode.gamesPlayed > 0);
    
    if (validModes.length === 0) {
      return 'normal';
    }

    const bestMode = validModes.reduce((best, current) => 
      current.averageTime < best.averageTime ? current : best
    );

    return bestMode.mode;
  }

  /**
   * 추천 게임 모드
   */
  private recommendGameMode(modeBasedPerformance: ModeBasedPerformance[], metrics: PerformanceMetrics): GameMode {
    // 일관성이 부족한 경우 기본 모드 추천
    if (metrics.consistency > 0.3) {
      return 'normal';
    }

    // 상위권 실력이면 랭크 모드 추천
    if (metrics.rank <= 25) {
      return 'ranked';
    }

    // 개선이 필요한 모드 찾기
    const needsImprovement = modeBasedPerformance
      .filter(mode => mode.gamesPlayed > 3)
      .sort((a, b) => b.averageTime - a.averageTime)[0];

    if (needsImprovement) {
      return needsImprovement.mode;
    }

    return 'normal';
  }

  /**
   * 다음 목표 생성
   */
  private generateNextGoal(
    metrics: PerformanceMetrics, 
    modeBasedPerformance: ModeBasedPerformance[]
  ): UserInsights['nextGoal'] {
    // 반응속도 개선 목표
    if (metrics.averageTime > 1.0) {
      return {
        type: 'time',
        target: 1.0,
        current: metrics.averageTime,
        progress: Math.max(0, (2.0 - metrics.averageTime) / 1.0 * 100)
      };
    }

    // 일관성 개선 목표
    if (metrics.consistency > 0.2) {
      return {
        type: 'consistency',
        target: 0.2,
        current: metrics.consistency,
        progress: Math.max(0, (0.5 - metrics.consistency) / 0.3 * 100)
      };
    }

    // 연속 성공 목표
    if (metrics.streak < 10) {
      return {
        type: 'streak',
        target: Math.min(metrics.streak + 5, 10),
        current: metrics.streak,
        progress: (metrics.streak / 10) * 100
      };
    }

    // 고급 목표: 0.8초 돌파
    return {
      type: 'time',
      target: 0.8,
      current: metrics.averageTime,
      progress: Math.max(0, (1.2 - metrics.averageTime) / 0.4 * 100)
    };
  }

  /**
   * 개인화된 메시지 생성
   */
  generatePersonalizedMessages(
    gameResult: GameResult,
    metrics: PerformanceMetrics,
    insights: UserInsights
  ): PersonalizedMessage[] {
    const messages: PersonalizedMessage[] = [];

    // 성과 기반 메시지
    messages.push(...this.generatePerformanceMessages(metrics));
    
    // 시간대 기반 메시지
    messages.push(...this.generateTimeBasedMessages(gameResult, insights));
    
    // 목표 기반 메시지
    messages.push(...this.generateGoalMessages(insights.nextGoal));
    
    // 격려/조언 메시지
    messages.push(...this.generateEncouragementMessages(metrics, insights));

    // 우선순위로 정렬하여 상위 3개만 반환
    return messages
      .sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority))
      .slice(0, 3);
  }

  /**
   * 성과 기반 메시지 생성
   */
  private generatePerformanceMessages(metrics: PerformanceMetrics): PersonalizedMessage[] {
    const messages: PersonalizedMessage[] = [];

    // 개인 최고 기록 갱신
    if (metrics.averageTime <= metrics.bestTime) {
      messages.push({
        type: 'achievement',
        title: '🎉 개인 최고 기록 갱신!',
        content: `새로운 개인 기록 ${metrics.averageTime.toFixed(3)}초를 달성했습니다!`,
        priority: 'high'
      });
    }

    // 큰 폭의 개선
    if (metrics.improvement > 15) {
      messages.push({
        type: 'encouragement',
        title: '🚀 놀라운 향상!',
        content: `이전 대비 ${metrics.improvement.toFixed(1)}% 향상된 성과입니다. 정말 대단해요!`,
        priority: 'high'
      });
    }

    // 상위권 진입
    if (metrics.rank <= 10) {
      messages.push({
        type: 'achievement',
        title: '👑 상위권 진입!',
        content: `상위 ${metrics.rank}%에 진입했습니다. 최고의 실력이에요!`,
        priority: 'high'
      });
    }

    return messages;
  }

  /**
   * 시간대 기반 메시지 생성
   */
  private generateTimeBasedMessages(gameResult: GameResult, insights: UserInsights): PersonalizedMessage[] {
    const messages: PersonalizedMessage[] = [];
    const currentHour = new Date(gameResult.timestamp).getHours();
    const bestHour = insights.bestTimeOfDay.hour;

    // 최적 시간대에 플레이 중
    if (Math.abs(currentHour - bestHour) <= 1) {
      messages.push({
        type: 'advice',
        title: '⏰ 최적 시간대!',
        content: `지금은 당신의 최고 컨디션 시간대입니다. 도전적인 모드를 시도해보세요!`,
        priority: 'medium',
        actionable: {
          text: '랭크 모드 도전',
          action: 'play_ranked'
        }
      });
    }

    // 비최적 시간대에 플레이 중
    if (Math.abs(currentHour - bestHour) >= 4) {
      const timeText = bestHour < 12 ? `오전 ${bestHour}시` : `오후 ${bestHour - 12}시`;
      messages.push({
        type: 'advice',
        title: '💡 컨디션 팁',
        content: `${timeText} 근처에서 가장 좋은 성과를 보이고 있어요.`,
        priority: 'low'
      });
    }

    return messages;
  }

  /**
   * 목표 기반 메시지 생성
   */
  private generateGoalMessages(goal: UserInsights['nextGoal']): PersonalizedMessage[] {
    const messages: PersonalizedMessage[] = [];

    if (goal.progress >= 80) {
      messages.push({
        type: 'goal',
        title: '🎯 목표 달성 임박!',
        content: `목표까지 ${(100 - goal.progress).toFixed(0)}% 남았습니다. 조금만 더 화이팅!`,
        priority: 'high'
      });
    } else if (goal.progress >= 50) {
      messages.push({
        type: 'goal',
        title: '📈 목표 진행 중',
        content: `목표 달성률 ${goal.progress.toFixed(0)}%. 꾸준히 발전하고 있어요!`,
        priority: 'medium'
      });
    }

    return messages;
  }

  /**
   * 격려/조언 메시지 생성
   */
  private generateEncouragementMessages(metrics: PerformanceMetrics, insights: UserInsights): PersonalizedMessage[] {
    const messages: PersonalizedMessage[] = [];

    // 개선이 필요한 경우
    if (metrics.improvement < -10) {
      messages.push({
        type: 'advice',
        title: '💪 컨디션 회복 팁',
        content: '최근 성과가 아쉬우시네요. 잠시 휴식을 취하고 기본 모드로 워밍업해보세요.',
        priority: 'medium',
        actionable: {
          text: '기본 모드 연습',
          action: 'play_normal'
        }
      });
    }

    // 일관성 개선 조언
    if (metrics.consistency > 0.3) {
      messages.push({
        type: 'advice',
        title: '🎯 일관성 개선 팁',
        content: '반응속도의 편차가 큽니다. 집중력을 높이고 같은 리듬을 유지해보세요.',
        priority: 'medium'
      });
    }

    // 강점 활용 조언
    if (insights.strongPoints.includes('상위권 반응속도')) {
      messages.push({
        type: 'advice',
        title: '🔥 실력 활용 팁',
        content: `뛰어난 반응속도를 가지고 있습니다. ${insights.recommendedMode} 모드에 도전해보세요!`,
        priority: 'medium'
      });
    }

    return messages;
  }

  /**
   * 우선순위 수치 변환
   */
  private getPriorityValue(priority: PersonalizedMessage['priority']): number {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
    }
  }
}