import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnalyticsSettings } from '@/types/analytics';
import { SettingsManager } from '@/lib/settings/settingsManager';
import { SETTINGS_PRESETS } from '@/lib/settings/settingsDefaults';

/**
 * 설정 관리 React Hook
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AnalyticsSettings>();
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // 설정 매니저 인스턴스 (싱글톤)
  const settingsManagerRef = useRef<SettingsManager>();
  
  if (!settingsManagerRef.current) {
    settingsManagerRef.current = new SettingsManager();
  }
  
  const settingsManager = settingsManagerRef.current;

  // 초기 설정 로드
  useEffect(() => {
    try {
      const currentSettings = settingsManager.getSettings();
      setSettings(currentSettings);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setLastError('설정을 불러오는데 실패했습니다.');
      setIsLoading(false);
    }
  }, [settingsManager]);

  // 설정 변경 리스너 등록
  useEffect(() => {
    const unsubscribe = settingsManager.addListener((newSettings) => {
      setSettings(newSettings);
      setLastError(null);
    });

    return unsubscribe;
  }, [settingsManager]);

  /**
   * 전체 설정 업데이트
   */
  const updateSettings = useCallback(async (newSettings: AnalyticsSettings): Promise<void> => {
    try {
      setLastError(null);
      settingsManager.updateSettings(newSettings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 업데이트에 실패했습니다.';
      setLastError(errorMessage);
      throw error;
    }
  }, [settingsManager]);

  /**
   * 부분 설정 업데이트
   */
  const updatePartialSettings = useCallback(async (partialSettings: Partial<AnalyticsSettings>): Promise<void> => {
    try {
      setLastError(null);
      settingsManager.updatePartialSettings(partialSettings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 업데이트에 실패했습니다.';
      setLastError(errorMessage);
      throw error;
    }
  }, [settingsManager]);

  /**
   * 카테고리별 설정 업데이트
   */
  const updateCategorySettings = useCallback(async <T extends keyof AnalyticsSettings>(
    category: T,
    categorySettings: Partial<AnalyticsSettings[T]>
  ): Promise<void> => {
    try {
      setLastError(null);
      settingsManager.updateCategorySettings(category, categorySettings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 업데이트에 실패했습니다.';
      setLastError(errorMessage);
      throw error;
    }
  }, [settingsManager]);

  /**
   * 프리셋 적용
   */
  const applyPreset = useCallback(async (presetName: keyof typeof SETTINGS_PRESETS): Promise<void> => {
    try {
      setLastError(null);
      settingsManager.applyPreset(presetName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '프리셋 적용에 실패했습니다.';
      setLastError(errorMessage);
      throw error;
    }
  }, [settingsManager]);

  /**
   * 설정 초기화
   */
  const resetToDefaults = useCallback(async (): Promise<void> => {
    try {
      setLastError(null);
      settingsManager.resetToDefaults();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 초기화에 실패했습니다.';
      setLastError(errorMessage);
      throw error;
    }
  }, [settingsManager]);

  /**
   * 카테고리 초기화
   */
  const resetCategory = useCallback(async <T extends keyof AnalyticsSettings>(category: T): Promise<void> => {
    try {
      setLastError(null);
      settingsManager.resetCategory(category);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '카테고리 초기화에 실패했습니다.';
      setLastError(errorMessage);
      throw error;
    }
  }, [settingsManager]);

  /**
   * 설정 내보내기
   */
  const exportSettings = useCallback((): string => {
    try {
      return settingsManager.exportSettings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 내보내기에 실패했습니다.';
      setLastError(errorMessage);
      throw error;
    }
  }, [settingsManager]);

  /**
   * 설정 가져오기
   */
  const importSettings = useCallback(async (jsonData: string): Promise<void> => {
    try {
      setLastError(null);
      settingsManager.importSettings(jsonData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 가져오기에 실패했습니다.';
      setLastError(errorMessage);
      throw error;
    }
  }, [settingsManager]);

  /**
   * 메시지 표시 가능 여부 확인
   */
  const shouldShowMessage = useCallback((messageType: 'achievement' | 'encouragement' | 'advice' | 'goal'): boolean => {
    return settingsManager.shouldShowMessage(messageType);
  }, [settingsManager]);

  /**
   * 조용한 시간 여부 확인
   */
  const isQuietTime = useCallback((): boolean => {
    return settingsManager.isQuietTime();
  }, [settingsManager]);

  /**
   * 설정 요약 정보
   */
  const settingsSummary = useMemo(() => {
    return settingsManager.getSettingsSummary();
  }, [settingsManager, settings]); // settings를 dependency에 추가하여 변경 시 재계산

  /**
   * 카테고리별 설정 접근자
   */
  const categorySettings = useMemo(() => {
    if (!settings) return {};
    
    return {
      basic: {
        enableDetailedAnalysis: settings.enableDetailedAnalysis,
        showRankings: settings.showRankings,
        enablePredictions: settings.enablePredictions,
        autoAnalysis: settings.autoAnalysis,
        analysisDepth: settings.analysisDepth,
      },
      messages: settings.messageSettings,
      goals: settings.goalSettings,
      display: settings.displaySettings,
      notifications: settings.notificationSettings,
      privacy: settings.privacySettings,
      accessibility: settings.accessibilitySettings,
    };
  }, [settings]);

  /**
   * 개별 설정 토글 헬퍼
   */
  const toggleSetting = useCallback(async (path: string): Promise<void> => {
    if (!settings) return;
    
    // 점 표기법으로 중첩된 속성에 접근 (예: "messageSettings.enableAchievementMessages")
    const keys = path.split('.');
    let current: any = settings;
    
    // 현재 값을 찾기
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
      if (!current) return;
    }
    
    const finalKey = keys[keys.length - 1];
    const currentValue = current[finalKey];
    
    if (typeof currentValue === 'boolean') {
      // 업데이트할 객체 구성
      const updateObj: any = {};
      let updateCurrent = updateObj;
      
      // 중첩 객체 구조 생성
      for (let i = 0; i < keys.length - 1; i++) {
        updateCurrent[keys[i]] = {};
        updateCurrent = updateCurrent[keys[i]];
      }
      updateCurrent[finalKey] = !currentValue;
      
      await updatePartialSettings(updateObj);
    }
  }, [settings, updatePartialSettings]);

  /**
   * 설정 검색
   */
  const searchSettings = useCallback((searchTerm: string) => {
    if (!settings || !searchTerm.trim()) return [];
    
    const results: Array<{
      category: string;
      key: string;
      value: any;
      path: string;
    }> = [];
    
    const search = (obj: any, category: string, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = prefix ? `${prefix}.${key}` : key;
        
        if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            category,
            key,
            value,
            path: currentPath,
          });
        }
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          search(value, category, currentPath);
        }
      }
    };
    
    Object.entries(categorySettings).forEach(([category, categoryValue]) => {
      search(categoryValue, category);
    });
    
    return results;
  }, [settings, categorySettings]);

  return {
    // 상태
    settings,
    isLoading,
    lastError,
    settingsSummary,
    categorySettings,
    
    // 설정 업데이트
    updateSettings,
    updatePartialSettings,
    updateCategorySettings,
    toggleSetting,
    
    // 프리셋 및 초기화
    applyPreset,
    resetToDefaults,
    resetCategory,
    
    // 가져오기/내보내기
    exportSettings,
    importSettings,
    
    // 유틸리티
    shouldShowMessage,
    isQuietTime,
    searchSettings,
    
    // 에러 처리
    clearError: () => setLastError(null),
  };
};