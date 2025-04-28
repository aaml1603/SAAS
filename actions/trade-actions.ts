"use server"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient, getServerSession } from "@/lib/supabase-server"

// Update the getUserId function to use our improved server-side client
export async function getUserId() {
  try {
    console.log("[SERVER] 🔍 Getting user ID from session")
    const { user } = await getServerSession()

    if (!user) {
      console.log("[SERVER] ℹ️ No active session found")
      return null
    }

    console.log("[SERVER] User ID validation completed")
    return user.id
  } catch (err) {
    console.error("[SERVER] ❌ Error getting user ID:", err)
    return null
  }
}

// Update the createTrade function to handle form data more robustly
export async function createTrade(formData: FormData) {
  try {
    console.log("[SERVER] Creating trade, getting user ID")
    const userId = await getUserId()

    if (!userId) {
      console.log("[SERVER] No user ID found, returning auth error")
      return { success: false, error: "Authentication required", authError: true }
    }

    console.log("[SERVER] User ID validation completed")

    // Safely extract form data with validation
    const symbol = formData.get("symbol")
    if (!symbol || typeof symbol !== "string") {
      return { success: false, error: "Symbol is required" }
    }

    const strategy = formData.get("strategy")
    if (!strategy || typeof strategy !== "string") {
      return { success: false, error: "Strategy is required" }
    }

    const optionType = formData.get("optionType")
    if (!optionType || (optionType !== "call" && optionType !== "put")) {
      return { success: false, error: "Valid option type is required" }
    }

    // Get notes (optional)
    const notes = formData.get("notes")
    const notesStr = notes && typeof notes === "string" ? notes : null

    // Get image URL (optional)
    const imageUrl = formData.get("image_url")
    const imageUrlStr = imageUrl && typeof imageUrl === "string" ? imageUrl : null

    const strikePriceStr = formData.get("strikePrice")
    if (!strikePriceStr || typeof strikePriceStr !== "string") {
      return { success: false, error: "Strike price is required" }
    }
    const strikePrice = Number.parseFloat(strikePriceStr)
    if (isNaN(strikePrice)) {
      return { success: false, error: "Strike price must be a valid number" }
    }

    const entryPriceStr = formData.get("entryPrice")
    if (!entryPriceStr || typeof entryPriceStr !== "string") {
      return { success: false, error: "Entry price is required" }
    }
    const entryPrice = Number.parseFloat(entryPriceStr)
    if (isNaN(entryPrice)) {
      return { success: false, error: "Entry price must be a valid number" }
    }

    const expiryDate = formData.get("expiryDate")
    if (!expiryDate || typeof expiryDate !== "string") {
      return { success: false, error: "Expiry date is required" }
    }

    const entryDate = formData.get("entryDate")
    if (!entryDate || typeof entryDate !== "string") {
      return { success: false, error: "Entry date is required" }
    }

    const contractsStr = formData.get("contracts")
    if (!contractsStr || typeof contractsStr !== "string") {
      return { success: false, error: "Number of contracts is required" }
    }
    const contracts = Number.parseInt(contractsStr)
    if (isNaN(contracts)) {
      return { success: false, error: "Contracts must be a valid number" }
    }

    console.log("[SERVER] Processing trade creation request")

    const supabase = await createServerSupabaseClient()

    // Create the trade object
    const tradeData = {
      user_id: userId,
      symbol: symbol.toUpperCase(),
      strategy,
      option_type: optionType,
      direction: "long", // Default to long since we're removing the direction option
      strike_price: strikePrice,
      entry_price: entryPrice,
      expiry_date: expiryDate,
      entry_date: entryDate,
      contracts,
      notes: notesStr,
      image_url: imageUrlStr,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("[SERVER] Inserting trade data:", tradeData)

    // Insert the trade with detailed error logging
    const { data, error } = await supabase.from("trades").insert(tradeData).select()

    if (error) {
      console.error("[SERVER] Error creating trade:", error)
      console.error("[SERVER] Error details:", error.details)
      console.error("[SERVER] Error hint:", error.hint)
      console.error("[SERVER] Error code:", error.code)
      return { success: false, error: error.message }
    }

    console.log("[SERVER] Trade created successfully:", data)
    revalidatePath("/dashboard")
    revalidatePath("/trading-calendar")
    revalidatePath("/performance")
    return { success: true }
  } catch (err) {
    console.error("[SERVER] Unexpected error in createTrade:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update the closeTrade function to use our improved server-side client
export async function closeTrade(tradeId: string, exitPrice: number) {
  try {
    console.log("[SERVER] 🔒 Closing trade, getting user ID")
    const userId = await getUserId()

    if (!userId) {
      console.log("[SERVER] ❌ No user ID found, returning auth error")
      return { success: false, error: "Authentication required", authError: true }
    }

    const exitDate = new Date().toISOString().split("T")[0]
    console.log(`[SERVER] 📅 Using exit date: ${exitDate}`)

    const supabase = await createServerSupabaseClient()

    // First get the trade to calculate profit
    console.log(`[SERVER] 🔍 Fetching trade with ID: ${tradeId}`)
    const { data: trade, error: fetchError } = await supabase
      .from("trades")
      .select("*")
      .eq("id", tradeId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !trade) {
      console.error("[SERVER] ❌ Error fetching trade:", fetchError)
      return { success: false, error: fetchError?.message || "Trade not found" }
    }

    console.log(`[SERVER] ✅ Found trade: ${trade.symbol} ${trade.option_type}`)

    // Calculate profit based on direction
    let profit = 0
    if (trade.direction === "long") {
      // For long positions: (exit price - entry price) * contracts * 100 shares per contract
      profit = (exitPrice - trade.entry_price) * trade.contracts * 100
    } else {
      // For short positions: (entry price - exit price) * contracts * 100 shares per contract
      profit = (trade.entry_price - exitPrice) * trade.contracts * 100
    }

    console.log(
      `[SERVER] 💰 Entry price: $${trade.entry_price}, Exit price: $${exitPrice}, Contracts: ${trade.contracts}`,
    )
    console.log(
      `[SERVER] 💰 Calculation: (${exitPrice} - ${trade.entry_price}) * ${trade.contracts} * 100 = $${profit.toFixed(2)}`,
    )

    console.log(`[SERVER] 💰 Calculated profit: $${profit.toFixed(2)}`)

    // Add this after the profit calculation
    let percentageGain = 0
    const invested = trade.entry_price * trade.contracts * 100
    if (invested > 0) {
      percentageGain = (profit / invested) * 100
    }

    console.log(`[SERVER] 📊 Percentage gain: ${percentageGain.toFixed(2)}%`)

    // Update the updateData object to include percentage_gain
    const updateData = {
      exit_price: exitPrice,
      exit_date: exitDate,
      profit,
      status: "closed",
      updated_at: new Date().toISOString(),
    }

    console.log(`[SERVER] 📝 Updating trade with data:`, updateData)

    // Update the trade
    const { data, error } = await supabase
      .from("trades")
      .update(updateData)
      .eq("id", tradeId)
      .eq("user_id", userId)
      .select()

    if (error) {
      console.error("[SERVER] ❌ Error closing trade:", error)
      return { success: false, error: error.message }
    }

    console.log("[SERVER] Trade closed successfully:", data)
    revalidatePath("/dashboard")
    revalidatePath("/trading-calendar")
    revalidatePath("/performance")
    revalidatePath("/history")
    return { success: true, data }
  } catch (err) {
    console.error("[SERVER] ❌ Unexpected error in closeTrade:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteTrade(tradeId: string) {
  try {
    console.log("[SERVER] 🗑️ Deleting trade with ID:", tradeId)
    const userId = await getUserId()

    if (!userId) {
      console.log("[SERVER] ❌ No user ID found, returning auth error")
      return { success: false, error: "Authentication required", authError: true }
    }

    console.log("[SERVER] 🔑 User ID validation completed")
    const supabase = await createServerSupabaseClient()

    // First verify the trade exists and belongs to the user
    const { data: trade, error: fetchError } = await supabase
      .from("trades")
      .select("id")
      .eq("id", tradeId)
      .eq("user_id", userId)
      .single()

    if (fetchError) {
      console.error("[SERVER] ❌ Error fetching trade:", fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!trade) {
      console.error("[SERVER] ❌ Trade not found or doesn't belong to user")
      return { success: false, error: "Trade not found" }
    }

    console.log("[SERVER] ✅ Trade found, proceeding with deletion")

    // Delete the trade
    const { error } = await supabase.from("trades").delete().eq("id", tradeId).eq("user_id", userId)

    if (error) {
      console.error("[SERVER] ❌ Error deleting trade:", error)
      return { success: false, error: error.message }
    }

    console.log("[SERVER] ✅ Trade deleted successfully")
    revalidatePath("/dashboard")
    revalidatePath("/trading-calendar")
    revalidatePath("/performance")
    revalidatePath("/history")
    return { success: true }
  } catch (err) {
    console.error("[SERVER] ❌ Unexpected error in deleteTrade:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function addToWatchlist(symbol: string) {
  try {
    console.log("[SERVER] Adding to watchlist, getting user ID")
    const userId = await getUserId()

    if (!userId) {
      console.log("[SERVER] No user ID found, returning auth error")
      return { success: false, error: "Authentication required", authError: true }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("watchlist").insert({
      user_id: userId,
      symbol: symbol.toUpperCase(),
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[SERVER] Error adding to watchlist:", error)
      return { success: false, error: error.message }
    }

    console.log("[SERVER] Added to watchlist successfully")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    console.error("[SERVER] Unexpected error in addToWatchlist:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function removeFromWatchlist(watchlistId: string) {
  try {
    console.log("[SERVER] Removing from watchlist, getting user ID")
    const userId = await getUserId()

    if (!userId) {
      console.log("[SERVER] No user ID found, returning auth error")
      return { success: false, error: "Authentication required", authError: true }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("watchlist").delete().eq("id", watchlistId).eq("user_id", userId)

    if (error) {
      console.error("[SERVER] Error removing from watchlist:", error)
      return { success: false, error: error.message }
    }

    console.log("[SERVER] Removed from watchlist successfully")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    console.error("[SERVER] Unexpected error in removeFromWatchlist:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

