import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export async function createServerSupabaseClient() {
  const cookieStore = cookies()

  // Log available cookies for debugging
  console.log(
    "Server: 🍪 Available cookies:",
    cookieStore.getAll().map((c) => c.name),
  )

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.log("Cookie set error (expected in Server Component):", error)
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            console.log("Cookie remove error (expected in Server Component):", error)
          }
        },
      },
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  )
}

export async function getServerSession() {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Server: ❌ Error getting session:", error)
      return { session: null, user: null }
    }

    if (!data.session) {
      console.log("Server: ℹ️ No session found")
      return { session: null, user: null }
    }

    console.log("Server: ✅ Session found for user:", data.session.user.id)
    return { session: data.session, user: data.session.user }
  } catch (err) {
    console.error("Server: ❌ Unexpected error getting session:", err)
    return { session: null, user: null }
  }
}

