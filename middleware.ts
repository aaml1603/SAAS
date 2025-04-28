import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Skip middleware completely for POST requests (server actions)
  if (req.method === "POST") {
    console.log("Middleware: Skipping for POST request")
    return NextResponse.next()
  }

  // Skip middleware for static assets
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/static") ||
    req.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  console.log("Middleware: Processing request for", req.nextUrl.pathname)

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Log cookies for debugging
  console.log("Middleware processing request")

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Log session status
  console.log("Middleware session check completed")

  // Check for auth-related paths that should bypass redirection
  const isAuthRelatedPath =
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/signup" ||
    req.nextUrl.pathname.startsWith("/api/auth")

  // Check for admin-only paths
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin")

  // If there's no session and the user is trying to access a protected route
  if (!session && !isAuthRelatedPath) {
    console.log("Middleware: No session, redirecting to login")
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and the user is trying to access login/signup
  if (session && isAuthRelatedPath) {
    console.log("Middleware: Session found, redirecting to dashboard")
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Only check admin status if accessing admin routes
  if (session && isAdminPath) {
    // Check if the user is an admin
    const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

    if (error || !data?.is_admin) {
      console.log("Middleware: User is not an admin, redirecting to dashboard")
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Add session user to request headers for server components
  if (session) {
    res.headers.set("x-user-id", session.user.id)
  }

  return res
}

// IMPORTANT: Disable middleware for now to debug the issue
export const config = {
  matcher: [
    // Temporarily disable middleware to debug
    // "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\..*|_vercel).*)",
  ],
}

