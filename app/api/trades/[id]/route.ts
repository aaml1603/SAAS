import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const tradeId = params.id
    console.log(`API: 🗑️ Deleting trade with ID: ${tradeId}`)

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

    // Delete the trade
    const { error } = await supabase.from("trades").delete().eq("id", tradeId).eq("user_id", session.user.id)

    if (error) {
      console.error("API: ❌ Error deleting trade:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("API: ✅ Trade deleted successfully")
    // Note: When using this API route, make sure to call router.refresh() in the client component
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API: ❌ Unexpected error:", err)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

