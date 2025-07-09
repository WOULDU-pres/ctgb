import React, { useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { SETTINGS_PRESETS, SETTINGS_METADATA } from '@/lib/settings/settingsDefaults';
import { AnalyticsSettings } from '@/components/settings/AnalyticsSettings';
import { DisplaySettings } from '@/components/settings/DisplaySettings';
import { GoalSettings } from '@/components/settings/GoalSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { toast } from 'sonner';

interface SettingsPanelProps {
  onClose?: () => void;
  className?: string;
}

const SettingsPanel = memo(({ onClose, className = '' }: SettingsPanelProps) => {
  const {
    settings,
    isLoading,
    lastError,
    settingsSummary,
    applyPreset,
    resetToDefaults,
    exportSettings,
    importSettings,
    clearError,
  } = useSettings();

  const [activeTab, setActiveTab] = useState('basic');
  const [isResetting, setIsResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  /**
   * 프리셋 적용
   */
  const handlePresetApply = async (presetName: keyof typeof SETTINGS_PRESETS) => {
    try {
      await applyPreset(presetName);
      toast.success(`${presetName} 프리셋이 적용되었습니다.`);
    } catch (error) {
      toast.error('프리셋 적용에 실패했습니다.');
    }
  };

  /**
   * 설정 초기화
   */
  const handleReset = async () => {
    if (!window.confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      return;
    }

    setIsResetting(true);
    try {
      await resetToDefaults();
      toast.success('설정이 초기화되었습니다.');
    } catch (error) {
      toast.error('설정 초기화에 실패했습니다.');
    } finally {
      setIsResetting(false);
    }
  };

  /**
   * 설정 내보내기
   */
  const handleExport = () => {
    try {
      const settingsJson = exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ctgb-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('설정이 다운로드되었습니다.');
    } catch (error) {
      toast.error('설정 내보내기에 실패했습니다.');
    }
  };

  /**
   * 설정 가져오기
   */
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        await importSettings(text);
        toast.success('설정을 성공적으로 가져왔습니다.');
      } catch (error) {
        toast.error('설정 파일을 불러오는데 실패했습니다.');
      } finally {
        setIsImporting(false);
      }
    };
    
    input.click();
  };

  if (isLoading) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-muted-foreground">설정을 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-6 h-6" />
            <span>설정을 불러올 수 없습니다.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <div>
              <CardTitle className="text-xl">개인화 설정</CardTitle>
              <CardDescription>
                분석 기능과 사용자 경험을 맞춤 설정하세요
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {settingsSummary.preset && (
              <Badge variant="outline" className="text-xs">
                {settingsSummary.preset} 프리셋
              </Badge>
            )}
            {settingsSummary.customized && (
              <Badge variant="secondary" className="text-xs">
                사용자 정의
              </Badge>
            )}
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                닫기
              </Button>
            )}
          </div>
        </div>

        {lastError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{lastError}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="ml-auto h-6 px-2"
            >
              닫기
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 빠른 프리셋 선택 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">빠른 설정</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SETTINGS_PRESETS).map(([presetName, _]) => (
              <Button
                key={presetName}
                variant="outline"
                size="sm"
                onClick={() => handlePresetApply(presetName as keyof typeof SETTINGS_PRESETS)}
                className="text-xs"
              >
                {presetName === 'minimal' && '최소'}
                {presetName === 'comprehensive' && '종합'}
                {presetName === 'accessibility' && '접근성'}
              </Button>
            ))}
          </div>
        </div>

        {/* 설정 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="basic" className="text-xs">기본</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">메시지</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">목표</TabsTrigger>
            <TabsTrigger value="display" className="text-xs">표시</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">알림</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs">개인정보</TabsTrigger>
            <TabsTrigger value="accessibility" className="text-xs">접근성</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="basic" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium">{SETTINGS_METADATA.basic.title}</h3>
                  <p className="text-sm text-muted-foreground">{SETTINGS_METADATA.basic.description}</p>
                </div>
                <AnalyticsSettings category="basic" />
              </div>
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium">{SETTINGS_METADATA.messages.title}</h3>
                  <p className="text-sm text-muted-foreground">{SETTINGS_METADATA.messages.description}</p>
                </div>
                <AnalyticsSettings category="messages" />
              </div>
            </TabsContent>

            <TabsContent value="goals" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium">{SETTINGS_METADATA.goals.title}</h3>
                  <p className="text-sm text-muted-foreground">{SETTINGS_METADATA.goals.description}</p>
                </div>
                <GoalSettings />
              </div>
            </TabsContent>

            <TabsContent value="display" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium">{SETTINGS_METADATA.display.title}</h3>
                  <p className="text-sm text-muted-foreground">{SETTINGS_METADATA.display.description}</p>
                </div>
                <DisplaySettings />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium">{SETTINGS_METADATA.notifications.title}</h3>
                  <p className="text-sm text-muted-foreground">{SETTINGS_METADATA.notifications.description}</p>
                </div>
                <AnalyticsSettings category="notifications" />
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium">{SETTINGS_METADATA.privacy.title}</h3>
                  <p className="text-sm text-muted-foreground">{SETTINGS_METADATA.privacy.description}</p>
                </div>
                <PrivacySettings />
              </div>
            </TabsContent>

            <TabsContent value="accessibility" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium">{SETTINGS_METADATA.accessibility.title}</h3>
                  <p className="text-sm text-muted-foreground">{SETTINGS_METADATA.accessibility.description}</p>
                </div>
                <AnalyticsSettings category="accessibility" />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* 설정 관리 도구 */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              설정이 자동으로 저장됩니다
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              내보내기
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              disabled={isImporting}
              className="text-xs"
            >
              {isImporting ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              가져오기
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isResetting}
              className="text-xs text-destructive hover:text-destructive"
            >
              {isResetting ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RotateCcw className="w-3 h-3 mr-1" />
              )}
              초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SettingsPanel.displayName = 'SettingsPanel';

export default SettingsPanel;