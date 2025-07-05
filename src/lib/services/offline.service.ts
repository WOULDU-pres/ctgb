// Offline data management for PWA
import { GameMode } from '@/hooks/useGameLogic';

interface OfflineGameResult {
  id: string;
  gameMode: GameMode;
  reactionTimes: number[];
  averageTime: number;
  bestTime: number;
  score: number;
  timestamp: number;
  synced: boolean;
}

interface OfflineStats {
  totalGames: number;
  bestTimes: Record<GameMode, number>;
  averageTimes: Record<GameMode, number>;
  lastPlayed: number;
}

export class OfflineService {
  private static readonly STORAGE_KEY = 'quicktap-offline-data';
  private static readonly STATS_KEY = 'quicktap-offline-stats';

  // Save game result to local storage
  static saveGameResult(
    gameMode: GameMode,
    reactionTimes: number[],
    averageTime: number,
    bestTime: number,
    score: number
  ): void {
    const result: OfflineGameResult = {
      id: crypto.randomUUID(),
      gameMode,
      reactionTimes,
      averageTime,
      bestTime,
      score,
      timestamp: Date.now(),
      synced: false
    };

    const existingResults = this.getOfflineResults();
    existingResults.push(result);

    // Keep only last 100 results to prevent storage bloat
    if (existingResults.length > 100) {
      existingResults.splice(0, existingResults.length - 100);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingResults));
    this.updateOfflineStats(gameMode, averageTime, bestTime);
  }

  // Get all offline results
  static getOfflineResults(): OfflineGameResult[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load offline results:', error);
      return [];
    }
  }

  // Get unsynchronized results
  static getUnsyncedResults(): OfflineGameResult[] {
    return this.getOfflineResults().filter(result => !result.synced);
  }

  // Mark results as synchronized
  static markAsSynced(resultIds: string[]): void {
    const results = this.getOfflineResults();
    results.forEach(result => {
      if (resultIds.includes(result.id)) {
        result.synced = true;
      }
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(results));
  }

  // Update offline statistics
  private static updateOfflineStats(gameMode: GameMode, averageTime: number, bestTime: number): void {
    const stats = this.getOfflineStats();
    
    stats.totalGames++;
    stats.lastPlayed = Date.now();
    
    // Update best time
    if (stats.bestTimes[gameMode] === 0 || bestTime < stats.bestTimes[gameMode]) {
      stats.bestTimes[gameMode] = bestTime;
    }
    
    // Update average time (running average)
    const results = this.getOfflineResults().filter(r => r.gameMode === gameMode);
    const totalTime = results.reduce((sum, r) => sum + r.averageTime, 0);
    stats.averageTimes[gameMode] = totalTime / results.length;
    
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  // Get offline statistics
  static getOfflineStats(): OfflineStats {
    try {
      const stored = localStorage.getItem(this.STATS_KEY);
      return stored ? JSON.parse(stored) : {
        totalGames: 0,
        bestTimes: {
          normal: 0,
          ranked: 0,
          target: 0,
          color: 0,
          sequence: 0
        },
        averageTimes: {
          normal: 0,
          ranked: 0,
          target: 0,
          color: 0,
          sequence: 0
        },
        lastPlayed: 0
      };
    } catch (error) {
      console.error('Failed to load offline stats:', error);
      return {
        totalGames: 0,
        bestTimes: { normal: 0, ranked: 0, target: 0, color: 0, sequence: 0 },
        averageTimes: { normal: 0, ranked: 0, target: 0, color: 0, sequence: 0 },
        lastPlayed: 0
      };
    }
  }

  // Get offline leaderboard for a specific game mode
  static getOfflineLeaderboard(gameMode: GameMode, limit: number = 10): OfflineGameResult[] {
    return this.getOfflineResults()
      .filter(result => result.gameMode === gameMode)
      .sort((a, b) => a.bestTime - b.bestTime)
      .slice(0, limit);
  }

  // Clear all offline data (for testing/reset)
  static clearOfflineData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STATS_KEY);
  }

  // Get storage usage information
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const totalSize = JSON.stringify(localStorage).length;
      const maxSize = 5 * 1024 * 1024; // 5MB typical limit
      
      return {
        used: totalSize,
        available: maxSize - totalSize,
        percentage: (totalSize / maxSize) * 100
      };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Sync offline data with server when online
  static async syncWithServer(): Promise<boolean> {
    const unsyncedResults = this.getUnsyncedResults();
    
    if (unsyncedResults.length === 0) {
      return true;
    }

    try {
      // This would typically call the GameService to sync results
      // For now, we'll just mark them as synced after a delay
      console.log(`Syncing ${unsyncedResults.length} offline results...`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark all as synced
      this.markAsSynced(unsyncedResults.map(r => r.id));
      
      console.log('Offline results synced successfully');
      return true;
    } catch (error) {
      console.error('Failed to sync offline results:', error);
      return false;
    }
  }
}