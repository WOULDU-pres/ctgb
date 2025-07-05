import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  return (
    <Badge 
      variant={isOnline ? "default" : "destructive"}
      className={`fixed top-4 left-4 z-50 transition-all duration-300 ${
        isOnline ? 'opacity-0 translate-y-[-100%]' : 'opacity-100 translate-y-0'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3 mr-1" />
          온라인
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          오프라인
        </>
      )}
    </Badge>
  );
};