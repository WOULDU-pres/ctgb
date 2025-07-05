import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Trophy, Timer, Target } from 'lucide-react'
import { FriendService, FriendWithUser } from '@/lib/services/friend.service'
import { GameService } from '@/lib/services/game.service'
import { useAuth } from '@/contexts/AuthContext'

interface FriendStats {
  user: {
    id: string
    nickname: string
    characteristic: string
    avatar_url?: string
  }
  totalGames: number
  bestTime: number
  averageTime: number
  rank: number
}

export const FriendsLeaderboard: React.FC = () => {
  const { user } = useAuth()
  const [friendsStats, setFriendsStats] = useState<FriendStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFriendsStats()
    }
  }, [user])

  const loadFriendsStats = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get friends list
      const friends = await FriendService.getFriends()
      
      // Get current user stats
      const currentUserStats = await GameService.getUserStats(user.id)
      
      // Create array to store all stats including current user
      const allStats: FriendStats[] = []

      // Add current user stats
      allStats.push({
        user: {
          id: user.id,
          nickname: user.nickname,
          characteristic: user.characteristic,
          avatar_url: user.avatar_url
        },
        totalGames: currentUserStats.totalGames,
        bestTime: currentUserStats.bestTimes.ranked || 0,
        averageTime: currentUserStats.averageTimes.ranked || 0,
        rank: currentUserStats.ranks.ranked || 0
      })

      // Get stats for each friend
      for (const friend of friends) {
        const friendUser = friend.friend_user || friend.user
        if (friendUser && friendUser.id !== user.id) {
          try {
            const friendStats = await FriendService.getFriendStats(friendUser.id)
            allStats.push({
              user: friendUser,
              totalGames: friendStats.totalGames,
              bestTime: friendStats.bestTime,
              averageTime: friendStats.averageTime,
              rank: friendStats.rank
            })
          } catch (error) {
            console.error(`Failed to load stats for friend ${friendUser.id}:`, error)
          }
        }
      }

      // Sort by best time (ascending, excluding 0)
      const sortedStats = allStats
        .filter(stat => stat.bestTime > 0)
        .sort((a, b) => a.bestTime - b.bestTime)

      setFriendsStats(sortedStats)
    } catch (error) {
      console.error('Failed to load friends stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankBadge = (index: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return <Badge className="bg-primary">나</Badge>
    }
    
    if (index === 0) return <Badge className="bg-yellow-500">1위</Badge>
    if (index === 1) return <Badge className="bg-gray-400">2위</Badge>
    if (index === 2) return <Badge className="bg-amber-600">3위</Badge>
    return <Badge variant="outline">{index + 1}위</Badge>
  }

  if (!user) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          친구 순위
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : friendsStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>친구를 추가하여 순위를 비교해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {friendsStats.map((stat, index) => {
              const isCurrentUser = stat.user.id === user.id
              return (
                <div
                  key={stat.user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getRankBadge(index, isCurrentUser)}
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={stat.user.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${stat.user.nickname}`}
                        alt={stat.user.nickname}
                      />
                      <AvatarFallback>
                        {stat.user.nickname.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                        {stat.user.nickname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.totalGames}게임 • 평균 {stat.averageTime > 0 ? `${stat.averageTime.toFixed(0)}ms` : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-secondary">
                      {stat.bestTime > 0 ? `${stat.bestTime.toFixed(0)}ms` : '-'}
                    </p>
                    {stat.rank > 0 && (
                      <p className="text-xs text-muted-foreground">
                        글로벌 #{stat.rank}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}