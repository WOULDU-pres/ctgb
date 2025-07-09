import { AnalyticsSettings } from '@/types/analytics';

/**
 * 기본 분석 설정 값
 */
export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  // 기본 분석 설정
  enableDetailedAnalysis: true,
  showRankings: true,
  enablePredictions: true,
  autoAnalysis: true,
  analysisDepth: 'standard',
  
  // 메시지 및 피드백 설정
  messageSettings: {
    enableAchievementMessages: true,
    enableEncouragementMessages: true,
    enableAdviceMessages: true,
    enableGoalMessages: true,
    messageFrequency: 'balanced',
    motivationStyle: 'supportive',
  },
  
  // 목표 설정
  goalSettings: {
    autoSetGoals: true,
    difficultyPreference: 'medium',
    goalTypes: {
      enableTimeGoals: true,
      enableConsistencyGoals: true,
      enableAccuracyGoals: true,
      enableStreakGoals: true,
    },
    achievementCelebration: 'standard',
  },
  
  // 표시 및 UI 설정
  displaySettings: {
    preferredLayout: 'standard',
    showProgressBars: true,
    showTrendCharts: true,
    showComparisons: true,
    highlightPersonalBests: true,
    colorTheme: 'default',
    animationsEnabled: true,
    showTooltips: true,
  },
  
  // 알림 설정
  notificationSettings: {
    enableInsightNotifications: true,
    enableGoalReminders: true,
    enableCelebrations: true,
    notificationTiming: 'immediate',
    quietHours: {
      enabled: false,
      startHour: 22, // 10 PM
      endHour: 8,    // 8 AM
    },
  },
  
  // 개인정보 및 데이터 설정
  privacySettings: {
    shareAnonymousData: false,
    enablePersonalization: true,
    dataRetentionDays: 30,
    enableCaching: true,
    exportDataOnRequest: true,
  },
  
  // 접근성 설정
  accessibilitySettings: {
    enableScreenReaderSupport: false,
    enableHighContrast: false,
    reducedMotion: false,
    largerText: false,
    enableKeyboardNavigation: true,
  },
};

/**
 * 설정 프리셋
 */
export const SETTINGS_PRESETS = {
  minimal: {
    ...DEFAULT_ANALYTICS_SETTINGS,
    enableDetailedAnalysis: false,
    analysisDepth: 'basic' as const,
    messageSettings: {
      ...DEFAULT_ANALYTICS_SETTINGS.messageSettings,
      messageFrequency: 'minimal' as const,
      enableEncouragementMessages: false,
      enableAdviceMessages: false,
    },
    displaySettings: {
      ...DEFAULT_ANALYTICS_SETTINGS.displaySettings,
      preferredLayout: 'compact' as const,
      showTrendCharts: false,
      showComparisons: false,
      animationsEnabled: false,
    },
    notificationSettings: {
      ...DEFAULT_ANALYTICS_SETTINGS.notificationSettings,
      notificationTiming: 'manual' as const,
      enableInsightNotifications: false,
    },
  },
  
  comprehensive: {
    ...DEFAULT_ANALYTICS_SETTINGS,
    enableDetailedAnalysis: true,
    analysisDepth: 'detailed' as const,
    messageSettings: {
      ...DEFAULT_ANALYTICS_SETTINGS.messageSettings,
      messageFrequency: 'detailed' as const,
      motivationStyle: 'challenging' as const,
    },
    displaySettings: {
      ...DEFAULT_ANALYTICS_SETTINGS.displaySettings,
      preferredLayout: 'detailed' as const,
      colorTheme: 'colorful' as const,
    },
    goalSettings: {
      ...DEFAULT_ANALYTICS_SETTINGS.goalSettings,
      difficultyPreference: 'hard' as const,
      achievementCelebration: 'enthusiastic' as const,
    },
  },
  
  accessibility: {
    ...DEFAULT_ANALYTICS_SETTINGS,
    displaySettings: {
      ...DEFAULT_ANALYTICS_SETTINGS.displaySettings,
      colorTheme: 'high-contrast' as const,
      animationsEnabled: false,
      showTooltips: true,
    },
    accessibilitySettings: {
      enableScreenReaderSupport: true,
      enableHighContrast: true,
      reducedMotion: true,
      largerText: true,
      enableKeyboardNavigation: true,
    },
    notificationSettings: {
      ...DEFAULT_ANALYTICS_SETTINGS.notificationSettings,
      notificationTiming: 'delayed' as const,
    },
  },
} as const;

/**
 * 설정 검증 함수
 */
