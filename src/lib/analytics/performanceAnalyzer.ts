import { 
  GameResult, 
  PerformanceMetrics, 
  UserInsights, 
  PerformanceTrend,
  TimeBasedPerformance,
  ModeBasedPerformance,
  StoredAnalyticsData 
} from '@/types/analytics';
import { GameMode } from '@/hooks/useGameLogic';

/**
 * 성과 분석 엔진
 * 게임 결과를 분석하여 의미 있는 통찰을 제공
 */
export class PerformanceAnalyzer {
  private data: StoredAnalyticsData;

  constructor(data: StoredAnalyticsData) {
    this.data = data;
  }

  /**
   * 기본 성과 메트릭스 계산
   */
  calculateMetrics(gameResult: GameResult): PerformanceMetrics {
    const { results } = gameResult;
    const averageTime = this.calculateAverage(results);
    const consistency = this.calculateConsistency(results);
    const improvement = this.calculateImprovement(gameResult);
    const rank = this.calculateRank(averageTime);
    const streak = this.calculateStreak(gameResult);
    const bestTime = this.getPersonalBest(gameResult.gameMode);
    const gamesPlayed = this.getGamesPlayedCount(gameResult.gameMode);

    return {
      averageTime,
      consistency,
      improvement,
      rank,
      streak,
      bestTime,
      gamesPlayed
    };
  }

  /**
   * 평균 계산
   */
  private calculateAverage(results: number[]): number {
    if (results.length === 0) return 0;
    return results.reduce((sum, time) => sum + time, 0) / results.length;
  }

