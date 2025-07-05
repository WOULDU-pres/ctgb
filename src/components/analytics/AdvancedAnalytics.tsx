import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Activity,
  Trophy,
  Zap
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'
import { GameService } from '@/lib/services/game.service'
import { useAuth } from '@/contexts/AuthContext'
import { GameResult } from '@/lib/database.types'
import { GameMode } from '@/hooks/useGameLogic'

interface AnalyticsData {
  timeSeriesData: Array<{
    date: string
    average: number
    best: number
    games: number
  }>
  performanceByHour: Array<{
    hour: number
    average: number
    games: number
  }>
  performanceByGameMode: Array<{
    mode: string
    average: number
    best: number
    games: number
    improvement: number
  }>
  consistencyData: Array<{
    session: number
    average: number
    variance: number
  }>
  streakData: {
    currentStreak: number
    longestStreak: number
    bestStreakAverage: number
  }
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe']

export const AdvancedAnalytics: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | 'all'>('all')

  useEffect(() => {
    if (user) {
      loadAnalyticsData()
    }
  }, [user, timeRange, selectedGameMode])

  const loadAnalyticsData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load game history with filters
      const gameHistory = await GameService.getGameHistory(
        user.id,
        selectedGameMode === 'all' ? undefined : selectedGameMode,
        timeRange === 'all' ? 1000 : getTimeRangeLimit(timeRange)
      )

      const analytics = processAnalyticsData(gameHistory)
      setAnalyticsData(analytics)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRangeLimit = (range: '7d' | '30d' | '90d' | 'all'): number => {
    switch (range) {
      case '7d': return 50
      case '30d': return 200
      case '90d': return 500
      case 'all': return 1000
    }
  }

