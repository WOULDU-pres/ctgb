import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/hooks/useSettings';
import { AnalyticsSettings as AnalyticsSettingsType } from '@/types/analytics';

interface AnalyticsSettingsProps {
  category: 'basic' | 'messages' | 'notifications' | 'accessibility';
}

const AnalyticsSettings = memo(({ category }: AnalyticsSettingsProps) => {
  const {
    settings,
    updateCategorySettings,
    updatePartialSettings,
  } = useSettings();

  if (!settings) return null;

  /**
   * 기본 분석 설정
   */
  const renderBasicSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="detailed-analysis">상세 분석</Label>
            <p className="text-sm text-muted-foreground">
              게임 후 상세한 성과 분석을 표시합니다
            </p>
          </div>
          <Switch
            id="detailed-analysis"
            checked={settings.enableDetailedAnalysis}
            onCheckedChange={(checked) => 
              updatePartialSettings({ enableDetailedAnalysis: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-rankings">순위 표시</Label>
            <p className="text-sm text-muted-foreground">
              다른 플레이어와의 상대적 순위를 표시합니다
            </p>
          </div>
          <Switch
            id="show-rankings"
            checked={settings.showRankings}
            onCheckedChange={(checked) => 
              updatePartialSettings({ showRankings: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="predictions">성과 예측</Label>
            <p className="text-sm text-muted-foreground">
              다음 게임 성과에 대한 예측을 제공합니다
            </p>
          </div>
          <Switch
            id="predictions"
            checked={settings.enablePredictions}
            onCheckedChange={(checked) => 
              updatePartialSettings({ enablePredictions: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-analysis">자동 분석</Label>
            <p className="text-sm text-muted-foreground">
              게임 완료 시 자동으로 분석을 실행합니다
            </p>
          </div>
          <Switch
            id="auto-analysis"
            checked={settings.autoAnalysis}
            onCheckedChange={(checked) => 
              updatePartialSettings({ autoAnalysis: checked })
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="analysis-depth">분석 깊이</Label>
        <Select
          value={settings.analysisDepth}
          onValueChange={(value: 'basic' | 'standard' | 'detailed') =>
            updatePartialSettings({ analysisDepth: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">기본 - 핵심 지표만</SelectItem>
            <SelectItem value="standard">표준 - 균형잡힌 분석</SelectItem>
            <SelectItem value="detailed">상세 - 모든 지표 포함</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          분석의 상세함 정도를 조정합니다
        </p>
      </div>
    </div>
  );

  /**
   * 메시지 설정
   */
  const renderMessageSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="achievement-messages">성취 메시지</Label>
            <p className="text-sm text-muted-foreground">
              새 기록이나 목표 달성 시 축하 메시지를 표시합니다
            </p>
          </div>
          <Switch
            id="achievement-messages"
            checked={settings.messageSettings.enableAchievementMessages}
            onCheckedChange={(checked) => 
              updateCategorySettings('messageSettings', { enableAchievementMessages: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="encouragement-messages">격려 메시지</Label>
            <p className="text-sm text-muted-foreground">
              성과 향상이나 좋은 플레이 시 격려 메시지를 표시합니다
            </p>
          </div>
          <Switch
            id="encouragement-messages"
            checked={settings.messageSettings.enableEncouragementMessages}
            onCheckedChange={(checked) => 
              updateCategorySettings('messageSettings', { enableEncouragementMessages: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="advice-messages">조언 메시지</Label>
            <p className="text-sm text-muted-foreground">
              실력 향상을 위한 구체적인 조언을 제공합니다
            </p>
          </div>
          <Switch
            id="advice-messages"
            checked={settings.messageSettings.enableAdviceMessages}
            onCheckedChange={(checked) => 
              updateCategorySettings('messageSettings', { enableAdviceMessages: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="goal-messages">목표 메시지</Label>
            <p className="text-sm text-muted-foreground">
              다음 목표와 진행률에 대한 메시지를 표시합니다
            </p>
          </div>
          <Switch
            id="goal-messages"
            checked={settings.messageSettings.enableGoalMessages}
            onCheckedChange={(checked) => 
              updateCategorySettings('messageSettings', { enableGoalMessages: checked })
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="message-frequency">메시지 빈도</Label>
        <Select
          value={settings.messageSettings.messageFrequency}
          onValueChange={(value: 'minimal' | 'balanced' | 'detailed') =>
            updateCategorySettings('messageSettings', { messageFrequency: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimal">최소 - 중요한 것만</SelectItem>
            <SelectItem value="balanced">균형 - 적당한 수준</SelectItem>
            <SelectItem value="detailed">상세 - 모든 정보</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="motivation-style">동기 부여 스타일</Label>
        <Select
          value={settings.messageSettings.motivationStyle}
          onValueChange={(value: 'supportive' | 'challenging' | 'neutral') =>
            updateCategorySettings('messageSettings', { motivationStyle: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="supportive">지지적 - 따뜻하고 격려하는 톤</SelectItem>
            <SelectItem value="challenging">도전적 - 의욕을 자극하는 톤</SelectItem>
            <SelectItem value="neutral">중립적 - 객관적이고 사실적인 톤</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  /**
   * 알림 설정
   */
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="insight-notifications">인사이트 알림</Label>
            <p className="text-sm text-muted-foreground">
              새로운 패턴이나 통찰 발견 시 알림을 표시합니다
            </p>
          </div>
          <Switch
            id="insight-notifications"
            checked={settings.notificationSettings.enableInsightNotifications}
            onCheckedChange={(checked) => 
              updateCategorySettings('notificationSettings', { enableInsightNotifications: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="goal-reminders">목표 리마인더</Label>
            <p className="text-sm text-muted-foreground">
              설정한 목표에 대한 진행 상황을 주기적으로 알려줍니다
            </p>
          </div>
          <Switch
            id="goal-reminders"
            checked={settings.notificationSettings.enableGoalReminders}
            onCheckedChange={(checked) => 
              updateCategorySettings('notificationSettings', { enableGoalReminders: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="celebrations">축하 효과</Label>
            <p className="text-sm text-muted-foreground">
              목표 달성이나 기록 갱신 시 시각적 축하 효과를 표시합니다
            </p>
          </div>
          <Switch
            id="celebrations"
            checked={settings.notificationSettings.enableCelebrations}
            onCheckedChange={(checked) => 
              updateCategorySettings('notificationSettings', { enableCelebrations: checked })
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="notification-timing">알림 타이밍</Label>
        <Select
          value={settings.notificationSettings.notificationTiming}
          onValueChange={(value: 'immediate' | 'delayed' | 'manual') =>
            updateCategorySettings('notificationSettings', { notificationTiming: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">즉시 - 결과와 함께 표시</SelectItem>
            <SelectItem value="delayed">지연 - 몇 초 후 표시</SelectItem>
            <SelectItem value="manual">수동 - 사용자가 요청할 때만</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="quiet-hours">조용한 시간 활성화</Label>
            <p className="text-sm text-muted-foreground">
              지정한 시간대에는 알림을 표시하지 않습니다
            </p>
          </div>
          <Switch
            id="quiet-hours"
            checked={settings.notificationSettings.quietHours.enabled}
            onCheckedChange={(checked) => 
              updateCategorySettings('notificationSettings', { 
                quietHours: { ...settings.notificationSettings.quietHours, enabled: checked }
              })
            }
          />
        </div>

        {settings.notificationSettings.quietHours.enabled && (
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">시작 시간</Label>
              <Select
                value={settings.notificationSettings.quietHours.startHour.toString()}
                onValueChange={(value) =>
                  updateCategorySettings('notificationSettings', {
                    quietHours: { ...settings.notificationSettings.quietHours, startHour: parseInt(value) }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i < 12 ? `오전 ${i === 0 ? 12 : i}시` : `오후 ${i === 12 ? 12 : i - 12}시`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiet-end">종료 시간</Label>
              <Select
                value={settings.notificationSettings.quietHours.endHour.toString()}
                onValueChange={(value) =>
                  updateCategorySettings('notificationSettings', {
                    quietHours: { ...settings.notificationSettings.quietHours, endHour: parseInt(value) }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i < 12 ? `오전 ${i === 0 ? 12 : i}시` : `오후 ${i === 12 ? 12 : i - 12}시`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * 접근성 설정
   */
  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="screen-reader">스크린 리더 지원</Label>
            <p className="text-sm text-muted-foreground">
              스크린 리더 사용자를 위한 접근성 기능을 활성화합니다
            </p>
          </div>
          <Switch
            id="screen-reader"
            checked={settings.accessibilitySettings.enableScreenReaderSupport}
            onCheckedChange={(checked) => 
              updateCategorySettings('accessibilitySettings', { enableScreenReaderSupport: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="high-contrast">고대비 모드</Label>
            <p className="text-sm text-muted-foreground">
              더 나은 가독성을 위해 고대비 색상을 사용합니다
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={settings.accessibilitySettings.enableHighContrast}
            onCheckedChange={(checked) => 
              updateCategorySettings('accessibilitySettings', { enableHighContrast: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reduced-motion">모션 줄이기</Label>
            <p className="text-sm text-muted-foreground">
              애니메이션과 전환 효과를 최소화합니다
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={settings.accessibilitySettings.reducedMotion}
            onCheckedChange={(checked) => 
              updateCategorySettings('accessibilitySettings', { reducedMotion: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="larger-text">큰 텍스트</Label>
            <p className="text-sm text-muted-foreground">
              더 나은 가독성을 위해 텍스트 크기를 키웁니다
            </p>
          </div>
          <Switch
            id="larger-text"
            checked={settings.accessibilitySettings.largerText}
            onCheckedChange={(checked) => 
              updateCategorySettings('accessibilitySettings', { largerText: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="keyboard-navigation">키보드 탐색</Label>
            <p className="text-sm text-muted-foreground">
              키보드만으로 모든 기능을 사용할 수 있게 합니다
            </p>
          </div>
          <Switch
            id="keyboard-navigation"
            checked={settings.accessibilitySettings.enableKeyboardNavigation}
            onCheckedChange={(checked) => 
              updateCategorySettings('accessibilitySettings', { enableKeyboardNavigation: checked })
            }
          />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (category) {
      case 'basic':
        return renderBasicSettings();
      case 'messages':
        return renderMessageSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'accessibility':
        return renderAccessibilitySettings();
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
});

AnalyticsSettings.displayName = 'AnalyticsSettings';

export { AnalyticsSettings };