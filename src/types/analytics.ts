import { GameMode } from '@/hooks/useGameLogic';

// 게임 결과 데이터 모델
export interface GameResult {
  gameId: string;
  results: number[];
  gameMode: GameMode;
  timestamp: number;
  accuracy: number;
  deviceInfo: {
    type: 'mobile' | 'desktop';
    userAgent: string;
  };
  sessionDuration: number;
}

// 성과 메트릭스
export interface PerformanceMetrics {
  averageTime: number;
  consistency: number; // 표준편차 기반
  improvement: number; // 이전 대비 향상률 (%)
  rank: number; // 상위 몇 % (0-100)
  streak: number; // 연속 성공 횟수
  bestTime: number; // 개인 최고 기록
  gamesPlayed: number;
}

// 시간대별 성과 분석
export interface TimeBasedPerformance {
  hour: number; // 0-23
  averageTime: number;
  gamesPlayed: number;
  accuracy: number;
}

// 게임 모드별 성과 분석
export interface ModeBasedPerformance {
  mode: GameMode;
  averageTime: number;
  gamesPlayed: number;
  improvement: number;
  personalBest: number;
}

// 사용자 인사이트
export interface UserInsights {
  strongPoints: string[];
  weakPoints: string[];
  bestTimeOfDay: {
    hour: number;
    performance: number;
  };
  bestGameMode: GameMode;
  recommendedMode: GameMode;
  nextGoal: {
    type: 'time' | 'consistency' | 'accuracy' | 'streak';
    target: number;
    current: number;
    progress: number; // 0-100
  };
}

// 성과 트렌드 데이터
export interface PerformanceTrend {
  period: 'daily' | 'weekly' | 'monthly';
  data: {
    date: string;
    averageTime: number;
    gamesPlayed: number;
    improvement: number;
  }[];
  overall: {
    trend: 'improving' | 'declining' | 'stable';
    percentage: number;
  };
}

// 개인화된 메시지
export interface PersonalizedMessage {
  type: 'encouragement' | 'advice' | 'achievement' | 'goal';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  actionable?: {
    text: string;
    action: string;
  };
}

// 전체 분석 결과
export interface AnalysisResult {
  gameResult: GameResult;
  metrics: PerformanceMetrics;
  insights: UserInsights;
  trends: PerformanceTrend;
  messages: PersonalizedMessage[];
  comparisons: {
    previousGame?: PerformanceMetrics;
    personalBest: PerformanceMetrics;
    averageUser: PerformanceMetrics;
  };
}

// 사용자 설정
export interface AnalyticsSettings {
  // 기본 분석 설정
  enableDetailedAnalysis: boolean;
  showRankings: boolean;
  enablePredictions: boolean;
  autoAnalysis: boolean; // 게임 완료 시 자동 분석 실행
  analysisDepth: 'basic' | 'standard' | 'detailed'; // 분석 깊이
  
  // 메시지 및 피드백 설정
  messageSettings: {
    enableAchievementMessages: boolean;
    enableEncouragementMessages: boolean;
    enableAdviceMessages: boolean;
    enableGoalMessages: boolean;
    messageFrequency: 'minimal' | 'balanced' | 'detailed'; // 메시지 표시 빈도
    motivationStyle: 'supportive' | 'challenging' | 'neutral'; // 메시지 톤
  };
  
  // 목표 설정
  goalSettings: {
    autoSetGoals: boolean;
    difficultyPreference: 'easy' | 'medium' | 'hard';
    goalTypes: {
      enableTimeGoals: boolean;
      enableConsistencyGoals: boolean;
      enableAccuracyGoals: boolean;
      enableStreakGoals: boolean;
    };
    achievementCelebration: 'minimal' | 'standard' | 'enthusiastic';
  };
  
  // 표시 및 UI 설정
  displaySettings: {
    preferredLayout: 'compact' | 'standard' | 'detailed';
    showProgressBars: boolean;
    showTrendCharts: boolean;
    showComparisons: boolean;
    highlightPersonalBests: boolean;
    colorTheme: 'default' | 'colorful' | 'monochrome' | 'high-contrast';
    animationsEnabled: boolean;
    showTooltips: boolean;
  };
  
  // 알림 설정
  notificationSettings: {
    enableInsightNotifications: boolean;
    enableGoalReminders: boolean;
    enableCelebrations: boolean;
    notificationTiming: 'immediate' | 'delayed' | 'manual';
    quietHours: {
      enabled: boolean;
      startHour: number; // 0-23
      endHour: number; // 0-23
    };
  };
  
  // 개인정보 및 데이터 설정
  privacySettings: {
    shareAnonymousData: boolean;
    enablePersonalization: boolean;
    dataRetentionDays: number; // 데이터 보관 기간
    enableCaching: boolean;
    exportDataOnRequest: boolean;
  };
  
  // 접근성 설정
  accessibilitySettings: {
    enableScreenReaderSupport: boolean;
    enableHighContrast: boolean;
    reducedMotion: boolean;
    largerText: boolean;
    enableKeyboardNavigation: boolean;
  };
}

// 저장된 분석 데이터 (localStorage 구조)
export interface StoredAnalyticsData {
  gameResults: GameResult[];
  settings: AnalyticsSettings;
  userProfile: {
    createdAt: number;
    totalGamesPlayed: number;
    achievedGoals: string[];
    preferences: {
      favoriteMode: GameMode;
      preferredDifficulty: string;
    };
  };
  cache: {
    lastAnalysis: AnalysisResult | null;
    lastUpdated: number;
  };
}