"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface FeatureFlags {
  advanced_trading: boolean
  portfolio_analysis: boolean
  ai_suggestions: boolean
  [key: string]: boolean
}

export function useFeatureFlags() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    advanced_trading: false,
    portfolio_analysis: false,
    ai_suggestions: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("admin_settings")
          .select("setting_value")
          .eq("setting_key", "feature_flags")
          .single()

        if (error) {
          throw error
        }

        const flags = typeof data.setting_value === "string" ? JSON.parse(data.setting_value) : data.setting_value

        setFeatureFlags(flags)
      } catch (err) {
        console.error("Error fetching feature flags:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch feature flags")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeatureFlags()
  }, [])

  const isFeatureEnabled = (featureName: string): boolean => {
    return !!featureFlags[featureName]
  }

  return { featureFlags, isFeatureEnabled, isLoading, error }
}

