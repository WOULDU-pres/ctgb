import { supabase } from '@/lib/supabase'
import { Friend, User } from '@/lib/database.types'

export type FriendWithUser = Friend & {
  friend_user?: User
  user?: User
}

export class FriendService {
  static async sendFriendRequest(friendEmail: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    // Find friend by email
    const { data: friendUser, error: friendError } = await supabase
      .from('users')
      .select('id')
      .eq('email', friendEmail.toLowerCase())
      .single()

    if (friendError || !friendUser) {
      throw new Error('사용자를 찾을 수 없습니다.')
    }

    if (friendUser.id === user.id) {
      throw new Error('자신에게는 친구 요청을 보낼 수 없습니다.')
    }

    // Check if friendship already exists
    const { data: existingFriend } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${user.id})`)
      .single()

    if (existingFriend) {
      if (existingFriend.status === 'pending') {
        throw new Error('이미 친구 요청을 보냈거나 받았습니다.')
      } else if (existingFriend.status === 'accepted') {
        throw new Error('이미 친구입니다.')
      } else if (existingFriend.status === 'blocked') {
        throw new Error('차단된 사용자입니다.')
      }
    }

    // Send friend request
    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friendUser.id,
        status: 'pending'
      })

    if (error) throw error
  }

  static async getFriendRequests(): Promise<FriendWithUser[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        user:user_id(*)
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((friend: any) => ({
      ...friend,
      user: friend.user
    }))
  }

  static async getFriends(): Promise<FriendWithUser[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend_user:friend_id(*),
        user:user_id(*)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .order('updated_at', { ascending: false })

    if (error) throw error

    return data.map((friend: any) => ({
      ...friend,
      friend_user: friend.user_id === user.id ? friend.friend_user : friend.user,
      user: friend.user_id === user.id ? friend.user : friend.friend_user
    }))
  }

  static async respondToFriendRequest(friendshipId: string, accept: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    if (accept) {
      const { error } = await supabase
        .from('friends')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', friendshipId)
        .eq('friend_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId)
        .eq('friend_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
    }
  }

  static async removeFriend(friendshipId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

    if (error) throw error
  }

  static async blockUser(friendshipId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('friends')
      .update({
        status: 'blocked',
        updated_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

    if (error) throw error
  }

  static async getFriendStats(friendId: string): Promise<{
    totalGames: number
    bestTime: number
    averageTime: number
    rank: number
  }> {
    const { data: gameResults, error: gameError } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', friendId)

    if (gameError) throw gameError

    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('user_id', friendId)
      .eq('game_mode', 'ranked')
      .single()

    if (leaderboardError && leaderboardError.code !== 'PGRST116') {
      throw leaderboardError
    }

    const totalGames = gameResults.length
    const validTimes = gameResults
      .flatMap(result => result.reaction_times)
      .filter((time: number) => time < 3000)
    
    const bestTime = validTimes.length > 0 ? Math.min(...validTimes) : 0
    const averageTime = validTimes.length > 0 
      ? validTimes.reduce((a: number, b: number) => a + b, 0) / validTimes.length 
      : 0
    const rank = leaderboard?.rank || 0

    return {
      totalGames,
      bestTime,
      averageTime,
      rank
    }
  }
}