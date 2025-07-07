import { 
  GameResult, 
  AnalysisResult, 
  StoredAnalyticsData, 
  AnalyticsSettings,
  PerformanceMetrics 
} from '@/types/analytics';
import { GameMode } from '@/hooks/useGameLogic';
import { PerformanceAnalyzer } from './performanceAnalyzer';
import { InsightGenerator } from './insightGenerator';

/**
 * 분석 데이터 관리자
 * 게임 결과 저장, 분석 실행, 캐시 관리 등을 담당
 */
export class AnalyticsManager {
  private static readonly STORAGE_KEY = 'ctgb_analytics_data';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5분

  private data: StoredAnalyticsData;

  constructor() {
    this.data = this.loadData();
  }

  /**
   * 저장된 데이터 로드
   */
  private loadData(): StoredAnalyticsData {
    try {
      const stored = localStorage.getItem(AnalyticsManager.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredAnalyticsData;
        // 데이터 마이그레이션 및 유효성 검사
        return this.migrateAndValidateData(parsed);
      }
    } catch (error) {
      console.warn('Failed to load analytics data:', error);
    }

    // 기본 데이터 구조 반환
    return this.createDefaultData();
  }

  /**
   * 기본 데이터 구조 생성
   */
  private createDefaultData(): StoredAnalyticsData {
    return {
      gameResults: [],
      settings: {
        enableDetailedAnalysis: true,
        showRankings: true,
        enablePredictions: true,
        goalSettings: {
          autoSetGoals: true,
          difficultyPreference: 'medium'
        },
        privacySettings: {
          shareAnonymousData: true,
          enablePersonalization: true
        }
      },
      userProfile: {
        createdAt: Date.now(),
        totalGamesPlayed: 0,
        achievedGoals: [],
        preferences: {
          favoriteMode: 'normal',
          preferredDifficulty: 'medium'
        }
      },
      cache: {
        lastAnalysis: null,
        lastUpdated: 0
      }
    };
  }

  /**
   * 데이터 마이그레이션 및 유효성 검사
   */
  private migrateAndValidateData(data: Partial<StoredAnalyticsData>): StoredAnalyticsData {
    const defaultData = this.createDefaultData();
    
    return {
      gameResults: Array.isArray(data.gameResults) ? data.gameResults : [],
      settings: { ...defaultData.settings, ...data.settings },
      userProfile: { ...defaultData.userProfile, ...data.userProfile },
      cache: { ...defaultData.cache, ...data.cache }
    };
  }

  /**
   * 데이터 저장
   */
  private saveData(): void {
    try {
      const dataToSave = {
        ...this.data,
        // 최대 1000개의 최신 게임 결과만 저장 (용량 제한)
        gameResults: this.data.gameResults
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 1000)
      };
      
      localStorage.setItem(AnalyticsManager.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
      // 용량 초과 시 오래된 데이터 삭제 후 재시도
      this.cleanupOldData();
      try {
        localStorage.setItem(AnalyticsManager.STORAGE_KEY, JSON.stringify(this.data));
      } catch (retryError) {
        console.error('Failed to save analytics data after cleanup:', retryError);
      }
    }
  }

  /**
   * 오래된 데이터 정리
   */
  private cleanupOldData(): void {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.data.gameResults = this.data.gameResults.filter(
      game => game.timestamp > thirtyDaysAgo
    );
  }

  /**
   * 게임 결과 저장
   */
  saveGameResult(
    results: number[], 
    gameMode: GameMode, 
    accuracy: number = 100,
    sessionDuration: number = 0
  ): void {
    const gameResult: GameResult = {
      gameId: this.generateGameId(),
      results,
      gameMode,
      timestamp: Date.now(),
      accuracy,
      deviceInfo: {
        type: this.detectDeviceType(),
        userAgent: navigator.userAgent
      },
      sessionDuration
    };

    this.data.gameResults.push(gameResult);
    this.data.userProfile.totalGamesPlayed++;
    
    // 즐겨찾는 모드 업데이트
    this.updateFavoriteMode(gameMode);
    
    // 캐시 무효화
    this.data.cache.lastAnalysis = null;
    this.data.cache.lastUpdated = 0;

    this.saveData();
  }

  /**
   * 게임 ID 생성
   */
  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 디바이스 타입 감지
   */
  private detectDeviceType(): 'mobile' | 'desktop' {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      ? 'mobile' 
      : 'desktop';
  }

  /**
   * 즐겨찾는 모드 업데이트
   */
  private updateFavoriteMode(gameMode: GameMode): void {
    const modeCount: { [key in GameMode]: number } = {
      normal: 0,
      ranked: 0,
      target: 0,
      color: 0,
      sequence: 0
    };

    // 최근 30일 게임 데이터 기준
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentGames = this.data.gameResults.filter(game => game.timestamp > thirtyDaysAgo);

    recentGames.forEach(game => {
      modeCount[game.gameMode]++;
    });

    // 가장 많이 플레이한 모드를 즐겨찾는 모드로 설정
    const favoriteMode = Object.entries(modeCount).reduce((a, b) => 
      modeCount[a[0] as GameMode] > modeCount[b[0] as GameMode] ? a : b
    )[0] as GameMode;

    this.data.userProfile.preferences.favoriteMode = favoriteMode;
  }

