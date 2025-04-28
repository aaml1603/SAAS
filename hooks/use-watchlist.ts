"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import type { Database } from "@/lib/database.types"

export type WatchlistItem = Database["public"]["Tables"]["watchlist"]["Row"]

export function useWatchlist() {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchWatchlist = async () => {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching watchlist:", error)
        setError(error.message)
        setIsLoading(false)
        return
      }

      setWatchlist(data)
      setIsLoading(false)
    }

    fetchWatchlist()

    // Set up real-time subscription
    const watchlistSubscription = supabase
      .channel("watchlist-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watchlist",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchWatchlist()
        },
      )
      .subscribe()

    return () => {
      watchlistSubscription.unsubscribe()
    }
  }, [user])

  return { watchlist, isLoading, error }
}