  /**
   * 일관성 계산 (낮을수록 일관됨)
   */
  private calculateConsistency(results: number[]): number {
    if (results.length <= 1) return 0;
    
    const average = this.calculateAverage(results);
    const squaredDiffs = results.map(time => Math.pow(time - average, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / results.length;
    return Math.sqrt(variance);
  }

  /**
   * 개선률 계산 (이전 게임들 대비)
   */
  private calculateImprovement(currentGame: GameResult): number {
    const recentGames = this.getRecentGames(currentGame.gameMode, 5);
    if (recentGames.length < 2) return 0;

    const currentAvg = this.calculateAverage(currentGame.results);
    const previousGames = recentGames.slice(0, -1); // 현재 게임 제외
    const previousAvg = this.calculateAverage(
      previousGames.flatMap(game => game.results)
    );

    if (previousAvg === 0) return 0;
    return ((previousAvg - currentAvg) / previousAvg) * 100;
  }

  /**
   * 상대적 순위 계산 (상위 몇 %)
   */
  private calculateRank(averageTime: number): number {
    // 실제로는 서버 데이터를 사용해야 하지만, 
    // 여기서는 가상의 분포를 사용
    const benchmarks = [
      { time: 0.4, rank: 5 },   // 상위 5%
      { time: 0.6, rank: 15 },  // 상위 15%
      { time: 0.8, rank: 35 },  // 상위 35%
      { time: 1.0, rank: 60 },  // 상위 60%
      { time: 1.2, rank: 80 },  // 상위 80%
      { time: 1.5, rank: 95 }   // 상위 95%
    ];

    for (const benchmark of benchmarks) {
      if (averageTime <= benchmark.time) {
        return benchmark.rank;
      }
    }
    return 99; // 하위 1%
  }

  /**
   * 연속 성공 횟수 계산
   */
  private calculateStreak(gameResult: GameResult): number {
    const allGames = this.data.gameResults
      .filter(game => game.gameMode === gameResult.gameMode)
      .sort((a, b) => b.timestamp - a.timestamp);

    let streak = 0;
    const targetTime = 1.0; // 1초 이하를 성공으로 간주

    for (const game of allGames) {
      const gameAvg = this.calculateAverage(game.results);
      if (gameAvg <= targetTime) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 개인 최고 기록 조회
   */
  private getPersonalBest(gameMode: GameMode): number {
    const modeGames = this.data.gameResults.filter(game => game.gameMode === gameMode);
    if (modeGames.length === 0) return 0;

    return Math.min(...modeGames.map(game => this.calculateAverage(game.results)));
  }

  /**
   * 게임 플레이 횟수 조회
   */
  private getGamesPlayedCount(gameMode?: GameMode): number {
    if (gameMode) {
      return this.data.gameResults.filter(game => game.gameMode === gameMode).length;
    }
    return this.data.gameResults.length;
  }

  /**
   * 최근 게임들 조회
   */
  private getRecentGames(gameMode: GameMode, count: number): GameResult[] {
    return this.data.gameResults
      .filter(game => game.gameMode === gameMode)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  /**
   * 시간대별 성과 분석
   */
  analyzeTimeBasedPerformance(): TimeBasedPerformance[] {
    const hourlyData: { [hour: number]: { times: number[], games: number, accuracies: number[] } } = {};

    // 시간대별 데이터 수집
    this.data.gameResults.forEach(game => {
      const hour = new Date(game.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { times: [], games: 0, accuracies: [] };
      }
      
      hourlyData[hour].times.push(...game.results);
      hourlyData[hour].games++;
      hourlyData[hour].accuracies.push(game.accuracy);
    });

    // 시간대별 성과 계산
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      averageTime: this.calculateAverage(data.times),
      gamesPlayed: data.games,
      accuracy: this.calculateAverage(data.accuracies)
    }));
  }

  /**
   * 게임 모드별 성과 분석
   */
  analyzeModeBasedPerformance(): ModeBasedPerformance[] {
    const modes: GameMode[] = ['normal', 'ranked', 'target', 'color', 'sequence'];
    
    return modes.map(mode => {
      const modeGames = this.data.gameResults.filter(game => game.gameMode === mode);
      const allTimes = modeGames.flatMap(game => game.results);
      
      return {
        mode,
        averageTime: this.calculateAverage(allTimes),
        gamesPlayed: modeGames.length,
        improvement: this.calculateModeImprovement(mode),
        personalBest: this.getPersonalBest(mode)
      };
    });
  }

  /**
   * 모드별 개선률 계산
   */
  private calculateModeImprovement(mode: GameMode): number {
    const recentGames = this.getRecentGames(mode, 10);
    if (recentGames.length < 5) return 0;

    const recent = recentGames.slice(0, 5);
    const previous = recentGames.slice(5, 10);

    const recentAvg = this.calculateAverage(recent.flatMap(game => game.results));
    const previousAvg = this.calculateAverage(previous.flatMap(game => game.results));

    if (previousAvg === 0) return 0;
    return ((previousAvg - recentAvg) / previousAvg) * 100;
  }

  /**
   * 성과 트렌드 분석
   */
  analyzePerformanceTrend(period: 'daily' | 'weekly' | 'monthly'): PerformanceTrend {
    const periodMs = this.getPeriodMs(period);
    const now = Date.now();
    const startTime = now - (periodMs * 30); // 최근 30 period

    const trendData: PerformanceTrend['data'] = [];
    
    for (let i = 0; i < 30; i++) {
      const periodStart = startTime + (i * periodMs);
      const periodEnd = periodStart + periodMs;
      
      const periodGames = this.data.gameResults.filter(
        game => game.timestamp >= periodStart && game.timestamp < periodEnd
      );

      if (periodGames.length > 0) {
        const allTimes = periodGames.flatMap(game => game.results);
        const averageTime = this.calculateAverage(allTimes);
        
        trendData.push({
          date: new Date(periodStart).toISOString().split('T')[0],
          averageTime,
          gamesPlayed: periodGames.length,
          improvement: this.calculatePeriodImprovement(periodGames, period)
        });
      }
    }

    const overall = this.calculateOverallTrend(trendData);

    return {
      period,
      data: trendData,
      overall
    };
  }

  /**
   * 기간별 ms 계산
   */
  private getPeriodMs(period: 'daily' | 'weekly' | 'monthly'): number {
    switch (period) {
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * 기간별 개선률 계산
   */
  private calculatePeriodImprovement(games: GameResult[], period: 'daily' | 'weekly' | 'monthly'): number {
    if (games.length < 2) return 0;

    const sortedGames = games.sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sortedGames.slice(0, Math.floor(sortedGames.length / 2));
    const secondHalf = sortedGames.slice(Math.floor(sortedGames.length / 2));

    const firstAvg = this.calculateAverage(firstHalf.flatMap(game => game.results));
    const secondAvg = this.calculateAverage(secondHalf.flatMap(game => game.results));

    if (firstAvg === 0) return 0;
    return ((firstAvg - secondAvg) / firstAvg) * 100;
  }

  /**
   * 전반적인 트렌드 계산
   */
  private calculateOverallTrend(data: PerformanceTrend['data']): PerformanceTrend['overall'] {
    if (data.length < 2) {
      return { trend: 'stable', percentage: 0 };
    }

    const improvements = data.map(d => d.improvement).filter(imp => imp !== 0);
    if (improvements.length === 0) {
      return { trend: 'stable', percentage: 0 };
    }

    const avgImprovement = this.calculateAverage(improvements);
    
    if (avgImprovement > 5) {
      return { trend: 'improving', percentage: Math.round(avgImprovement) };
    } else if (avgImprovement < -5) {
      return { trend: 'declining', percentage: Math.round(Math.abs(avgImprovement)) };
    } else {
      return { trend: 'stable', percentage: Math.round(Math.abs(avgImprovement)) };
    }
  }
}