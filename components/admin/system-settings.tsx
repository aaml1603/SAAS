"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RefreshCw, Save } from "lucide-react"

interface Setting {
  id: string
  setting_key: string
  setting_value: any
  created_at: string
  updated_at: string
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .order("setting_key", { ascending: true })

      if (error) {
        throw error
      }

      setSettings(data || [])
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error fetching settings",
        description: "There was a problem loading the system settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSettings()
    setIsRefreshing(false)
  }

  const updateSettingValue = (key: string, value: any) => {
    setSettings(
      settings.map((setting) => (setting.setting_key === key ? { ...setting, setting_value: value } : setting)),
    )
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)

      // Update each setting
      for (const setting of settings) {
        const { error } = await supabase
          .from("admin_settings")
          .update({
            setting_value: setting.setting_value,
            updated_at: new Date().toISOString(),
          })
          .eq("id", setting.id)

        if (error) {
          throw error
        }
      }

      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error saving settings",
        description: "There was a problem updating the system settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderSettingInput = (setting: Setting) => {
    const key = setting.setting_key
    const value = setting.setting_value

    // Handle boolean values
    if (typeof value === "boolean" || value === "true" || value === "false") {
      const boolValue = typeof value === "boolean" ? value : value === "true"
      return (
        <div className="flex items-center space-x-2">
          <Switch id={key} checked={boolValue} onCheckedChange={(checked) => updateSettingValue(key, checked)} />
          <Label htmlFor={key} className="text-white">
            {boolValue ? "Enabled" : "Disabled"}
          </Label>
        </div>
      )
    }

    // Handle string values
    if (typeof value === "string" && !value.startsWith("{") && !value.startsWith("[")) {
      // Remove quotes if the value is a JSON string
      const cleanValue = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value

      return (
        <Input
          id={key}
          value={cleanValue}
          onChange={(e) => updateSettingValue(key, e.target.value)}
          className="bg-[#1F1F23] border-[#2B2B30]"
        />
      )
    }

    // Handle JSON values
    try {
      const jsonValue = typeof value === "string" ? JSON.parse(value) : value
      return (
        <Input
          id={key}
          value={JSON.stringify(jsonValue, null, 2)}
          onChange={(e) => {
            try {
              const newValue = JSON.parse(e.target.value)
              updateSettingValue(key, newValue)
            } catch (error) {
              // Allow invalid JSON during editing
              updateSettingValue(key, e.target.value)
            }
          }}
          className="bg-[#1F1F23] border-[#2B2B30] font-mono text-xs"
        />
      )
    } catch (error) {
      // Fallback for any other type
      return (
        <Input
          id={key}
          value={String(value)}
          onChange={(e) => updateSettingValue(key, e.target.value)}
          className="bg-[#1F1F23] border-[#2B2B30]"
        />
      )
    }
  }

  return (
    <Card className="bg-[#0F0F12] border-[#1F1F23]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-white">System Settings</CardTitle>
            <CardDescription>Configure application settings</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="shrink-0">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={saveSettings} disabled={isSaving} size="sm" className="shrink-0">
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
        ) : settings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No system settings found</div>
        ) : (
          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <div>
                  <Label htmlFor={setting.setting_key} className="text-white font-medium">
                    {setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
                {renderSettingInput(setting)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

