export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string
          user_id: string
          symbol: string
          strategy: string
          option_type: "call" | "put"
          direction: "long" | "short"
          strike_price: number
          entry_price: number
          exit_price: number | null
          expiry_date: string
          entry_date: string
          exit_date: string | null
          contracts: number
          profit: number | null
          status: "open" | "closed"
          notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          strategy: string
          option_type: "call" | "put"
          direction: "long" | "short"
          strike_price: number
          entry_price: number
          exit_price?: number | null
          expiry_date: string
          entry_date: string
          exit_date?: string | null
          contracts: number
          profit?: number | null
          percentage_gain?: number | null
          status: "open" | "closed"
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          strategy?: string
          option_type?: "call" | "put"
          direction?: "long" | "short"
          strike_price?: number
          entry_price?: number
          exit_price?: number | null
          expiry_date?: string
          entry_date?: string
          exit_date?: string | null
          contracts?: number
          profit?: number | null
          percentage_gain?: number | null
          status?: "open" | "closed"
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          full_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          full_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          full_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          symbol: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          created_at?: string
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

