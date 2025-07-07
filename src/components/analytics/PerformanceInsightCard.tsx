import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Target, 
  Zap,
  Trophy,
  Star,
  ArrowRight
} from 'lucide-react';
import { AnalysisResult } from '@/types/analytics';

interface PerformanceInsightCardProps {
  analysis: AnalysisResult;
  onActionClick?: (action: string) => void;
  className?: string;
}

const PerformanceInsightCard = memo(({
  analysis,
  onActionClick,
  className = ''
}: PerformanceInsightCardProps) => {
  const { metrics, insights, messages } = analysis;

  // 성과 등급 결정
  const getPerformanceGrade = (rank: number): { grade: string; color: string; icon: React.ReactNode } => {
    if (rank <= 10) {
      return { grade: 'S', color: 'text-yellow-400', icon: <Trophy className="w-4 h-4" /> };
    } else if (rank <= 25) {
      return { grade: 'A', color: 'text-blue-400', icon: <Star className="w-4 h-4" /> };
    } else if (rank <= 50) {
      return { grade: 'B', color: 'text-green-400', icon: <Target className="w-4 h-4" /> };
    } else if (rank <= 75) {
      return { grade: 'C', color: 'text-orange-400', icon: <Clock className="w-4 h-4" /> };
    } else {
      return { grade: 'D', color: 'text-red-400', icon: <Zap className="w-4 h-4" /> };
    }
  };

  const performanceGrade = getPerformanceGrade(metrics.rank);

  // 트렌드 아이콘 및 색상
  const getTrendIcon = (improvement: number) => {
    if (improvement > 5) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else if (improvement < -5) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // 목표 타입별 표시 텍스트
  const getGoalText = () => {
    const { nextGoal } = insights;
    const types = {
      time: `${nextGoal.target.toFixed(2)}초`,
      consistency: `편차 ${nextGoal.target.toFixed(2)}초`,
      accuracy: `정확도 ${nextGoal.target}%`,
      streak: `연속 ${nextGoal.target}회`
    };
    return types[nextGoal.type];
  };

  // 우선순위 높은 메시지 선택
  const primaryMessage = messages.find(msg => msg.priority === 'high') || messages[0];

  return (
    <Card className={`${className} bg-card/95 backdrop-blur-sm border-primary/20`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {performanceGrade.icon}
            <span className="text-lg font-bold">성과 분석</span>
          </span>
          <Badge variant="outline" className={`${performanceGrade.color} border-current`}>
            {performanceGrade.grade} 등급
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 핵심 지표 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              평균 반응속도
            </div>
            <div className="text-2xl font-bold text-primary">
              {metrics.averageTime.toFixed(3)}초
            </div>
            <div className="flex items-center gap-1 text-sm">
              {getTrendIcon(metrics.improvement)}
              <span className={
                metrics.improvement > 5 ? 'text-green-400' :
                metrics.improvement < -5 ? 'text-red-400' : 'text-gray-400'
              }>
                {metrics.improvement > 0 ? '+' : ''}{metrics.improvement.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              상대적 순위
            </div>
            <div className="text-2xl font-bold text-secondary">
              상위 {metrics.rank}%
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.gamesPlayed}게임 플레이
            </div>
          </div>
        </div>

        {/* 목표 진행률 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">다음 목표</span>
            <span className="text-sm text-muted-foreground">
              {getGoalText()}
            </span>
          </div>
          <div className="space-y-2">
            <Progress 
              value={insights.nextGoal.progress} 
              className="h-2"
              aria-label={`목표 진행률 ${insights.nextGoal.progress.toFixed(0)}%`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>현재: {
                insights.nextGoal.type === 'time' ? `${insights.nextGoal.current.toFixed(2)}초` :
                insights.nextGoal.type === 'streak' ? `${insights.nextGoal.current}회` :
                insights.nextGoal.current.toFixed(1)
              }</span>
              <span>{insights.nextGoal.progress.toFixed(0)}% 달성</span>
            </div>
          </div>
        </div>

        {/* 강점과 약점 */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="text-sm font-medium text-green-400 mb-2">강점</h4>
            <div className="flex flex-wrap gap-1">
              {insights.strongPoints.map((point, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                  {point}
                </Badge>
              ))}
            </div>
          </div>
          
          {insights.weakPoints.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-orange-400 mb-2">개선점</h4>
              <div className="flex flex-wrap gap-1">
                {insights.weakPoints.map((point, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/20">
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 개인화된 메시지 */}
        {primaryMessage && (
          <div className="space-y-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {primaryMessage.type === 'achievement' && <Trophy className="w-5 h-5 text-yellow-400" />}
                {primaryMessage.type === 'encouragement' && <Star className="w-5 h-5 text-blue-400" />}
                {primaryMessage.type === 'advice' && <Target className="w-5 h-5 text-green-400" />}
                {primaryMessage.type === 'goal' && <Zap className="w-5 h-5 text-purple-400" />}
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-sm text-foreground">
                  {primaryMessage.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {primaryMessage.content}
                </p>
                {primaryMessage.actionable && onActionClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActionClick(primaryMessage.actionable!.action)}
                    className="mt-2 h-8 text-xs"
                  >
                    {primaryMessage.actionable.text}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 추가 통찰 */}
        <div className="pt-2 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">최적 시간대</span>
              <div className="font-medium">
                {insights.bestTimeOfDay.hour < 12 
                  ? `오전 ${insights.bestTimeOfDay.hour}시` 
                  : `오후 ${insights.bestTimeOfDay.hour - 12}시`}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">연속 성공</span>
              <div className="font-medium text-secondary">
                {metrics.streak}회
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceInsightCard.displayName = 'PerformanceInsightCard';

export default PerformanceInsightCard;