  /**
   * 전체 게임 분석 실행
   */
  analyzeGameResult(gameResult: GameResult): AnalysisResult {
    // 캐시 확인
    if (this.isCacheValid() && this.data.cache.lastAnalysis) {
      return this.data.cache.lastAnalysis;
    }

    const analyzer = new PerformanceAnalyzer(this.data);
    const insightGenerator = new InsightGenerator(this.data);

    // 기본 메트릭스 계산
    const metrics = analyzer.calculateMetrics(gameResult);
    
    // 시간대별 및 모드별 성과 분석
    const timeBasedPerformance = analyzer.analyzeTimeBasedPerformance();
    const modeBasedPerformance = analyzer.analyzeModeBasedPerformance();
    
    // 인사이트 생성
    const insights = insightGenerator.generateUserInsights(
      metrics, 
      timeBasedPerformance, 
      modeBasedPerformance
    );
    
    // 트렌드 분석
    const trends = analyzer.analyzePerformanceTrend('daily');
    
    // 개인화된 메시지 생성
    const messages = insightGenerator.generatePersonalizedMessages(
      gameResult, 
      metrics, 
      insights
    );

    // 비교 데이터 생성
    const comparisons = this.generateComparisons(gameResult, metrics);

    const result: AnalysisResult = {
      gameResult,
      metrics,
      insights,
      trends,
      messages,
      comparisons
    };

    // 캐시 저장
    this.data.cache.lastAnalysis = result;
    this.data.cache.lastUpdated = Date.now();
    this.saveData();

    return result;
  }

  /**
   * 캐시 유효성 확인
   */
  private isCacheValid(): boolean {
    return (Date.now() - this.data.cache.lastUpdated) < AnalyticsManager.CACHE_DURATION;
  }

  /**
   * 비교 데이터 생성
   */
  private generateComparisons(gameResult: GameResult, currentMetrics: PerformanceMetrics) {
    const analyzer = new PerformanceAnalyzer(this.data);

    // 이전 게임과 비교
    const recentGames = this.data.gameResults
      .filter(game => game.gameMode === gameResult.gameMode)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(1, 2); // 현재 게임 제외하고 바로 이전 게임

    const previousGame = recentGames[0];
    const previousMetrics = previousGame ? analyzer.calculateMetrics(previousGame) : undefined;

    // 개인 최고 기록
    const personalBestTime = Math.min(
      ...this.data.gameResults
        .filter(game => game.gameMode === gameResult.gameMode)
        .map(game => Math.min(...game.results))
    );

    const personalBest: PerformanceMetrics = {
      averageTime: personalBestTime || currentMetrics.averageTime,
      consistency: 0,
      improvement: 0,
      rank: 1,
      streak: 0,
      bestTime: personalBestTime || currentMetrics.averageTime,
      gamesPlayed: 1
    };

    // 평균 사용자 (가상 데이터)
    const averageUser: PerformanceMetrics = {
      averageTime: 1.2,
      consistency: 0.25,
      improvement: 0,
      rank: 50,
      streak: 3,
      bestTime: 0.9,
      gamesPlayed: 50
    };

    return {
      previousGame: previousMetrics,
      personalBest,
      averageUser
    };
  }

  /**
   * 설정 업데이트
   */
  updateSettings(newSettings: Partial<AnalyticsSettings>): void {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
  }

  /**
   * 목표 달성 기록
   */
  recordGoalAchievement(goalId: string): void {
    if (!this.data.userProfile.achievedGoals.includes(goalId)) {
      this.data.userProfile.achievedGoals.push(goalId);
      this.saveData();
    }
  }

  /**
   * 통계 조회
   */
  getStatistics() {
    const analyzer = new PerformanceAnalyzer(this.data);
    
    return {
      totalGames: this.data.gameResults.length,
      timeBasedPerformance: analyzer.analyzeTimeBasedPerformance(),
      modeBasedPerformance: analyzer.analyzeModeBasedPerformance(),
      trends: analyzer.analyzePerformanceTrend('weekly'),
      userProfile: this.data.userProfile
    };
  }

  /**
   * 데이터 초기화
   */
  resetData(): void {
    this.data = this.createDefaultData();
    this.saveData();
  }

  /**
   * 데이터 내보내기
   */
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * 데이터 가져오기
   */
  importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData) as Partial<StoredAnalyticsData>;
      this.data = this.migrateAndValidateData(importedData);
      this.saveData();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}