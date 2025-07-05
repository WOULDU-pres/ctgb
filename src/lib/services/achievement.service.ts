import { supabase } from '@/lib/supabase'
import { Achievement } from '@/lib/database.types'
import { AchievementID } from '@/hooks/useAchievements'

export class AchievementService {
  static async unlockAchievement(achievementId: AchievementID): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
      })

    if (error && error.code !== '23505') { // 23505 is unique constraint violation
      throw error
    }
  }

  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data
  }

  static async checkAndUnlockAchievements(
    userId: string,
    gameResults: number[],
    gameMode: 'normal' | 'ranked' | 'target'
  ): Promise<AchievementID[]> {
    const unlockedAchievements: AchievementID[] = []

    try {
      // FIRST_GAME
      await this.unlockAchievement('FIRST_GAME')
      unlockedAchievements.push('FIRST_GAME')
    } catch (error) {
      // Achievement already unlocked
    }

    // SUB_200
    if (gameResults.some(time => time < 200)) {
      try {
        await this.unlockAchievement('SUB_200')
        unlockedAchievements.push('SUB_200')
      } catch (error) {
        // Achievement already unlocked
      }
    }

    // RANKED_FINISHER
    if (gameMode === 'ranked' && gameResults.length >= 10) {
      try {
        await this.unlockAchievement('RANKED_FINISHER')
        unlockedAchievements.push('RANKED_FINISHER')
      } catch (error) {
        // Achievement already unlocked
      }
    }

    // TARGET_MASTER
    if (gameMode === 'target' && gameResults.length >= 10) {
      try {
        await this.unlockAchievement('TARGET_MASTER')
        unlockedAchievements.push('TARGET_MASTER')
      } catch (error) {
        // Achievement already unlocked
      }
    }

    return unlockedAchievements
  }

  static async syncLocalAchievements(localAchievements: Set<AchievementID>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const serverAchievements = await this.getUserAchievements(user.id)
    const serverAchievementIds = new Set(serverAchievements.map(a => a.achievement_id as AchievementID))

    // Upload local achievements that aren't on server
    const toUpload = Array.from(localAchievements).filter(id => !serverAchievementIds.has(id))
    
    if (toUpload.length > 0) {
      const { error } = await supabase
        .from('achievements')
        .insert(toUpload.map(id => ({
          user_id: user.id,
          achievement_id: id,
        })))

      if (error) {
        console.error('Failed to sync local achievements:', error)
      }
    }
  }
}