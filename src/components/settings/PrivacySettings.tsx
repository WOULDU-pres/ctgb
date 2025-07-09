import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/useSettings';
import { Shield, Database, Download, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const PrivacySettings = memo(() => {
  const { settings, updateCategorySettings, exportSettings, dataManagement } = useSettings();

  if (!settings) return null;

  const { privacySettings } = settings;

  /**
   * 데이터 내보내기
   */
  const handleExportData = () => {
    try {
      const settingsJson = exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ctgb-data-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('데이터가 성공적으로 내보내기 되었습니다.');
    } catch (error) {
      toast.error('데이터 내보내기에 실패했습니다.');
    }
  };

  /**
   * 데이터 삭제
   */
  const handleDeleteData = () => {
    if (window.confirm(
      '모든 게임 데이터와 분석 정보를 삭제하시겠습니까?\n\n' +
      '이 작업은 되돌릴 수 없으며, 다음 항목들이 모두 삭제됩니다:\n' +
      '• 게임 결과 기록\n' +
      '• 성과 분석 데이터\n' +
      '• 개인화 설정 (현재 페이지 설정 제외)\n' +
      '• 목표 진행 상황'
    )) {
      try {
        dataManagement.reset();
        toast.success('모든 데이터가 삭제되었습니다.');
      } catch (error) {
        toast.error('데이터 삭제에 실패했습니다.');
      }
    }
  };

  /**
   * 데이터 보관 기간 텍스트
   */
  const getRetentionText = (days: number): string => {
    if (days === 1) return '1일';
    if (days === 7) return '1주일';
    if (days === 30) return '1개월';
    if (days === 90) return '3개월';
    if (days === 180) return '6개월';
    if (days === 365) return '1년';
    return `${days}일`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {/* 데이터 공유 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <Label className="text-base font-medium">데이터 공유 및 개인화</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous-data">익명 데이터 공유</Label>
                  <p className="text-sm text-muted-foreground">
                    개인 식별 정보 없이 게임 통계를 공유하여 서비스 개선에 도움을 줍니다
                  </p>
                </div>
                <Switch
                  id="anonymous-data"
                  checked={privacySettings.shareAnonymousData}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('privacySettings', { shareAnonymousData: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="personalization">개인화 기능</Label>
                  <p className="text-sm text-muted-foreground">
                    게임 패턴을 분석하여 맞춤형 조언과 목표를 제공합니다
                  </p>
                </div>
                <Switch
                  id="personalization"
                  checked={privacySettings.enablePersonalization}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('privacySettings', { enablePersonalization: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* 데이터 저장 및 캐싱 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <Label className="text-base font-medium">데이터 저장</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="caching">캐싱 활성화</Label>
                  <p className="text-sm text-muted-foreground">
                    분석 결과를 임시 저장하여 더 빠른 로딩 속도를 제공합니다
                  </p>
                </div>
                <Switch
                  id="caching"
                  checked={privacySettings.enableCaching}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('privacySettings', { enableCaching: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="export-request">데이터 내보내기 권한</Label>
                  <p className="text-sm text-muted-foreground">
                    언제든지 자신의 데이터를 JSON 형태로 내보낼 수 있습니다
                  </p>
                </div>
                <Switch
                  id="export-request"
                  checked={privacySettings.exportDataOnRequest}
                  onCheckedChange={(checked) => 
                    updateCategorySettings('privacySettings', { exportDataOnRequest: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* 데이터 보관 기간 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <Label className="text-base font-medium">데이터 보관 기간</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="retention-days">자동 삭제 기간</Label>
                <Badge variant="outline">
                  {getRetentionText(privacySettings.dataRetentionDays)}
                </Badge>
              </div>
              
              <Slider
                id="retention-days"
                min={1}
                max={365}
                step={1}
                value={[privacySettings.dataRetentionDays]}
                onValueChange={([value]) => 
                  updateCategorySettings('privacySettings', { dataRetentionDays: value })
                }
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1일</span>
                <span>1개월</span>
                <span>1년</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                지정한 기간이 지난 데이터는 자동으로 삭제됩니다. 
                현재 설정: <strong>{getRetentionText(privacySettings.dataRetentionDays)}</strong>
              </p>
            </div>
          </div>

          {/* 데이터 관리 도구 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <Label className="text-base font-medium">데이터 관리</Label>
            </div>
            
            <div className="space-y-3">
              {privacySettings.exportDataOnRequest && (
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  내 데이터 내보내기
                  <span className="ml-auto text-xs text-muted-foreground">JSON 파일</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleDeleteData}
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                모든 데이터 삭제
                <span className="ml-auto text-xs text-muted-foreground">되돌릴 수 없음</span>
              </Button>
            </div>
          </div>

          {/* 개인정보 처리 방침 */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-600">개인정보 보호</Label>
            </div>
            <div className="text-xs text-blue-600/80 space-y-1">
              <p>• 모든 데이터는 브라우저 로컬 저장소에만 저장됩니다</p>
              <p>• 개인 식별 정보는 수집하지 않습니다</p>
              <p>• 익명 데이터 공유 시에도 개인을 식별할 수 없는 통계만 사용됩니다</p>
              <p>• 언제든지 모든 데이터를 삭제하거나 내보낼 수 있습니다</p>
            </div>
          </div>

          {/* 현재 개인정보 설정 요약 */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-dashed">
            <Label className="text-sm font-medium">현재 개인정보 설정</Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 익명 데이터 공유: <span className="font-medium">{privacySettings.shareAnonymousData ? '허용' : '거부'}</span></p>
              <p>• 개인화 기능: <span className="font-medium">{privacySettings.enablePersonalization ? '활성화' : '비활성화'}</span></p>
              <p>• 캐싱: <span className="font-medium">{privacySettings.enableCaching ? '활성화' : '비활성화'}</span></p>
              <p>• 데이터 보관: <span className="font-medium">{getRetentionText(privacySettings.dataRetentionDays)}</span></p>
              <p>• 내보내기 권한: <span className="font-medium">{privacySettings.exportDataOnRequest ? '허용' : '제한'}</span></p>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-600/80">
              <p className="font-medium mb-1">주의사항</p>
              <p>브라우저 데이터를 삭제하거나 시크릿 모드를 사용하면 모든 게임 데이터가 손실될 수 있습니다. 중요한 기록은 정기적으로 내보내기를 권장합니다.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PrivacySettings.displayName = 'PrivacySettings';

export { PrivacySettings };