  const processAnalyticsData = (gameHistory: GameResult[]): AnalyticsData => {
    // Time series data (daily aggregation)
    const dailyData = new Map<string, { times: number[], games: number }>()
    
    gameHistory.forEach(game => {
      const date = new Date(game.created_at).toLocaleDateString()
      const validTimes = game.reaction_times.filter(t => t < 3000)
      
      if (!dailyData.has(date)) {
        dailyData.set(date, { times: [], games: 0 })
      }
      
      const dayData = dailyData.get(date)!
      dayData.times.push(...validTimes)
      dayData.games++
    })

    const timeSeriesData = Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        average: data.times.length > 0 ? data.times.reduce((a, b) => a + b, 0) / data.times.length : 0,
        best: data.times.length > 0 ? Math.min(...data.times) : 0,
        games: data.games
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Performance by hour
    const hourlyData = new Map<number, { times: number[], games: number }>()
    
    gameHistory.forEach(game => {
      const hour = new Date(game.created_at).getHours()
      const validTimes = game.reaction_times.filter(t => t < 3000)
      
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { times: [], games: 0 })
      }
      
      const hourData = hourlyData.get(hour)!
      hourData.times.push(...validTimes)
      hourData.games++
    })

    const performanceByHour = Array.from(hourlyData.entries())
      .map(([hour, data]) => ({
        hour,
        average: data.times.length > 0 ? data.times.reduce((a, b) => a + b, 0) / data.times.length : 0,
        games: data.games
      }))
      .sort((a, b) => a.hour - b.hour)

    // Performance by game mode
    const modeData = new Map<string, { times: number[], games: number[], dates: Date[] }>()
    
    gameHistory.forEach(game => {
      const mode = game.game_mode
      const validTimes = game.reaction_times.filter(t => t < 3000)
      
      if (!modeData.has(mode)) {
        modeData.set(mode, { times: [], games: [], dates: [] })
      }
      
      const modeDat = modeData.get(mode)!
      modeDat.times.push(...validTimes)
      modeDat.games.push(game.average_time)
      modeDat.dates.push(new Date(game.created_at))
    })

    const performanceByGameMode = Array.from(modeData.entries())
      .map(([mode, data]) => {
        const sortedGames = data.games.sort((a, b) => 
          data.dates[data.games.indexOf(a)].getTime() - data.dates[data.games.indexOf(b)].getTime()
        )
        const firstHalf = sortedGames.slice(0, Math.floor(sortedGames.length / 2))
        const secondHalf = sortedGames.slice(Math.floor(sortedGames.length / 2))
        
        const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0
        const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0
        
        return {
          mode: mode === 'normal' ? '일반' : mode === 'ranked' ? '랭크' : '타겟',
          average: data.times.length > 0 ? data.times.reduce((a, b) => a + b, 0) / data.times.length : 0,
          best: data.times.length > 0 ? Math.min(...data.times) : 0,
          games: data.games.length,
          improvement: firstAvg > 0 ? ((firstAvg - secondAvg) / firstAvg) * 100 : 0
        }
      })

    // Consistency data (session variance)
    const consistencyData = gameHistory.slice(0, 20).map((game, index) => {
      const validTimes = game.reaction_times.filter(t => t < 3000)
      const average = validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0
      const variance = validTimes.length > 1 ? 
        validTimes.reduce((acc, time) => acc + Math.pow(time - average, 2), 0) / validTimes.length : 0
      
      return {
        session: index + 1,
        average,
        variance: Math.sqrt(variance)
      }
    }).reverse()

    // Streak data
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let bestStreakTimes: number[] = []
    let tempStreakTimes: number[] = []
    
    gameHistory.reverse().forEach(game => {
      const avgTime = game.average_time
      if (avgTime < 250) { // Good performance threshold
        tempStreak++
        tempStreakTimes.push(avgTime)
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
          bestStreakTimes = [...tempStreakTimes]
        }
        tempStreak = 0
        tempStreakTimes = []
      }
    })
    
    currentStreak = tempStreak
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak
      bestStreakTimes = [...tempStreakTimes]
    }

    const streakData = {
      currentStreak,
      longestStreak,
      bestStreakAverage: bestStreakTimes.length > 0 ? 
        bestStreakTimes.reduce((a, b) => a + b, 0) / bestStreakTimes.length : 0
    }

    return {
      timeSeriesData,
      performanceByHour,
      performanceByGameMode,
      consistencyData,
      streakData
    }
  }

  const getInsights = (data: AnalyticsData) => {
    const insights = []
    
    // Peak performance time
    const bestHour = data.performanceByHour.reduce((best, current) => 
      current.average > 0 && (best.average === 0 || current.average < best.average) ? current : best
    )
    if (bestHour.average > 0) {
      insights.push({
        icon: <Clock className="h-4 w-4" />,
        title: '최적 플레이 시간',
        description: `${bestHour.hour}시경에 가장 좋은 성과 (평균 ${bestHour.average.toFixed(0)}ms)`,
        type: 'success'
      })
    }

    // Improvement trend
    const recentGames = data.timeSeriesData.slice(-7)
    const olderGames = data.timeSeriesData.slice(-14, -7)
    if (recentGames.length > 0 && olderGames.length > 0) {
      const recentAvg = recentGames.reduce((sum, day) => sum + day.average, 0) / recentGames.length
      const olderAvg = olderGames.reduce((sum, day) => sum + day.average, 0) / olderGames.length
      const improvement = ((olderAvg - recentAvg) / olderAvg) * 100
      
      if (improvement > 5) {
        insights.push({
          icon: <TrendingUp className="h-4 w-4" />,
          title: '실력 향상 중',
          description: `최근 일주일간 ${improvement.toFixed(1)}% 개선`,
          type: 'success'
        })
      } else if (improvement < -5) {
        insights.push({
          icon: <TrendingUp className="h-4 w-4" />,
          title: '컨디션 관리 필요',
          description: `최근 성과가 ${Math.abs(improvement).toFixed(1)}% 저하`,
          type: 'warning'
        })
      }
    }

    // Consistency
    const avgVariance = data.consistencyData.reduce((sum, session) => sum + session.variance, 0) / data.consistencyData.length
    if (avgVariance < 50) {
      insights.push({
        icon: <Target className="h-4 w-4" />,
        title: '뛰어난 일관성',
        description: '게임 간 편차가 매우 적음',
        type: 'success'
      })
    }

    return insights
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">로그인이 필요한 기능입니다.</p>
      </div>
    )
  }

  if (loading || !analyticsData) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  const insights = getInsights(analyticsData)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            고급 분석
          </h2>
          <p className="text-muted-foreground">상세한 게임 성과 분석 및 인사이트</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">최근 7일</SelectItem>
              <SelectItem value="30d">최근 30일</SelectItem>
              <SelectItem value="90d">최근 90일</SelectItem>
              <SelectItem value="all">전체</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedGameMode} onValueChange={(value) => setSelectedGameMode(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 모드</SelectItem>
              <SelectItem value="normal">일반 모드</SelectItem>
              <SelectItem value="ranked">랭크 모드</SelectItem>
              <SelectItem value="target">타겟 모드</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <Card key={index} className={insight.type === 'success' ? 'border-green-200' : 'border-yellow-200'}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${insight.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">성과 추이</TabsTrigger>
          <TabsTrigger value="patterns">패턴 분석</TabsTrigger>
          <TabsTrigger value="comparison">모드별 비교</TabsTrigger>
          <TabsTrigger value="consistency">일관성</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>시간별 성과 추이</CardTitle>
              <CardDescription>일별 평균 반응속도와 최고 기록 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="average" stroke="#8884d8" name="평균" />
                    <Line type="monotone" dataKey="best" stroke="#82ca9d" name="최고" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>연속 성과 기록</CardTitle>
              <CardDescription>좋은 성과의 연속성 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{analyticsData.streakData.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">현재 연속 기록</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{analyticsData.streakData.longestStreak}</div>
                  <div className="text-sm text-muted-foreground">최장 연속 기록</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.streakData.bestStreakAverage > 0 ? `${analyticsData.streakData.bestStreakAverage.toFixed(0)}ms` : '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">최고 연속시 평균</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>시간대별 성과</CardTitle>
              <CardDescription>하루 중 각 시간대별 평균 성과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.performanceByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average" fill="#8884d8" name="평균 반응속도(ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>게임 모드별 성과</CardTitle>
              <CardDescription>각 게임 모드에서의 평균 성과와 개선도</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.performanceByGameMode.map((mode, index) => (
                  <div key={mode.mode} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{mode.mode} 모드</h3>
                      <p className="text-sm text-muted-foreground">{mode.games}게임 플레이</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{mode.average.toFixed(0)}ms</span>
                        {mode.improvement > 0 && (
                          <Badge className="bg-green-500">
                            +{mode.improvement.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        최고: {mode.best.toFixed(0)}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>세션별 일관성</CardTitle>
              <CardDescription>게임 세션별 평균과 편차</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.consistencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="average" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="평균" />
                    <Area type="monotone" dataKey="variance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="편차" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}