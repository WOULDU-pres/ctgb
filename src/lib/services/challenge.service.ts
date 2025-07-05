import { supabase } from '@/lib/supabase'
import { Challenge, User } from '@/lib/database.types'
import { GameMode } from '@/hooks/useGameLogic'

export type ChallengeWithUsers = Challenge & {
  challenger?: User
  challenged?: User
}

export class ChallengeService {
  static async createChallenge(
    challengedUserId: string,
    gameMode: GameMode
  ): Promise<Challenge> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    if (challengedUserId === user.id) {
      throw new Error('자신에게는 도전을 보낼 수 없습니다.')
    }

    // Check if users are friends
    const { data: friendship } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${challengedUserId}),and(user_id.eq.${challengedUserId},friend_id.eq.${user.id})`)
      .eq('status', 'accepted')
      .single()

    if (!friendship) {
      throw new Error('친구만 도전할 수 있습니다.')
    }

    // Check for existing active challenges
    const { data: existingChallenge } = await supabase
      .from('challenges')
      .select('*')
      .or(`and(challenger_id.eq.${user.id},challenged_id.eq.${challengedUserId}),and(challenger_id.eq.${challengedUserId},challenged_id.eq.${user.id})`)
      .in('status', ['pending', 'accepted'])
      .single()

    if (existingChallenge) {
      throw new Error('이미 진행 중인 도전이 있습니다.')
    }

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        challenger_id: user.id,
        challenged_id: challengedUserId,
        game_mode: gameMode,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getReceivedChallenges(): Promise<ChallengeWithUsers[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger:challenger_id(*)
      `)
      .eq('challenged_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((challenge: any) => ({
      ...challenge,
      challenger: challenge.challenger
    }))
  }

  static async getSentChallenges(): Promise<ChallengeWithUsers[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenged:challenged_id(*)
      `)
      .eq('challenger_id', user.id)
      .in('status', ['pending', 'accepted'])
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((challenge: any) => ({
      ...challenge,
      challenged: challenge.challenged
    }))
  }

  static async getActiveChallenges(): Promise<ChallengeWithUsers[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger:challenger_id(*),
        challenged:challenged_id(*)
      `)
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((challenge: any) => ({
      ...challenge,
      challenger: challenge.challenger,
      challenged: challenge.challenged
    }))
  }

  static async respondToChallenge(challengeId: string, accept: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    if (accept) {
      const { error } = await supabase
        .from('challenges')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId)
        .eq('challenged_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('challenges')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId)
        .eq('challenged_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
    }
  }

  static async submitChallengeScore(challengeId: string, score: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single()

    if (challengeError || !challenge) {
      throw new Error('도전을 찾을 수 없습니다.')
    }

    if (challenge.status !== 'accepted') {
      throw new Error('수락된 도전만 점수를 제출할 수 있습니다.')
    }

    // Determine which field to update
    const updateField = challenge.challenger_id === user.id ? 'challenger_score' : 'challenged_score'
    
    const updates: any = {
      [updateField]: score,
      updated_at: new Date().toISOString()
    }

    // Check if this completes the challenge
    const otherScore = challenge.challenger_id === user.id ? challenge.challenged_score : challenge.challenger_score
    
    if (otherScore !== null) {
      // Both players have submitted scores, determine winner and mark as completed
      updates.status = 'completed'
    }

    const { error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', challengeId)

    if (error) throw error
  }

  static async cancelChallenge(challengeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('challenges')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', challengeId)
      .eq('challenger_id', user.id)
      .in('status', ['pending', 'accepted'])

    if (error) throw error
  }

  static async getChallengeHistory(): Promise<ChallengeWithUsers[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger:challenger_id(*),
        challenged:challenged_id(*)
      `)
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return data.map((challenge: any) => ({
      ...challenge,
      challenger: challenge.challenger,
      challenged: challenge.challenged
    }))
  }

  static async cleanupExpiredChallenges(): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'cancelled' })
      .lt('expires_at', new Date().toISOString())
      .in('status', ['pending', 'accepted'])

    if (error) throw error
  }
}