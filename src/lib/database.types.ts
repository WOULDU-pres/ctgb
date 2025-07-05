export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nickname: string
          characteristic: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nickname: string
          characteristic?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string
          characteristic?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_results: {
        Row: {
          id: string
          user_id: string
          game_mode: 'normal' | 'ranked' | 'target' | 'color' | 'sequence'
          reaction_times: number[]
          average_time: number
          best_time: number
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_mode: 'normal' | 'ranked' | 'target' | 'color' | 'sequence'
          reaction_times: number[]
          average_time: number
          best_time: number
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_mode?: 'normal' | 'ranked' | 'target'
          reaction_times?: number[]
          average_time?: number
          best_time?: number
          score?: number
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      leaderboards: {
        Row: {
          id: string
          user_id: string
          game_mode: 'normal' | 'ranked' | 'target' | 'color' | 'sequence'
          best_time: number
          average_time: number
          total_games: number
          rank: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_mode: 'normal' | 'ranked' | 'target' | 'color' | 'sequence'
          best_time: number
          average_time: number
          total_games: number
          rank: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_mode?: 'normal' | 'ranked' | 'target'
          best_time?: number
          average_time?: number
          total_games?: number
          rank?: number
          created_at?: string
          updated_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          challenger_id: string
          challenged_id: string
          game_mode: 'normal' | 'ranked' | 'target' | 'color' | 'sequence'
          challenger_score: number | null
          challenged_score: number | null
          status: 'pending' | 'accepted' | 'completed' | 'cancelled'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          challenger_id: string
          challenged_id: string
          game_mode: 'normal' | 'ranked' | 'target' | 'color' | 'sequence'
          challenger_score?: number | null
          challenged_score?: number | null
          status?: 'pending' | 'accepted' | 'completed' | 'cancelled'
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          challenger_id?: string
          challenged_id?: string
          game_mode?: 'normal' | 'ranked' | 'target'
          challenger_score?: number | null
          challenged_score?: number | null
          status?: 'pending' | 'accepted' | 'completed' | 'cancelled'
          created_at?: string
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type User = Tables<'users'>
export type GameResult = Tables<'game_results'>
export type Achievement = Tables<'achievements'>
export type Leaderboard = Tables<'leaderboards'>
export type Friend = Tables<'friends'>
export type Challenge = Tables<'challenges'>