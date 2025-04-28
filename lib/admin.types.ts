export interface AdminSetting {
  id: string
  setting_key: string
  setting_value: any
  created_at: string
  updated_at: string
}

export interface FeatureFlags {
  advanced_trading: boolean
  portfolio_analysis: boolean
  ai_suggestions: boolean
  [key: string]: boolean
}

export interface AppSettings {
  app_version: string
  maintenance_mode: boolean
  allow_registration: boolean
  feature_flags: FeatureFlags
}

