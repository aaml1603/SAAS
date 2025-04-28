"use server"

import { createServerSupabaseClient, getServerSession } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// Check if the current user is an admin
export async function isUserAdmin() {
  try {
    const { user } = await getServerSession()

    if (!user) {
      return { isAdmin: false, error: "Not authenticated" }
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (error) {
      console.error("Error checking admin status:", error)
      return { isAdmin: false, error: error.message }
    }

    return { isAdmin: !!data?.is_admin, error: null }
  } catch (err) {
    console.error("Unexpected error checking admin status:", err)
    return { isAdmin: false, error: "An unexpected error occurred" }
  }
}

// Update a user's admin status
export async function updateUserAdminStatus(userId: string, isAdmin: boolean) {
  try {
    // First check if the current user is an admin
    const adminCheck = await isUserAdmin()

    if (!adminCheck.isAdmin) {
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId)

    if (error) {
      console.error("Error updating user admin status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin")
    return { success: true, error: null }
  } catch (err) {
    console.error("Unexpected error updating user admin status:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update system settings
export async function updateSystemSettings(settingId: string, settingValue: any) {
  try {
    // First check if the current user is an admin
    const adminCheck = await isUserAdmin()

    if (!adminCheck.isAdmin) {
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from("admin_settings")
      .update({
        setting_value: settingValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settingId)

    if (error) {
      console.error("Error updating system settings:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin")
    return { success: true, error: null }
  } catch (err) {
    console.error("Unexpected error updating system settings:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get user trades
export async function getUserTrades(userId: string) {
  try {
    // First check if the current user is an admin
    const adminCheck = await isUserAdmin()

    if (!adminCheck.isAdmin) {
      return { success: false, error: "Unauthorized: Admin access required", data: null }
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error fetching user trades:", error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, error: null, data }
  } catch (err) {
    console.error("Unexpected error fetching user trades:", err)
    return { success: false, error: "An unexpected error occurred", data: null }
  }
}