export const validateSettings = (settings: Partial<AnalyticsSettings>): AnalyticsSettings => {
  // 딥 머지로 기본값과 사용자 설정을 결합
  const validated: AnalyticsSettings = {
    enableDetailedAnalysis: settings.enableDetailedAnalysis ?? DEFAULT_ANALYTICS_SETTINGS.enableDetailedAnalysis,
    showRankings: settings.showRankings ?? DEFAULT_ANALYTICS_SETTINGS.showRankings,
    enablePredictions: settings.enablePredictions ?? DEFAULT_ANALYTICS_SETTINGS.enablePredictions,
    autoAnalysis: settings.autoAnalysis ?? DEFAULT_ANALYTICS_SETTINGS.autoAnalysis,
    analysisDepth: settings.analysisDepth ?? DEFAULT_ANALYTICS_SETTINGS.analysisDepth,
    
    messageSettings: {
      enableAchievementMessages: settings.messageSettings?.enableAchievementMessages ?? DEFAULT_ANALYTICS_SETTINGS.messageSettings.enableAchievementMessages,
      enableEncouragementMessages: settings.messageSettings?.enableEncouragementMessages ?? DEFAULT_ANALYTICS_SETTINGS.messageSettings.enableEncouragementMessages,
      enableAdviceMessages: settings.messageSettings?.enableAdviceMessages ?? DEFAULT_ANALYTICS_SETTINGS.messageSettings.enableAdviceMessages,
      enableGoalMessages: settings.messageSettings?.enableGoalMessages ?? DEFAULT_ANALYTICS_SETTINGS.messageSettings.enableGoalMessages,
      messageFrequency: settings.messageSettings?.messageFrequency ?? DEFAULT_ANALYTICS_SETTINGS.messageSettings.messageFrequency,
      motivationStyle: settings.messageSettings?.motivationStyle ?? DEFAULT_ANALYTICS_SETTINGS.messageSettings.motivationStyle,
    },
    
    goalSettings: {
      autoSetGoals: settings.goalSettings?.autoSetGoals ?? DEFAULT_ANALYTICS_SETTINGS.goalSettings.autoSetGoals,
      difficultyPreference: settings.goalSettings?.difficultyPreference ?? DEFAULT_ANALYTICS_SETTINGS.goalSettings.difficultyPreference,
      goalTypes: {
        enableTimeGoals: settings.goalSettings?.goalTypes?.enableTimeGoals ?? DEFAULT_ANALYTICS_SETTINGS.goalSettings.goalTypes.enableTimeGoals,
        enableConsistencyGoals: settings.goalSettings?.goalTypes?.enableConsistencyGoals ?? DEFAULT_ANALYTICS_SETTINGS.goalSettings.goalTypes.enableConsistencyGoals,
        enableAccuracyGoals: settings.goalSettings?.goalTypes?.enableAccuracyGoals ?? DEFAULT_ANALYTICS_SETTINGS.goalSettings.goalTypes.enableAccuracyGoals,
        enableStreakGoals: settings.goalSettings?.goalTypes?.enableStreakGoals ?? DEFAULT_ANALYTICS_SETTINGS.goalSettings.goalTypes.enableStreakGoals,
      },
      achievementCelebration: settings.goalSettings?.achievementCelebration ?? DEFAULT_ANALYTICS_SETTINGS.goalSettings.achievementCelebration,
    },
    
    displaySettings: {
      preferredLayout: settings.displaySettings?.preferredLayout ?? DEFAULT_ANALYTICS_SETTINGS.displaySettings.preferredLayout,
      showProgressBars: settings.displaySettings?.showProgressBars ?? DEFAULT_ANALYTICS_SETTINGS.displaySettings.showProgressBars,
      showTrendCharts: settings.displaySettings?.showTrendCharts ?? DEFAULT_ANALYTICS_SETTINGS.displaySettings.showTrendCharts,
      showComparisons: settings.displaySettings?.showComparisons ?? DEFAULT_ANALYTICS_SETTINGS.displaySettings.showComparisons,
      highlightPersonalBests: settings.displaySettings?.highlightPersonalBests ?? DEFAULT_ANALYTICS_SETTINGS.displaySettings.highlightPersonalBests,
      colorTheme: settings.displaySettings?.colorTheme ?? DEFAULT_ANALYTICS_SETTINGS.displaySettings.colorTheme,
      animationsEnabled: settings.displaySettings?.animationsEnabled ?? DEFAULT_ANALYTICS_SETTINGS.displaySettings.animationsEnabled,
      showTooltips: settings.displaySettings?.showTooltips ?? DEFAULT_ANALYTICS_SETTINGS.displaySettings.showTooltips,
    },
    
    notificationSettings: {
      enableInsightNotifications: settings.notificationSettings?.enableInsightNotifications ?? DEFAULT_ANALYTICS_SETTINGS.notificationSettings.enableInsightNotifications,
      enableGoalReminders: settings.notificationSettings?.enableGoalReminders ?? DEFAULT_ANALYTICS_SETTINGS.notificationSettings.enableGoalReminders,
      enableCelebrations: settings.notificationSettings?.enableCelebrations ?? DEFAULT_ANALYTICS_SETTINGS.notificationSettings.enableCelebrations,
      notificationTiming: settings.notificationSettings?.notificationTiming ?? DEFAULT_ANALYTICS_SETTINGS.notificationSettings.notificationTiming,
      quietHours: {
        enabled: settings.notificationSettings?.quietHours?.enabled ?? DEFAULT_ANALYTICS_SETTINGS.notificationSettings.quietHours.enabled,
        startHour: settings.notificationSettings?.quietHours?.startHour ?? DEFAULT_ANALYTICS_SETTINGS.notificationSettings.quietHours.startHour,
        endHour: settings.notificationSettings?.quietHours?.endHour ?? DEFAULT_ANALYTICS_SETTINGS.notificationSettings.quietHours.endHour,
      },
    },
    
    privacySettings: {
      shareAnonymousData: settings.privacySettings?.shareAnonymousData ?? DEFAULT_ANALYTICS_SETTINGS.privacySettings.shareAnonymousData,
      enablePersonalization: settings.privacySettings?.enablePersonalization ?? DEFAULT_ANALYTICS_SETTINGS.privacySettings.enablePersonalization,
      dataRetentionDays: settings.privacySettings?.dataRetentionDays ?? DEFAULT_ANALYTICS_SETTINGS.privacySettings.dataRetentionDays,
      enableCaching: settings.privacySettings?.enableCaching ?? DEFAULT_ANALYTICS_SETTINGS.privacySettings.enableCaching,
      exportDataOnRequest: settings.privacySettings?.exportDataOnRequest ?? DEFAULT_ANALYTICS_SETTINGS.privacySettings.exportDataOnRequest,
    },
    
    accessibilitySettings: {
      enableScreenReaderSupport: settings.accessibilitySettings?.enableScreenReaderSupport ?? DEFAULT_ANALYTICS_SETTINGS.accessibilitySettings.enableScreenReaderSupport,
      enableHighContrast: settings.accessibilitySettings?.enableHighContrast ?? DEFAULT_ANALYTICS_SETTINGS.accessibilitySettings.enableHighContrast,
      reducedMotion: settings.accessibilitySettings?.reducedMotion ?? DEFAULT_ANALYTICS_SETTINGS.accessibilitySettings.reducedMotion,
      largerText: settings.accessibilitySettings?.largerText ?? DEFAULT_ANALYTICS_SETTINGS.accessibilitySettings.largerText,
      enableKeyboardNavigation: settings.accessibilitySettings?.enableKeyboardNavigation ?? DEFAULT_ANALYTICS_SETTINGS.accessibilitySettings.enableKeyboardNavigation,
    },
  };

  // 추가 검증 로직
  
  // 조용한 시간 검증
  if (validated.notificationSettings.quietHours.startHour < 0 || validated.notificationSettings.quietHours.startHour > 23) {
    validated.notificationSettings.quietHours.startHour = 22;
  }
  if (validated.notificationSettings.quietHours.endHour < 0 || validated.notificationSettings.quietHours.endHour > 23) {
    validated.notificationSettings.quietHours.endHour = 8;
  }
  
  // 데이터 보관 기간 검증 (1일 ~ 365일)
  if (validated.privacySettings.dataRetentionDays < 1) {
    validated.privacySettings.dataRetentionDays = 1;
  } else if (validated.privacySettings.dataRetentionDays > 365) {
    validated.privacySettings.dataRetentionDays = 365;
  }

  return validated;
};

/**
 * 설정 그룹별 레이블 및 설명
 */
export const SETTINGS_METADATA = {
  basic: {
    title: '기본 분석',
    description: '분석 기능의 기본 동작을 설정합니다.',
  },
  messages: {
    title: '메시지 및 피드백',
    description: '게임 후 받을 메시지의 유형과 스타일을 조정합니다.',
  },
  goals: {
    title: '목표 설정',
    description: '개인 목표 생성과 달성 알림을 설정합니다.',
  },
  display: {
    title: '표시 및 UI',
    description: '인터페이스 레이아웃과 시각적 요소를 조정합니다.',
  },
  notifications: {
    title: '알림',
    description: '알림 타이밍과 조용한 시간을 설정합니다.',
  },
  privacy: {
    title: '개인정보',
    description: '데이터 보관 및 공유 설정을 관리합니다.',
  },
  accessibility: {
    title: '접근성',
    description: '접근성 기능과 화면 읽기 지원을 설정합니다.',
  },
} as const;