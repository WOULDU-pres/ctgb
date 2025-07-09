import { AnalyticsSettings } from '@/types/analytics';
import { DEFAULT_ANALYTICS_SETTINGS, validateSettings, SETTINGS_PRESETS } from './settingsDefaults';

/**
 * 설정 관리 클래스
 * localStorage 기반 설정 저장, 로딩, 업데이트 관리
 */
export class SettingsManager {
  private static readonly STORAGE_KEY = 'ctgb_user_settings';
  private static readonly SETTINGS_VERSION = '1.0.0';
  
  private settings: AnalyticsSettings;
  private listeners: Array<(settings: AnalyticsSettings) => void> = [];

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * localStorage에서 설정 로드
   */
  private loadSettings(): AnalyticsSettings {
    try {
      const stored = localStorage.getItem(SettingsManager.STORAGE_KEY);
      if (!stored) {
        // 첫 방문 시 기본 설정으로 초기화
        this.saveSettings(DEFAULT_ANALYTICS_SETTINGS);
        return DEFAULT_ANALYTICS_SETTINGS;
      }

      const parsed = JSON.parse(stored);
      
      // 버전 체크 및 마이그레이션
      if (parsed.version !== SettingsManager.SETTINGS_VERSION) {
        const migrated = this.migrateSettings(parsed);
        this.saveSettings(migrated);
        return migrated;
      }

      // 설정 유효성 검증
      return validateSettings(parsed.settings || parsed);
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      return DEFAULT_ANALYTICS_SETTINGS;
    }
  }

  /**
   * localStorage에 설정 저장
   */
  private saveSettings(settings: AnalyticsSettings): void {
    try {
      const toStore = {
        version: SettingsManager.SETTINGS_VERSION,
        settings,
        lastUpdated: Date.now(),
      };
      
      localStorage.setItem(SettingsManager.STORAGE_KEY, JSON.stringify(toStore));
      this.notifyListeners(settings);
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      throw new Error('설정 저장에 실패했습니다.');
    }
  }

  /**
   * 설정 버전 호환성을 위한 마이그레이션
   */
  private migrateSettings(oldSettings: any): AnalyticsSettings {
    // 이전 버전의 설정을 현재 버전으로 마이그레이션
    if (!oldSettings.version) {
      // 초기 버전에서 1.0.0으로 마이그레이션
      return validateSettings({
        enableDetailedAnalysis: oldSettings.enableDetailedAnalysis,
        showRankings: oldSettings.showRankings,
        enablePredictions: oldSettings.enablePredictions,
        goalSettings: oldSettings.goalSettings,
        privacySettings: oldSettings.privacySettings,
      });
    }

    // 향후 버전 마이그레이션 로직 추가 위치
    return validateSettings(oldSettings.settings || oldSettings);
  }

  /**
   * 현재 설정 가져오기
   */
  getSettings(): AnalyticsSettings {
    return { ...this.settings };
  }

  /**
   * 전체 설정 업데이트
   */
  updateSettings(newSettings: AnalyticsSettings): void {
    const validated = validateSettings(newSettings);
    this.settings = validated;
    this.saveSettings(validated);
  }

  /**
   * 부분 설정 업데이트
   */
  updatePartialSettings(partialSettings: Partial<AnalyticsSettings>): void {
    const merged = this.deepMerge(this.settings, partialSettings);
    const validated = validateSettings(merged);
    this.settings = validated;
    this.saveSettings(validated);
  }

  /**
   * 특정 카테고리 설정 업데이트
   */
  updateCategorySettings<T extends keyof AnalyticsSettings>(
    category: T,
    categorySettings: Partial<AnalyticsSettings[T]>
  ): void {
    const updated = {
      ...this.settings,
      [category]: {
        ...this.settings[category],
        ...categorySettings,
      },
    };
    this.updateSettings(updated);
  }

  /**
   * 프리셋 적용
   */
  applyPreset(presetName: keyof typeof SETTINGS_PRESETS): void {
    const preset = SETTINGS_PRESETS[presetName];
    this.updateSettings(preset);
  }

