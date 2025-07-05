import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap, 
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Calendar
} from 'lucide-react'
import { GameService } from '@/lib/services/game.service'
import { useAuth } from '@/contexts/AuthContext'
import { GameResult } from '@/lib/database.types'

interface Recommendation {
  id: string
  type: 'training' | 'timing' | 'technique' | 'goal'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  reason: string
  actionable: string
  icon: React.ReactNode
  progress?: number
  target?: number
}

interface AIInsights {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: Recommendation[]
  nextMilestone: {
    target: number
    current: number
    description: string
  }
}

export const AIRecommendations: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<AIInsights | null>(null)

  useEffect(() => {
    if (user) {
      generateInsights()
    }
  }, [user])

  const generateInsights = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load recent game data for analysis
      const gameHistory = await GameService.getGameHistory(user.id, undefined, 50)
      const userStats = await GameService.getUserStats(user.id)
      
      const aiInsights = analyzePerformance(gameHistory, userStats)
      setInsights(aiInsights)
    } catch (error) {
      console.error('Failed to generate AI insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzePerformance = (gameHistory: GameResult[], userStats: any): AIInsights => {
    const allTimes = gameHistory.flatMap(game => game.reaction_times.filter(t => t < 3000))
    const recentTimes = gameHistory.slice(0, 10).flatMap(game => game.reaction_times.filter(t => t < 3000))
    const olderTimes = gameHistory.slice(10, 20).flatMap(game => game.reaction_times.filter(t => t < 3000))

    // Calculate metrics
    const avgTime = allTimes.length > 0 ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length : 0
    const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0
    const recentAvg = recentTimes.length > 0 ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length : 0
    const olderAvg = olderTimes.length > 0 ? olderTimes.reduce((a, b) => a + b, 0) / olderTimes.length : 0
    
    // Consistency analysis
    const variance = allTimes.length > 1 ? 
      allTimes.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / allTimes.length : 0
    const standardDeviation = Math.sqrt(variance)
    
    // Time pattern analysis
    const hourlyPerformance = new Map<number, number[]>()
    gameHistory.forEach(game => {
      const hour = new Date(game.created_at).getHours()
      const validTimes = game.reaction_times.filter(t => t < 3000)
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, [])
      }
      hourlyPerformance.get(hour)!.push(...validTimes)
    })

    const bestHour = Array.from(hourlyPerformance.entries())
      .map(([hour, times]) => ({
        hour,
        avg: times.reduce((a, b) => a + b, 0) / times.length
      }))
      .filter(h => h.avg > 0)
      .sort((a, b) => a.avg - b.avg)[0]

    // Generate overall score (0-100)
    let overallScore = 100
    if (avgTime > 300) overallScore -= 30
    else if (avgTime > 250) overallScore -= 20
    else if (avgTime > 200) overallScore -= 10
    
    if (standardDeviation > 50) overallScore -= 20
    else if (standardDeviation > 30) overallScore -= 10
    
    if (recentAvg > olderAvg) overallScore -= 15
    
    overallScore = Math.max(0, Math.min(100, overallScore))

    // Identify strengths and weaknesses
    const strengths: string[] = []
    const weaknesses: string[] = []

    if (bestTime < 150) strengths.push('뛰어난 순간 반응속도')
    if (standardDeviation < 30) strengths.push('매우 일관된 성과')
    if (recentAvg < olderAvg) strengths.push('꾸준한 실력 향상')
    if (userStats.ranks.ranked > 0 && userStats.ranks.ranked <= 100) strengths.push('상위 랭커 실력')

    if (avgTime > 250) weaknesses.push('평균 반응속도 개선 필요')
    if (standardDeviation > 50) weaknesses.push('일관성 부족')
    if (recentAvg > olderAvg) weaknesses.push('최근 성과 하락')
    if (gameHistory.length < 20) weaknesses.push('경험 부족')

    // Generate recommendations
    const recommendations: Recommendation[] = []

    // Performance-based recommendations
    if (avgTime > 250) {
      recommendations.push({
        id: 'improve-reaction',
        type: 'training',
        priority: 'high',
        title: '반응속도 집중 훈련',
        description: '평균 반응속도가 250ms를 넘고 있습니다.',
        reason: `현재 평균 ${avgTime.toFixed(0)}ms로 개선의 여지가 큽니다.`,
        actionable: '매일 10분씩 일반 모드로 집중 연습하세요.',
        icon: <Zap className="h-4 w-4" />,
        progress: Math.max(0, 100 - ((avgTime - 150) / 150) * 100),
        target: 200
      })
    }

    if (standardDeviation > 40) {
      recommendations.push({
        id: 'improve-consistency',
        type: 'technique',
        priority: 'high',
        title: '일관성 향상 훈련',
        description: '게임 간 편차가 큽니다.',
        reason: `표준편차 ${standardDeviation.toFixed(0)}ms로 일관성 개선이 필요합니다.`,
        actionable: '랭크 모드로 10라운드씩 꾸준히 연습하세요.',
        icon: <Target className="h-4 w-4" />,
        progress: Math.max(0, 100 - (standardDeviation / 100) * 100),
        target: 30
      })
    }

    if (bestHour && hourlyPerformance.size > 3) {
      recommendations.push({
        id: 'optimal-timing',
        type: 'timing',
        priority: 'medium',
        title: '최적 플레이 시간 활용',
        description: `${bestHour.hour}시경에 가장 좋은 성과를 보입니다.`,
        reason: `이 시간대 평균 ${bestHour.avg.toFixed(0)}ms로 최고 성과를 기록합니다.`,
        actionable: '중요한 게임이나 도전은 이 시간대에 하세요.',
        icon: <Clock className="h-4 w-4" />
      })
    }

    if (recentAvg > olderAvg && olderAvg > 0) {
      recommendations.push({
        id: 'break-needed',
        type: 'training',
        priority: 'medium',
        title: '휴식 및 컨디션 관리',
        description: '최근 성과가 이전보다 저하되었습니다.',
        reason: `최근 평균이 ${((recentAvg - olderAvg) / olderAvg * 100).toFixed(1)}% 악화되었습니다.`,
        actionable: '충분한 휴식 후 짧은 세션으로 다시 시작하세요.',
        icon: <AlertTriangle className="h-4 w-4" />
      })
    }

    if (gameHistory.length >= 20 && avgTime < 200) {
      recommendations.push({
        id: 'challenge-friends',
        type: 'goal',
        priority: 'low',
        title: '친구 도전으로 동기부여',
        description: '실력이 충분히 늘었습니다.',
        reason: '평균 200ms 미만으로 상급자 수준입니다.',
        actionable: '친구들과 도전 모드로 경쟁해보세요.',
        icon: <Trophy className="h-4 w-4" />
      })
    }

    // Next milestone
    let nextTarget = 250
    if (avgTime < 250) nextTarget = 200
    if (avgTime < 200) nextTarget = 180
    if (avgTime < 180) nextTarget = 160

    const nextMilestone = {
      target: nextTarget,
      current: avgTime,
      description: nextTarget === 250 ? '일반적인 수준' :
                   nextTarget === 200 ? '숙련자 수준' :
                   nextTarget === 180 ? '고수 수준' :
                   '전문가 수준'
    }

    return {
      overallScore,
      strengths,
      weaknesses,
      recommendations,
      nextMilestone
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">로그인이 필요한 기능입니다.</p>
      </div>
    )
  }

  if (loading || !insights) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          AI 성과 분석 및 추천
        </h2>
        <p className="text-muted-foreground">개인화된 훈련 계획과 개선 방향 제시</p>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>종합 실력 점수</span>
            <span className={`text-3xl font-bold ${getScoreColor(insights.overallScore)}`}>
              {insights.overallScore}/100
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={insights.overallScore} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                강점
              </h4>
              <ul className="space-y-1">
                {insights.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-muted-foreground">• {strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                개선 포인트
              </h4>
              <ul className="space-y-1">
                {insights.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-muted-foreground">• {weakness}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            다음 목표
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">{insights.nextMilestone.description} 달성</p>
              <p className="text-sm text-muted-foreground">
                목표: {insights.nextMilestone.target}ms 이하
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {(insights.nextMilestone.current - insights.nextMilestone.target).toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">남은 차이</div>
            </div>
          </div>
          <Progress 
            value={Math.max(0, Math.min(100, 
              ((300 - insights.nextMilestone.current) / (300 - insights.nextMilestone.target)) * 100
            ))} 
          />
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          맞춤형 추천
        </h3>
        
        {insights.recommendations.map((rec) => (
          <Card key={rec.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {rec.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <CardDescription>{rec.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getPriorityColor(rec.priority)}>
                  {rec.priority === 'high' ? '긴급' : rec.priority === 'medium' ? '중요' : '권장'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">이유:</p>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">실행 방법:</p>
                  <p className="text-sm text-muted-foreground">{rec.actionable}</p>
                </div>
                {rec.progress !== undefined && rec.target && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>진행도</span>
                      <span>{rec.progress.toFixed(0)}% (목표: {rec.target}ms)</span>
                    </div>
                    <Progress value={rec.progress} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button onClick={generateInsights} variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          분석 새로고침
        </Button>
      </div>
    </div>
  )
}