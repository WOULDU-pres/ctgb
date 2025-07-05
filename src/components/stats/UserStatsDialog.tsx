import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, Trophy, Target, Timer, TrendingUp, Brain, LineChart, Palette } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { GameService } from '@/lib/services/game.service'
import { GameMode } from '@/hooks/useGameLogic'
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics'
import { AIRecommendations } from '@/components/analytics/AIRecommendations'

interface UserStatsDialogProps {
  trigger: React.ReactNode
}

interface UserStats {
  totalGames: number
  bestTimes: Record<GameMode, number>
  averageTimes: Record<GameMode, number>
  ranks: Record<GameMode, number>
}

export const UserStatsDialog: React.FC<UserStatsDialogProps> = ({ trigger }) => {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && user) {
      loadUserStats()
    }
  }, [open, user])

  const loadUserStats = async () => {
    if (!user) return

    setLoading(true)
    try {
      const userStats = await GameService.getUserStats(user.id)
      setStats(userStats)
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeBadge = (time: number) => {
    if (time <= 0) return <Badge variant="outline">-</Badge>
    if (time < 180) return <Badge className="bg-yellow-500">S</Badge>
    if (time < 220) return <Badge className="bg-blue-500">A</Badge>
    if (time < 280) return <Badge className="bg-green-500">B</Badge>
    if (time < 350) return <Badge className="bg-orange-500">C</Badge>
    return <Badge variant="destructive">F</Badge>
  }

  const formatTime = (time: number) => {
    return time > 0 ? `${time.toFixed(0)}ms` : '-'
  }

  const formatRank = (rank: number) => {
    return rank > 0 ? `#${rank}` : '-'
  }

  if (!user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>통계</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">로그인이 필요한 기능입니다.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            나의 통계
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : stats ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="performance">성능</TabsTrigger>
              <TabsTrigger value="ranking">랭킹</TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <LineChart className="h-3 w-3" />
                분석
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    전체 통계
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{stats.totalGames}</p>
                      <p className="text-sm text-muted-foreground">총 게임 수</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary">
                        {formatTime(Math.min(...Object.values(stats.bestTimes).filter(t => t > 0)))}
                      </p>
                      <p className="text-sm text-muted-foreground">최고 기록</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">
                        {Object.values(stats.averageTimes).filter(t => t > 0).length}
                      </p>
                      <p className="text-sm text-muted-foreground">플레이한 모드</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-500">
                        {Math.min(...Object.values(stats.ranks).filter(r => r > 0)) || '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">최고 순위</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              {(['normal', 'ranked', 'target', 'color', 'sequence'] as GameMode[]).map((mode) => (
                <Card key={mode}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {mode === 'normal' && <Timer className="h-4 w-4" />}
                        {mode === 'ranked' && <Trophy className="h-4 w-4" />}
                        {mode === 'target' && <Target className="h-4 w-4" />}
                        {mode === 'color' && <span className="h-4 w-4 bg-green-500 rounded" />}
                        {mode === 'sequence' && <Brain className="h-4 w-4" />}
                        {mode === 'normal' ? '일반 모드' : 
                         mode === 'ranked' ? '랭겜 모드' : 
                         mode === 'target' ? '타겟 모드' :
                         mode === 'color' ? '색상 매칭' : '순서 기억'}
                      </span>
                      {getGradeBadge(stats.averageTimes[mode])}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-lg font-semibold text-primary">
                          {formatTime(stats.bestTimes[mode])}
                        </p>
                        <p className="text-sm text-muted-foreground">최고 기록</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-secondary">
                          {formatTime(stats.averageTimes[mode])}
                        </p>
                        <p className="text-sm text-muted-foreground">평균 기록</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-orange-500">
                          {formatRank(stats.ranks[mode])}
                        </p>
                        <p className="text-sm text-muted-foreground">현재 순위</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="ranking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    모드별 랭킹
                  </CardTitle>
                  <CardDescription>
                    각 게임 모드에서의 현재 순위를 확인하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(['normal', 'ranked', 'target', 'color', 'sequence'] as GameMode[]).map((mode) => (
                      <div key={mode} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {mode === 'normal' && <Timer className="h-5 w-5 text-primary" />}
                          {mode === 'ranked' && <Trophy className="h-5 w-5 text-yellow-500" />}
                          {mode === 'target' && <Target className="h-5 w-5 text-green-500" />}
                          {mode === 'color' && <span className="h-5 w-5 bg-green-500 rounded" />}
                          {mode === 'sequence' && <Brain className="h-5 w-5 text-purple-500" />}
                          <div>
                            <p className="font-medium">
                              {mode === 'normal' ? '일반 모드' : 
                               mode === 'ranked' ? '랭겜 모드' : 
                               mode === 'target' ? '타겟 모드' :
                               mode === 'color' ? '색상 매칭' : '순서 기억'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              최고: {formatTime(stats.bestTimes[mode])}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {formatRank(stats.ranks[mode])}
                          </p>
                          {getGradeBadge(stats.averageTimes[mode])}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <AdvancedAnalytics />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <AIRecommendations />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">통계 데이터를 불러올 수 없습니다.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}