  /**
   * 설정 초기화
   */
  resetToDefaults(): void {
    this.updateSettings(DEFAULT_ANALYTICS_SETTINGS);
  }

  /**
   * 특정 카테고리 초기화
   */
  resetCategory<T extends keyof AnalyticsSettings>(category: T): void {
    const defaultValue = DEFAULT_ANALYTICS_SETTINGS[category];
    this.updateCategorySettings(category, defaultValue as Partial<AnalyticsSettings[T]>);
  }

  /**
   * 설정 내보내기 (JSON 형태)
   */
  exportSettings(): string {
    const exportData = {
      version: SettingsManager.SETTINGS_VERSION,
      settings: this.settings,
      exportedAt: new Date().toISOString(),
      source: 'CTGB-QuickTap-Arena',
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 설정 가져오기 (JSON에서)
   */
  importSettings(jsonData: string): void {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.settings) {
        throw new Error('유효하지 않은 설정 파일입니다.');
      }

      // 가져온 설정 검증
      const validated = validateSettings(importData.settings);
      this.updateSettings(validated);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('설정 가져오기에 실패했습니다.');
    }
  }

  /**
   * 설정 변경 리스너 등록
   */
  addListener(callback: (settings: AnalyticsSettings) => void): () => void {
    this.listeners.push(callback);
    
    // 등록 해제 함수 반환
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 리스너들에게 설정 변경 알림
   */
  private notifyListeners(settings: AnalyticsSettings): void {
    this.listeners.forEach(callback => {
      try {
        callback(settings);
      } catch (error) {
        console.error('Settings listener error:', error);
      }
    });
  }

  /**
   * 깊은 병합 유틸리티
   */
  private deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        
        if (
          sourceValue && 
          typeof sourceValue === 'object' && 
          !Array.isArray(sourceValue) &&
          targetValue && 
          typeof targetValue === 'object' && 
          !Array.isArray(targetValue)
        ) {
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }
    
    return result;
  }

  /**
   * 조용한 시간 확인
   */
  isQuietTime(): boolean {
    const { quietHours } = this.settings.notificationSettings;
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    
    // 같은 날짜 내에서의 조용한 시간
    if (quietHours.startHour <= quietHours.endHour) {
      return currentHour >= quietHours.startHour && currentHour < quietHours.endHour;
    }
    
    // 자정을 넘나드는 조용한 시간 (예: 22시 ~ 8시)
    return currentHour >= quietHours.startHour || currentHour < quietHours.endHour;
  }

  /**
   * 메시지 표시 가능 여부 확인
   */
  shouldShowMessage(messageType: 'achievement' | 'encouragement' | 'advice' | 'goal'): boolean {
    const { messageSettings, notificationSettings } = this.settings;
    
    // 조용한 시간 확인
    if (this.isQuietTime() && notificationSettings.notificationTiming !== 'manual') {
      return false;
    }

    // 메시지 타입별 활성화 상태 확인
    const messageTypeMap = {
      achievement: messageSettings.enableAchievementMessages,
      encouragement: messageSettings.enableEncouragementMessages,
      advice: messageSettings.enableAdviceMessages,
      goal: messageSettings.enableGoalMessages,
    };

    return messageTypeMap[messageType];
  }

  /**
   * 설정 요약 정보
   */
  getSettingsSummary(): {
    preset: string | null;
    customized: boolean;
    lastUpdated: number;
  } {
    // 어떤 프리셋과 일치하는지 확인
    for (const [presetName, presetSettings] of Object.entries(SETTINGS_PRESETS)) {
      if (this.deepEqual(this.settings, presetSettings)) {
        return {
          preset: presetName,
          customized: false,
          lastUpdated: Date.now(),
        };
      }
    }

    return {
      preset: null,
      customized: true,
      lastUpdated: Date.now(),
    };
  }

  /**
   * 깊은 동등성 비교
   */
  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return false;
    
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }
}