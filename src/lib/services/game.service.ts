import { supabase } from '@/lib/supabase'
import { GameResult, Leaderboard } from '@/lib/database.types'
import { GameMode } from '@/hooks/useGameLogic'
import { OfflineService } from './offline.service'

export class GameService {
  static async saveGameResult(
    gameMode: GameMode,
    reactionTimes: number[],
    averageTime: number,
    bestTime: number,
    score: number = 0
  ): Promise<GameResult | null> {
    // Always save to offline storage first
    OfflineService.saveGameResult(gameMode, reactionTimes, averageTime, bestTime, score);
    
    // Try to save online if user is authenticated and online
    try {
      if (!navigator.onLine) {
        console.log('Offline mode: Game result saved locally');
        return null;
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('User not authenticated: Game result saved locally only');
        return null;
      }

      const { data, error } = await supabase
        .from('game_results')
        .insert({
          user_id: user.id,
          game_mode: gameMode,
          reaction_times: reactionTimes,
          average_time: averageTime,
          best_time: bestTime,
          score,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to save online, using offline storage:', error);
        return null;
      }

      // Update leaderboard
      await this.updateLeaderboard(user.id, gameMode, bestTime, averageTime)

      return data
    } catch (error) {
      console.error('Error saving game result online:', error);
      return null;
    }
  }

  static async updateLeaderboard(
    userId: string,
    gameMode: GameMode,
    bestTime: number,
    averageTime: number
  ) {
    const { error } = await supabase.rpc('update_leaderboard', {
      p_user_id: userId,
      p_game_mode: gameMode,
      p_best_time: bestTime,
      p_average_time: averageTime,
    })

    if (error) throw error

    // Update ranks for this game mode
    await supabase.rpc('update_ranks', {
      p_game_mode: gameMode,
    })
  }

  static async getLeaderboard(
    gameMode: GameMode,
    limit: number = 10
  ): Promise<Array<Leaderboard & { nickname: string }>> {
    try {
      if (!navigator.onLine) {
        // Return offline leaderboard
        const offlineResults = OfflineService.getOfflineLeaderboard(gameMode, limit);
        return offlineResults.map((result, index) => ({
          id: result.id,
          user_id: 'offline-user',
          game_mode: result.gameMode,
          best_time: result.bestTime,
          average_time: result.averageTime,
          total_games: 1,
          rank: index + 1,
          created_at: new Date(result.timestamp).toISOString(),
          updated_at: new Date(result.timestamp).toISOString(),
          nickname: 'You (Offline)',
        }));
      }

      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          *,
          users!inner(nickname)
        `)
        .eq('game_mode', gameMode)
        .order('rank', { ascending: true })
        .limit(limit)

      if (error) throw error

      return data.map((entry: any) => ({
        id: entry.id,
        user_id: entry.user_id,
        game_mode: entry.game_mode,
        best_time: entry.best_time,
        average_time: entry.average_time,
        total_games: entry.total_games,
        rank: entry.rank,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        nickname: entry.users.nickname || 'Unknown',
      }))
    } catch (error) {
      console.error('Failed to load online leaderboard, using offline:', error);
      // Fallback to offline leaderboard
      const offlineResults = OfflineService.getOfflineLeaderboard(gameMode, limit);
      return offlineResults.map((result, index) => ({
        id: result.id,
        user_id: 'offline-user',
        game_mode: result.gameMode,
        best_time: result.bestTime,
        average_time: result.averageTime,
        total_games: 1,
        rank: index + 1,
        created_at: new Date(result.timestamp).toISOString(),
        updated_at: new Date(result.timestamp).toISOString(),
        nickname: 'You (Offline)',
      }));
    }
  }

  static async getUserStats(userId: string): Promise<{
    totalGames: number
    bestTimes: Record<GameMode, number>
    averageTimes: Record<GameMode, number>
    ranks: Record<GameMode, number>
  }> {
    const { data: gameResults, error: gameError } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', userId)

    if (gameError) throw gameError

    const { data: leaderboards, error: leaderboardError } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('user_id', userId)

    if (leaderboardError) throw leaderboardError

    const totalGames = gameResults.length
    const bestTimes = {} as Record<GameMode, number>
    const averageTimes = {} as Record<GameMode, number>
    const ranks = {} as Record<GameMode, number>

    // Initialize with default values
    ;(['normal', 'ranked', 'target', 'color', 'sequence'] as GameMode[]).forEach((mode) => {
      bestTimes[mode] = 0
      averageTimes[mode] = 0
      ranks[mode] = 0
    })

    leaderboards.forEach((entry) => {
      const mode = entry.game_mode as GameMode
      bestTimes[mode] = entry.best_time
      averageTimes[mode] = entry.average_time
      ranks[mode] = entry.rank
    })

    return {
      totalGames,
      bestTimes,
      averageTimes,
      ranks,
    }
  }

  static async getGameHistory(
    userId: string,
    gameMode?: GameMode,
    limit: number = 20
  ): Promise<GameResult[]> {
    let query = supabase
      .from('game_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (gameMode) {
      query = query.eq('game_mode', gameMode)
    }

    const { data, error } = await query.limit(limit)

    if (error) throw error
    return data
  }

  // Sync offline results with server
  static async syncOfflineResults(): Promise<boolean> {
    try {
      const unsyncedResults = OfflineService.getUnsyncedResults();
      
      if (unsyncedResults.length === 0) {
        return true;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('User not authenticated, cannot sync offline results');
        return false;
      }

      console.log(`Syncing ${unsyncedResults.length} offline results...`);
      
      const syncedIds: string[] = [];
      
      for (const result of unsyncedResults) {
        try {
          const { error } = await supabase
            .from('game_results')
            .insert({
              user_id: user.id,
              game_mode: result.gameMode,
              reaction_times: result.reactionTimes,
              average_time: result.averageTime,
              best_time: result.bestTime,
              score: result.score,
            });

          if (!error) {
            syncedIds.push(result.id);
            // Update leaderboard for this result
            await this.updateLeaderboard(user.id, result.gameMode, result.bestTime, result.averageTime);
          }
        } catch (error) {
          console.error('Failed to sync individual result:', error);
        }
      }
      
      // Mark successfully synced results
      if (syncedIds.length > 0) {
        OfflineService.markAsSynced(syncedIds);
        console.log(`Successfully synced ${syncedIds.length} offline results`);
      }
      
      return syncedIds.length === unsyncedResults.length;
    } catch (error) {
      console.error('Failed to sync offline results:', error);
      return false;
    }
  }
}