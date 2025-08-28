export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          id: string
          osm_id: string | null
          name: string
          lat: number
          lon: number
          country: string | null
          region: string | null
          city: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          osm_id?: string | null
          name: string
          lat: number
          lon: number
          country?: string | null
          region?: string | null
          city?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          osm_id?: string | null
          name?: string
          lat?: number
          lon?: number
          country?: string | null
          region?: string | null
          city?: string | null
          address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          id: string
          user_id: string
          place_id: string
          visited_on: string
          rating: number | null
          note: string | null
          photos: Json[] | null
          privacy: 'public' | 'followers' | 'private'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          visited_on: string
          rating?: number | null
          note?: string | null
          photos?: Json[] | null
          privacy?: 'public' | 'followers' | 'private'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_id?: string
          visited_on?: string
          rating?: number | null
          note?: string | null
          photos?: Json[] | null
          privacy?: 'public' | 'followers' | 'private'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'visits_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'visits_place_id_fkey'
            columns: ['place_id']
            isOneToOne: false
            referencedRelation: 'places'
            referencedColumns: ['id']
          },
        ]
      }
      follows: {
        Row: {
          follower_id: string
          followee_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          followee_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          followee_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_followee_id_fkey'
            columns: ['followee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      likes: {
        Row: {
          id: string
          user_id: string
          visit_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          visit_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          visit_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'likes_visit_id_fkey'
            columns: ['visit_id']
            isOneToOne: false
            referencedRelation: 'visits'
            referencedColumns: ['id']
          },
        ]
      }
      comments: {
        Row: {
          id: string
          user_id: string
          visit_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          visit_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          visit_id?: string
          body?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_visit_id_fkey'
            columns: ['visit_id']
            isOneToOne: false
            referencedRelation: 'visits'
            referencedColumns: ['id']
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}