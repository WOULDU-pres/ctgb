import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Check, 
  X, 
  MoreVertical, 
  UserMinus, 
  Shield,
  Trophy,
  Timer,
  Target
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { FriendService, FriendWithUser } from '@/lib/services/friend.service'
import { useAuth } from '@/contexts/AuthContext'

interface FriendsDialogProps {
  trigger: React.ReactNode
}

export const FriendsDialog: React.FC<FriendsDialogProps> = ({ trigger }) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('friends')
  const [loading, setLoading] = useState(false)
  const [friends, setFriends] = useState<FriendWithUser[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendWithUser[]>([])
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && user) {
      loadFriends()
      loadFriendRequests()
    }
  }, [open, user])

  const loadFriends = async () => {
    try {
      const data = await FriendService.getFriends()
      setFriends(data)
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const data = await FriendService.getFriendRequests()
      setFriendRequests(data)
    } catch (error) {
      console.error('Failed to load friend requests:', error)
    }
  }

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!newFriendEmail.trim()) {
      setError('이메일을 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      await FriendService.sendFriendRequest(newFriendEmail.trim())
      toast.success('친구 요청을 보냈습니다!')
      setNewFriendEmail('')
    } catch (error: any) {
      setError(error.message || '친구 요청에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      await FriendService.respondToFriendRequest(requestId, accept)
      toast.success(accept ? '친구 요청을 수락했습니다!' : '친구 요청을 거절했습니다.')
      await loadFriendRequests()
      if (accept) await loadFriends()
    } catch (error) {
      toast.error('요청 처리에 실패했습니다.')
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await FriendService.removeFriend(friendshipId)
      toast.success('친구가 삭제되었습니다.')
      await loadFriends()
    } catch (error) {
      toast.error('친구 삭제에 실패했습니다.')
    }
  }

  const handleBlockUser = async (friendshipId: string) => {
    try {
      await FriendService.blockUser(friendshipId)
      toast.success('사용자를 차단했습니다.')
      await loadFriends()
    } catch (error) {
      toast.error('사용자 차단에 실패했습니다.')
    }
  }

  const getFriendUser = (friend: FriendWithUser) => {
    return friend.friend_user || friend.user
  }

  if (!user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>친구</DialogTitle>
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
            <Users className="h-5 w-5" />
            친구 관리
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              친구 ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              요청 ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              친구 추가
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>아직 친구가 없습니다.</p>
                <p className="text-sm mt-2">친구를 추가해보세요!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {friends.map((friend) => {
                  const friendUser = getFriendUser(friend)
                  return (
                    <Card key={friend.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={friendUser?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${friendUser?.nickname}`} 
                                alt={friendUser?.nickname} 
                              />
                              <AvatarFallback>
                                {friendUser?.nickname?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{friendUser?.nickname}</p>
                              <p className="text-sm text-muted-foreground">
                                {friendUser?.characteristic}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">친구</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRemoveFriend(friend.id)}
                                  className="text-destructive"
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  친구 삭제
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleBlockUser(friend.id)}
                                  className="text-destructive"
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  차단하기
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {friendRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>새로운 친구 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {friendRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={request.user?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${request.user?.nickname}`} 
                              alt={request.user?.nickname} 
                            />
                            <AvatarFallback>
                              {request.user?.nickname?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.user?.nickname}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.user?.characteristic}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRespondToRequest(request.id, true)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            수락
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespondToRequest(request.id, false)}
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

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>친구 추가</CardTitle>
                <CardDescription>
                  친구의 이메일 주소를 입력하여 친구 요청을 보내세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendFriendRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="friend-email">이메일</Label>
                    <Input
                      id="friend-email"
                      type="email"
                      placeholder="friend@example.com"
                      value={newFriendEmail}
                      onChange={(e) => setNewFriendEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? '요청 중...' : '친구 요청 보내기'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}