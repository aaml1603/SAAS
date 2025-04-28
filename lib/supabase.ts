import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your environment variables.")
}

// Create a single supabase client for the entire application
export const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use browser localStorage for session storage
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    // Set cookies to be accessible in HTTP only mode for better security
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  global: {
    headers: {
      // Add a custom header to help with debugging
      "x-client-info": "options-tracker-frontend",
    },
  },
})

// Add a simple test function to verify connection
export const testSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...")
    const { data, error } = await supabase.from("trades").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error: error.message }
    } else {
      console.log("Supabase connection test successful")
      return { success: true }
    }
  } catch (err) {
    console.error("Supabase connection test exception:", err)
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

export const createTradeDirectly = async (tradeData: any) => {
  try {
    console.log("Direct Supabase: Creating trade directly")

    const { data, error } = await supabase.from("trades").insert(tradeData).select()

    if (error) {
      console.error("Direct Supabase: Error creating trade:", error)
      return { success: false, error: error.message }
    }

    console.log("Direct Supabase: Trade created successfully:", data)
    return { success: true, data }
  } catch (err) {
    console.error("Direct Supabase: Unexpected error:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const closeTradeDirectly = async (tradeId: string, exitPrice: number, userId: string) => {
  try {
    console.log("Direct Supabase: Closing trade directly")

    const exitDate = new Date().toISOString().split("T")[0]

    // First get the trade to calculate profit
    const { data: trade, error: fetchError } = await supabase
      .from("trades")
      .select("*")
      .eq("id", tradeId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !trade) {
      console.error("Direct Supabase: Error fetching trade:", fetchError)
      return { success: false, error: fetchError?.message || "Trade not found" }
    }

    // Calculate profit based on direction
    let profit = 0
    if (trade.direction === "long") {
      // For long positions: (exit price - entry price) * contracts * 100 shares per contract
      profit = (exitPrice - trade.entry_price) * trade.contracts * 100
    } else {
      // For short positions: (entry price - exit price) * contracts * 100 shares per contract
      profit = (trade.entry_price - exitPrice) * trade.contracts * 100
    }

    console.log("Direct Supabase: Processing trade data")

    // Add this after the profit calculation
    let percentageGain = 0
    const invested = trade.entry_price * trade.contracts * 100
    if (invested > 0) {
      percentageGain = (profit / invested) * 100
    }

    console.log(`Direct Supabase: Percentage gain: ${percentageGain.toFixed(2)}%`)

    // Update the trade
    const updateData = {
      exit_price: exitPrice,
      exit_date: exitDate,
      profit,
      status: "closed",
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("trades")
      .update(updateData)
      .eq("id", tradeId)
      .eq("user_id", userId)
      .select()

    if (error) {
      console.error("Direct Supabase: Error closing trade:", error)
      return { success: false, error: error.message }
    }

    console.log("Direct Supabase: Trade closed successfully:", data)
    // Note: When using this function directly, make sure to call router.refresh()
    // in the component to update all analytics data
    return { success: true, data }
  } catch (err) {
    console.error("Direct Supabase: Unexpected error:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const deleteTradeDirectly = async (tradeId: string, userId: string) => {
  try {
    console.log("Direct Supabase: Deleting trade directly")

    const { error } = await supabase.from("trades").delete().eq("id", tradeId).eq("user_id", userId)

    if (error) {
      console.error("Direct Supabase: Error deleting trade:", error)
      return { success: false, error: error.message }
    }

    console.log("Direct Supabase: Trade deleted successfully")
    // Note: When using this function directly, make sure to call router.refresh()
    // in the component to update all analytics data
    return { success: true }
  } catch (err) {
    console.error("Direct Supabase: Unexpected error:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Check if there are any performance issues with the Supabase client configuration

