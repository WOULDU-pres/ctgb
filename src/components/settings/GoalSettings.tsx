import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/useSettings';
import { Target, Clock, TrendingUp, Zap, Trophy } from 'lucide-react';

const GoalSettings = memo(() => {
  const { settings, updateCategorySettings } = useSettings();

  if (!settings) return null;

  const { goalSettings } = settings;

  const difficultyOptions = [
    {
      value: 'easy',
      label: '쉬움',
      description: '달성하기 쉬운 목표로 꾸준한 성취감을 제공',
      icon: <Target className="w-4 h-4 text-green-500" />,
      color: 'text-green-500'
    },
    {
      value: 'medium',
      label: '보통',
      description: '적당한 도전과 성취감의 균형',
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
      color: 'text-blue-500'
    },
    {
      value: 'hard',
      label: '어려움',
      description: '도전적인 목표로 큰 성취감을 추구',
      icon: <Zap className="w-4 h-4 text-red-500" />,
      color: 'text-red-500'
    }
  ];

  const celebrationOptions = [
    {
      value: 'minimal',
      label: '최소',
      description: '간단한 텍스트 알림만 표시'
    },
    {
      value: 'standard',
      label: '표준',
      description: '아이콘과 함께 적당한 강조'
    },
    {
      value: 'enthusiastic',
      label: '열정적',
      description: '화려한 애니메이션과 축하 효과'
    }
  ];

  const goalTypeData = [
    {
      key: 'accuracy',
      label: '정확도 향상',
      description: '클릭 정확도를 점진적으로 개선하는 목표',
      icon: <Target className="w-4 h-4 text-blue-500" />,
      example: '예: 정확도 85% → 90% 달성하기'
    },
    {
      key: 'speed',
      label: '속도 개선',
      description: '반응 속도를 빠르게 만드는 목표',
      icon: <Zap className="w-4 h-4 text-yellow-500" />,
      example: '예: 평균 반응시간 250ms → 200ms 달성하기'
    },
    {
      key: 'consistency',
      label: '일관성 유지',
      description: '꾸준한 성과를 유지하는 목표',
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
      example: '예: 5회 연속 게임에서 정확도 80% 이상 유지하기'
    },
    {
      key: 'endurance',
      label: '지구력 향상',
      description: '긴 시간 플레이 시에도 성과를 유지하는 목표',
      icon: <Clock className="w-4 h-4 text-purple-500" />,
      example: '예: 30초 이상 플레이 시 정확도 75% 이상 유지하기'
    },
    {
      key: 'personalBest',
      label: '개인 기록 갱신',
      description: '자신의 최고 기록을 뛰어넘는 목표',
      icon: <Trophy className="w-4 h-4 text-orange-500" />,
      example: '예: 개인 최고 점수 1250점 → 1300점 달성하기'
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {/* 자동 목표 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-goals">자동 목표 설정</Label>
                <p className="text-sm text-muted-foreground">
                  게임 성과를 분석하여 달성 가능한 목표를 자동으로 생성합니다
                </p>
              </div>
              <Switch
                id="auto-goals"
                checked={goalSettings.autoSetGoals}
                onCheckedChange={(checked) => 
                  updateCategorySettings('goalSettings', { autoSetGoals: checked })
                }
              />
            </div>
          </div>

          {/* 목표 난이도 설정 */}
          <div className="space-y-4">
            <Label className="text-base font-medium">목표 난이도</Label>
            
            <div className="grid grid-cols-1 gap-3">
              {difficultyOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
                    goalSettings.difficultyPreference === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80'
                  }`}
                  onClick={() => 
                    updateCategorySettings('goalSettings', { difficultyPreference: option.value as any })
                  }
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {goalSettings.difficultyPreference === option.value && (
                          <Badge variant="secondary" className="text-xs">현재</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 목표 유형 선택 */}
          <div className="space-y-4">
            <Label className="text-base font-medium">목표 유형</Label>
            <p className="text-sm text-muted-foreground">활성화할 목표 유형을 선택하세요</p>
            
            <div className="space-y-3">
              {goalTypeData.map((goalType) => (
                <div key={goalType.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {goalType.icon}
                      <div>
                        <Label htmlFor={goalType.key}>{goalType.label}</Label>
                        <p className="text-sm text-muted-foreground">{goalType.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={goalType.key}
                      checked={goalSettings.goalTypes[goalType.key]}
                      onCheckedChange={(checked) => 
                        updateCategorySettings('goalSettings', { 
                          goalTypes: { ...goalSettings.goalTypes, [goalType.key]: checked }
                        })
                      }
                    />
                  </div>
                  {goalSettings.goalTypes[goalType.key] && (
                    <div className="ml-7 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      {goalType.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 목표 달성 축하 설정 */}
          <div className="space-y-4">
            <Label htmlFor="celebration-style" className="text-base font-medium">목표 달성 축하</Label>
            <Select
              value={goalSettings.achievementCelebration}
              onValueChange={(value: 'minimal' | 'standard' | 'enthusiastic') =>
                updateCategorySettings('goalSettings', { achievementCelebration: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {celebrationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 현재 설정 요약 */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-dashed">
            <Label className="text-sm font-medium">현재 목표 설정 요약</Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 자동 목표: <span className="font-medium">{goalSettings.autoSetGoals ? '활성화' : '비활성화'}</span></p>
              <p>• 난이도: <span className="font-medium">
                {difficultyOptions.find(o => o.value === goalSettings.difficultyPreference)?.label}
              </span></p>
              <p>• 활성화된 목표 유형: <span className="font-medium">
                {Object.entries(goalSettings.goalTypes)
                  .filter(([_, enabled]) => enabled)
                  .map(([key]) => goalTypeData.find(g => g.key === key)?.label)
                  .join(', ') || '없음'}
              </span></p>
              <p>• 축하 스타일: <span className="font-medium">
                {celebrationOptions.find(o => o.value === goalSettings.achievementCelebration)?.label}
              </span></p>
            </div>
          </div>

          {/* 목표 시스템 설명 */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-600">목표 시스템 작동 방식</Label>
            </div>
            <div className="text-xs text-blue-600/80 space-y-1">
              <p>• 개인 성과 분석을 바탕으로 달성 가능한 목표를 자동 생성합니다</p>
              <p>• 난이도에 따라 목표 달성률 60-90% 범위에서 조정됩니다</p>
              <p>• 목표 달성 시 새로운 목표가 자동으로 설정됩니다</p>
              <p>• 각 목표 유형별로 독립적인 진행률을 추적합니다</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

GoalSettings.displayName = 'GoalSettings';

export { GoalSettings };