import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Zap } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

export const InstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isStandalone, installPWA } = usePWA();
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem('pwa-banner-dismissed') === 'true'
  );
  const { toast } = useToast();

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || isStandalone || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      toast({
        title: "앱 설치 완료!",
        description: "QuickTap Arena가 홈 화면에 추가되었습니다.",
      });
      setIsDismissed(true);
    } else {
      toast({
        title: "설치 취소",
        description: "언제든지 다시 설치할 수 있습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md border-primary/20 bg-background/95 backdrop-blur-sm shadow-lg animate-slide-up">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              앱으로 설치하기
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              홈 화면에 추가하여 더 빠르고 편리하게 게임을 즐기세요
            </p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Zap className="h-3 w-3" />
              <span>오프라인 플레이</span>
              <span>•</span>
              <span>알림 지원</span>
              <span>•</span>
              <span>빠른 실행</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleInstall}
                size="sm" 
                className="flex-1 h-8 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                설치
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};