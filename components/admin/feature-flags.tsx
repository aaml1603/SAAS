"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RefreshCw, Save } from "lucide-react"

interface FeatureFlags {
  id: string
  setting_key: string
  setting_value: Record<string, boolean>
  created_at: string
  updated_at: string
}

export default function FeatureFlags() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchFeatureFlags = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("setting_key", "feature_flags")
        .single()

      if (error) {
        throw error
      }

      setFeatureFlags(data || null)
    } catch (error) {
      console.error("Error fetching feature flags:", error)
      toast({
        title: "Error fetching feature flags",
        description: "There was a problem loading the feature flags.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatureFlags()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchFeatureFlags()
    setIsRefreshing(false)
  }

  const toggleFeatureFlag = (key: string) => {
    if (!featureFlags) return

    const flags =
      typeof featureFlags.setting_value === "string"
        ? JSON.parse(featureFlags.setting_value)
        : featureFlags.setting_value

    setFeatureFlags({
      ...featureFlags,
      setting_value: {
        ...flags,
        [key]: !flags[key],
      },
    })
  }

  const saveFeatureFlags = async () => {
    if (!featureFlags) return

    try {
      setIsSaving(true)

      const { error } = await supabase
        .from("admin_settings")
        .update({
          setting_value: featureFlags.setting_value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", featureFlags.id)

      if (error) {
        throw error
      }

      toast({
        title: "Feature flags saved",
        description: "Feature flags have been updated successfully.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error saving feature flags:", error)
      toast({
        title: "Error saving feature flags",
        description: "There was a problem updating the feature flags.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getFeatureFlags = () => {
    if (!featureFlags) return {}

    return typeof featureFlags.setting_value === "string"
      ? JSON.parse(featureFlags.setting_value)
      : featureFlags.setting_value
  }

  return (
    <Card className="bg-[#0F0F12] border-[#1F1F23]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-white">Feature Flags</CardTitle>
            <CardDescription>Enable or disable application features</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="shrink-0">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={saveFeatureFlags} disabled={isSaving || !featureFlags} size="sm" className="shrink-0">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : !featureFlags ? (
          <div className="text-center py-8 text-gray-400">No feature flags found</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(getFeatureFlags()).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-[#1A1A1E] rounded-lg border border-[#2B2B30]"
              >
                <div>
                  <h3 className="text-white font-medium">
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>
                  <p className="text-sm text-gray-400">{getFeatureFlagDescription(key)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id={key} checked={!!value} onCheckedChange={() => toggleFeatureFlag(key)} />
                  <Label htmlFor={key} className="text-white">
                    {value ? "Enabled" : "Disabled"}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getFeatureFlagDescription(key: string): string {
  const descriptions: Record<string, string> = {
    advanced_trading: "Enable advanced trading features like options strategies and multi-leg trades",
    portfolio_analysis: "Enable detailed portfolio analysis and risk assessment tools",
    ai_suggestions: "Enable AI-powered trade suggestions and market analysis",
  }

  return descriptions[key] || "No description available"
}

