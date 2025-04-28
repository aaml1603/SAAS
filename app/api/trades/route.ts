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
      console.error("API: Auth session error:", sessionError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the trade data from the request
    const tradeData = await request.json()
    console.log("API: Received trade data:", tradeData)

    // Ensure the user ID is set
    tradeData.user_id = session.user.id

    // Set direction to long by default
    tradeData.direction = "long"

    // Insert the trade
    const { data, error } = await supabase.from("trades").insert(tradeData).select()

    if (error) {
      console.error("API: Error creating trade:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("API: Trade created successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("API: Unexpected error:", err)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

