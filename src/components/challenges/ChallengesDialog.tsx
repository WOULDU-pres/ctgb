import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Swords, 
  Trophy, 
  Clock, 
  Check, 
  X, 
  Target,
  Timer,
  Send,
  History,
  Crown
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ChallengeService, ChallengeWithUsers } from '@/lib/services/challenge.service'
import { FriendService, FriendWithUser } from '@/lib/services/friend.service'
import { useAuth } from '@/contexts/AuthContext'
import { GameMode } from '@/hooks/useGameLogic'

interface ChallengesDialogProps {
  trigger: React.ReactNode
}

export const ChallengesDialog: React.FC<ChallengesDialogProps> = ({ trigger }) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('received')
  const [loading, setLoading] = useState(false)

  const [receivedChallenges, setReceivedChallenges] = useState<ChallengeWithUsers[]>([])
  const [sentChallenges, setSentChallenges] = useState<ChallengeWithUsers[]>([])
  const [activeChallenges, setActiveChallenges] = useState<ChallengeWithUsers[]>([])
  const [challengeHistory, setChallengeHistory] = useState<ChallengeWithUsers[]>([])
  const [friends, setFriends] = useState<FriendWithUser[]>([])

  const [selectedFriend, setSelectedFriend] = useState<string>('')
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('ranked')

  useEffect(() => {
    if (open && user) {
      loadAllData()
    }
  }, [open, user])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadReceivedChallenges(),
        loadSentChallenges(),
        loadActiveChallenges(),
        loadChallengeHistory(),
        loadFriends()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadReceivedChallenges = async () => {
    try {
      const data = await ChallengeService.getReceivedChallenges()
      setReceivedChallenges(data)
    } catch (error) {
      console.error('Failed to load received challenges:', error)
    }
  }

  const loadSentChallenges = async () => {
    try {
      const data = await ChallengeService.getSentChallenges()
      setSentChallenges(data)
    } catch (error) {
      console.error('Failed to load sent challenges:', error)
    }
  }

  const loadActiveChallenges = async () => {
    try {
      const data = await ChallengeService.getActiveChallenges()
      setActiveChallenges(data)
    } catch (error) {
      console.error('Failed to load active challenges:', error)
    }
  }

  const loadChallengeHistory = async () => {
    try {
      const data = await ChallengeService.getChallengeHistory()
      setChallengeHistory(data)
    } catch (error) {
      console.error('Failed to load challenge history:', error)
    }
  }

  const loadFriends = async () => {
    try {
      const data = await FriendService.getFriends()
      setFriends(data)
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }

  const handleCreateChallenge = async () => {
    if (!selectedFriend) {
      toast.error('도전할 친구를 선택해주세요.')
      return
    }

    try {
      await ChallengeService.createChallenge(selectedFriend, selectedGameMode)
      toast.success('도전을 보냈습니다!')
      setSelectedFriend('')
      await loadSentChallenges()
    } catch (error: any) {
      toast.error(error.message || '도전 생성에 실패했습니다.')
    }
  }

  const handleRespondToChallenge = async (challengeId: string, accept: boolean) => {
    try {
      await ChallengeService.respondToChallenge(challengeId, accept)
      toast.success(accept ? '도전을 수락했습니다!' : '도전을 거절했습니다.')
      await loadReceivedChallenges()
      if (accept) await loadActiveChallenges()
    } catch (error) {
      toast.error('응답 처리에 실패했습니다.')
    }
  }

  const handleCancelChallenge = async (challengeId: string) => {
    try {
      await ChallengeService.cancelChallenge(challengeId)
      toast.success('도전을 취소했습니다.')
      await loadSentChallenges()
      await loadActiveChallenges()
    } catch (error) {
      toast.error('도전 취소에 실패했습니다.')
    }
  }

  const getGameModeIcon = (mode: GameMode) => {
    switch (mode) {
      case 'normal':
        return <Timer className="h-4 w-4" />
      case 'ranked':
        return <Trophy className="h-4 w-4" />
      case 'target':
        return <Target className="h-4 w-4" />
    }
  }

  const getGameModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'normal':
        return '일반'
      case 'ranked':
        return '랭크'
      case 'target':
        return '타겟'
    }
  }

  const getChallengeStatusBadge = (challenge: ChallengeWithUsers) => {
    const now = new Date()
    const expiresAt = new Date(challenge.expires_at)
    
    if (expiresAt < now) {
      return <Badge variant="destructive">만료됨</Badge>
    }

    switch (challenge.status) {
      case 'pending':
        return <Badge variant="outline">대기 중</Badge>
      case 'accepted':
        return <Badge variant="secondary">진행 중</Badge>
      case 'completed':
        return <Badge className="bg-green-500">완료</Badge>
      case 'cancelled':
        return <Badge variant="destructive">취소됨</Badge>
    }
  }

  const getChallengeResult = (challenge: ChallengeWithUsers) => {
    if (challenge.status !== 'completed' || !user) return null

    const userScore = challenge.challenger_id === user.id ? challenge.challenger_score : challenge.challenged_score
    const opponentScore = challenge.challenger_id === user.id ? challenge.challenged_score : challenge.challenger_score

    if (userScore === null || opponentScore === null) return null

    if (userScore < opponentScore) {
      return <Badge className="bg-green-500">승리</Badge>
    } else if (userScore > opponentScore) {
      return <Badge variant="destructive">패배</Badge>
    } else {
      return <Badge variant="outline">무승부</Badge>
    }
  }

  if (!user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>도전</DialogTitle>
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
            <Swords className="h-5 w-5" />
            도전 관리
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="received" className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span className="hidden sm:inline">받은 도전</span>
              <span className="sm:hidden">받음</span>
              {receivedChallenges.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {receivedChallenges.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-1">
              <Send className="h-3 w-3" />
              <span className="hidden sm:inline">보낸 도전</span>
              <span className="sm:hidden">보냄</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-1">
              <Swords className="h-3 w-3" />
              <span className="hidden sm:inline">진행 중</span>
              <span className="sm:hidden">진행</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-3 w-3" />
              <span className="hidden sm:inline">기록</span>
              <span className="sm:hidden">기록</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-1">
              <Swords className="h-3 w-3" />
              <span className="hidden sm:inline">도전하기</span>
              <span className="sm:hidden">도전</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>받은 도전이 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {receivedChallenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={challenge.challenger?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${challenge.challenger?.nickname}`} 
                              alt={challenge.challenger?.nickname} 
                            />
                            <AvatarFallback>
                              {challenge.challenger?.nickname?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{challenge.challenger?.nickname}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {getGameModeIcon(challenge.game_mode)}
                              {getGameModeLabel(challenge.game_mode)} 모드
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(challenge.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getChallengeStatusBadge(challenge)}
                          <Button
                            size="sm"
                            onClick={() => handleRespondToChallenge(challenge.id, true)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            수락
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespondToChallenge(challenge.id, false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            거절
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>보낸 도전이 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sentChallenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={challenge.challenged?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${challenge.challenged?.nickname}`} 
                              alt={challenge.challenged?.nickname} 
                            />
                            <AvatarFallback>
                              {challenge.challenged?.nickname?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{challenge.challenged?.nickname}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {getGameModeIcon(challenge.game_mode)}
                              {getGameModeLabel(challenge.game_mode)} 모드
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(challenge.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getChallengeStatusBadge(challenge)}
                          {challenge.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelChallenge(challenge.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              취소
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>진행 중인 도전이 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeChallenges.map((challenge) => {
                  const opponent = challenge.challenger_id === user.id ? challenge.challenged : challenge.challenger
                  const userScore = challenge.challenger_id === user.id ? challenge.challenger_score : challenge.challenged_score
                  const opponentScore = challenge.challenger_id === user.id ? challenge.challenged_score : challenge.challenger_score
                  
                  return (
                    <Card key={challenge.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={opponent?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${opponent?.nickname}`} 
                                alt={opponent?.nickname} 
                              />
                              <AvatarFallback>
                                {opponent?.nickname?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{opponent?.nickname}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getGameModeIcon(challenge.game_mode)}
                                {getGameModeLabel(challenge.game_mode)} 모드
                              </div>
                              <div className="text-xs text-muted-foreground">
                                나: {userScore !== null ? `${userScore.toFixed(0)}ms` : '미완료'} | 
                                상대: {opponentScore !== null ? `${opponentScore.toFixed(0)}ms` : '미완료'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getChallengeStatusBadge(challenge)}
                            {userScore === null && (
                              <Alert>
                                <AlertDescription>
                                  {getGameModeLabel(challenge.game_mode)} 모드를 플레이하여 점수를 제출하세요!
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {challengeHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>도전 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {challengeHistory.map((challenge) => {
                  const opponent = challenge.challenger_id === user.id ? challenge.challenged : challenge.challenger
                  const userScore = challenge.challenger_id === user.id ? challenge.challenger_score : challenge.challenged_score
                  const opponentScore = challenge.challenger_id === user.id ? challenge.challenged_score : challenge.challenger_score
                  
                  return (
                    <Card key={challenge.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={opponent?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${opponent?.nickname}`} 
                                alt={opponent?.nickname} 
                              />
                              <AvatarFallback>
                                {opponent?.nickname?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{opponent?.nickname}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getGameModeIcon(challenge.game_mode)}
                                {getGameModeLabel(challenge.game_mode)} 모드
                              </div>
                              <div className="text-xs text-muted-foreground">
                                나: {userScore?.toFixed(0)}ms | 상대: {opponentScore?.toFixed(0)}ms
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(challenge.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getChallengeResult(challenge)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>새로운 도전</CardTitle>
                <CardDescription>
                  친구에게 도전을 보내세요! 같은 게임 모드로 겨뤄보세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="friend-select" className="text-sm font-medium">
                    도전할 친구
                  </label>
                  <Select value={selectedFriend} onValueChange={setSelectedFriend}>
                    <SelectTrigger>
                      <SelectValue placeholder="친구를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {friends.map((friend) => {
                        const friendUser = friend.friend_user || friend.user
                        return (
                          <SelectItem key={friendUser?.id} value={friendUser?.id || ''}>
                            {friendUser?.nickname}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="game-mode-select" className="text-sm font-medium">
                    게임 모드
                  </label>
                  <Select value={selectedGameMode} onValueChange={(value) => setSelectedGameMode(value as GameMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">일반 모드</SelectItem>
                      <SelectItem value="ranked">랭크 모드</SelectItem>
                      <SelectItem value="target">타겟 모드</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateChallenge} className="w-full">
                  <Swords className="h-4 w-4 mr-2" />
                  도전 보내기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}