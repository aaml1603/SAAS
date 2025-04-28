import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get the current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error("API: ❌ Auth session error:", sessionError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the trade data from the request
    const { tradeId, exitPrice } = await request.json()
    console.log("API: 📊 Received close trade data:", { tradeId, exitPrice })

    if (!tradeId || typeof exitPrice !== "number") {
      return NextResponse.json({ error: "Invalid trade data" }, { status: 400 })
    }

    // First get the trade to calculate profit
    const { data: trade, error: fetchError } = await supabase
      .from("trades")
      .select("*")
      .eq("id", tradeId)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !trade) {
      console.error("API: ❌ Error fetching trade:", fetchError)
      return NextResponse.json({ error: fetchError?.message || "Trade not found" }, { status: 404 })
    }

    console.log("API: ✅ Found trade:", trade)

    // Calculate profit based on direction
    let profit = 0
    if (trade.direction === "long") {
      // For long positions: (exit price - entry price) * contracts * 100 shares per contract
      profit = (exitPrice - trade.entry_price) * trade.contracts * 100
    } else {
      // For short positions: (entry price - exit price) * contracts * 100 shares per contract
      profit = (trade.entry_price - exitPrice) * trade.contracts * 100
    }

    console.log(`API: 💰 Entry price: $${trade.entry_price}, Exit price: $${exitPrice}, Contracts: ${trade.contracts}`)
    console.log(
      `API: 💰 Calculation: (${exitPrice} - ${trade.entry_price}) * ${trade.contracts} * 100 = $${profit.toFixed(2)}`,
    )

    const exitDate = new Date().toISOString().split("T")[0]

    // Update the trade
    const updateData = {
      exit_price: exitPrice,
      exit_date: exitDate,
      profit,
      status: "closed",
      updated_at: new Date().toISOString(),
    }

    console.log("API: 📝 Updating trade with data:", updateData)

    const { data, error } = await supabase
      .from("trades")
      .update(updateData)
      .eq("id", tradeId)
      .eq("user_id", session.user.id)
      .select()

    if (error) {
      console.error("API: ❌ Error closing trade:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("API: ✅ Trade closed successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("API: ❌ Unexpected error:", err)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

