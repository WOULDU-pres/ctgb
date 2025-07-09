import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/useSettings';
import { Palette, Layout, Eye, Sparkles } from 'lucide-react';

const DisplaySettings = memo(() => {
  const { settings, updateCategorySettings } = useSettings();

  if (!settings) return null;

  const { displaySettings } = settings;

  const layoutOptions = [
    {
      value: 'compact',
      label: '컴팩트',
      description: '공간을 절약하는 간결한 레이아웃',
      icon: <Layout className="w-4 h-4" />
    },
    {
      value: 'standard',
      label: '표준',
      description: '균형잡힌 정보량과 시각성',
      icon: <Eye className="w-4 h-4" />
    },
    {
      value: 'detailed',
      label: '상세',
      description: '모든 정보를 표시하는 넓은 레이아웃',
      icon: <Sparkles className="w-4 h-4" />
    }
  ];

  const colorThemes = [
    {
      value: 'default',
      label: '기본',
      description: '밸런스 잡힌 기본 색상',
      preview: ['bg-primary', 'bg-secondary', 'bg-accent']
    },
    {
      value: 'colorful',
      label: '컬러풀',
      description: '생동감 있는 다채로운 색상',
      preview: ['bg-red-500', 'bg-blue-500', 'bg-green-500']
    },
    {
      value: 'monochrome',
      label: '모노크롬',
      description: '흑백 위주의 미니멀한 색상',
      preview: ['bg-gray-600', 'bg-gray-400', 'bg-gray-300']
    },
    {
      value: 'high-contrast',
      label: '고대비',
      description: '시각적 접근성을 위한 고대비 색상',
      preview: ['bg-yellow-400', 'bg-white', 'bg-black']
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {/* 레이아웃 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <Label className="text-base font-medium">레이아웃 스타일</Label>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {layoutOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
                    displaySettings.preferredLayout === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80'
                  }`}
                  onClick={() => 
                    updateCategorySettings('displaySettings', { preferredLayout: option.value as any })
                  }
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {displaySettings.preferredLayout === option.value && (
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

          {/* 색상 테마 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <Label className="text-base font-medium">색상 테마</Label>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {colorThemes.map((theme) => (
                <div
                  key={theme.value}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
                    displaySettings.colorTheme === theme.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80'
                  }`}
                  onClick={() => 
                    updateCategorySettings('displaySettings', { colorTheme: theme.value as any })
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {theme.preview.map((color, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full ${color} border border-border/20`}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{theme.label}</span>
                        {displaySettings.colorTheme === theme.value && (
                          <Badge variant="secondary" className="text-xs">현재</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 표시 옵션 */}
          <div className="space-y-4">
            <Label className="text-base font-medium">표시 옵션</Label>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="progress-bars">진행률 바</Label>
                  <p className="text-sm text-muted-foreground">
                    목표 달성률과 향상 정도를 시각적으로 표시합니다
                  </p>
                </div>
                <Switch
                  id="progress-bars"
                  checked={displaySettings.showProgressBars}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('displaySettings', { showProgressBars: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trend-charts">트렌드 차트</Label>
                  <p className="text-sm text-muted-foreground">
                    시간별 성과 변화를 그래프로 표시합니다
                  </p>
                </div>
                <Switch
                  id="trend-charts"
                  checked={displaySettings.showTrendCharts}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('displaySettings', { showTrendCharts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comparisons">비교 정보</Label>
                  <p className="text-sm text-muted-foreground">
                    이전 기록, 평균 사용자와의 비교 정보를 표시합니다
                  </p>
                </div>
                <Switch
                  id="comparisons"
                  checked={displaySettings.showComparisons}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('displaySettings', { showComparisons: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="personal-bests">개인 기록 강조</Label>
                  <p className="text-sm text-muted-foreground">
                    개인 최고 기록을 특별히 강조하여 표시합니다
                  </p>
                </div>
                <Switch
                  id="personal-bests"
                  checked={displaySettings.highlightPersonalBests}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('displaySettings', { highlightPersonalBests: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">애니메이션</Label>
                  <p className="text-sm text-muted-foreground">
                    부드러운 전환 효과와 애니메이션을 사용합니다
                  </p>
                </div>
                <Switch
                  id="animations"
                  checked={displaySettings.animationsEnabled}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('displaySettings', { animationsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tooltips">도움말 팁</Label>
                  <p className="text-sm text-muted-foreground">
                    UI 요소에 마우스를 올렸을 때 설명을 표시합니다
                  </p>
                </div>
                <Switch
                  id="tooltips"
                  checked={displaySettings.showTooltips}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('displaySettings', { showTooltips: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-dashed">
            <Label className="text-sm font-medium">레이아웃 미리보기</Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 레이아웃: <span className="font-medium">{layoutOptions.find(o => o.value === displaySettings.preferredLayout)?.label}</span></p>
              <p>• 색상: <span className="font-medium">{colorThemes.find(t => t.value === displaySettings.colorTheme)?.label}</span></p>
              <p>• 활성화된 요소: {[
                displaySettings.showProgressBars && '진행률 바',
                displaySettings.showTrendCharts && '트렌드 차트',
                displaySettings.showComparisons && '비교 정보',
                displaySettings.animationsEnabled && '애니메이션'
              ].filter(Boolean).join(', ') || '없음'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DisplaySettings.displayName = 'DisplaySettings';

export { DisplaySettings };