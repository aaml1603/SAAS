"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
  }>
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{
    error: Error | null
  }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  getAuthToken: () => Promise<string | null>
  getUserProfile: () => Promise<any>
}

// Create context with default values to avoid null checks
const defaultContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signIn: async () => ({ error: new Error("Auth context not initialized") }),
  signUp: async () => ({ error: new Error("Auth context not initialized") }),
  signOut: async () => {},
  refreshSession: async () => {},
  getAuthToken: async () => null,
  getUserProfile: async () => null,
}

const AuthContext = createContext<AuthContextType>(defaultContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const REFRESH_INTERVAL = 30000 // 30 seconds in milliseconds

  const signIn = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true)
      console.log("Signing in...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error) {
        console.log("Sign in successful")

        // Manually set the session and user to prevent race conditions
        setSession(data.session)
        setUser(data.session?.user ?? null)

        // Check admin status if user exists
        if (data.session?.user) {
          await checkAdminStatus(data.session.user.id)
        }

        return { error: null }
      } else {
        console.error("Sign in error:", error)
        return { error }
      }
    } catch (err) {
      console.error("Unexpected error during sign in:", err)
      return { error: err instanceof Error ? err : new Error("An unexpected error occurred") }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsAuthenticating(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })
      if (error) {
        return { error }
      }

      // After successful signup, update the user's profile
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
          },
        ])

        if (profileError) {
          console.error("Error creating user profile:", profileError)
          return { error: profileError }
        }
      }

      return { error: null }
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setIsAuthenticating(true)
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setIsAdmin(false)
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error refreshing session:", error)
      } else {
        setSession(data.session)
        setUser(data.session?.user ?? null)
        setLastRefreshTime(Date.now())
      }
    } catch (error) {
      console.error("Unexpected error refreshing session:", error)
    }
  }, [])

  const getAuthToken = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    return data.session?.access_token ?? null
  }, [])

  // Add a function to check if the user is an admin
  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

      if (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
        return false
      }

      setIsAdmin(!!data?.is_admin)
      return !!data?.is_admin
    } catch (err) {
      console.error("Unexpected error checking admin status:", err)
      setIsAdmin(false)
      return false
    }
  }, [])

  // Update getUserProfile to include admin status
  const getUserProfile = useCallback(async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      // Update admin status
      setIsAdmin(!!data.is_admin)

      return data
    } catch (err) {
      console.error("Unexpected error fetching user profile:", err)
      return null
    }
  }, [user])

  // Update the useEffect to check admin status when user changes
  useEffect(() => {
    let isMounted = true

    const setData = async () => {
      try {
        setIsLoading(true)
        console.log("Initial session check...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          if (isMounted) {
            setIsLoading(false)
            setIsInitialized(true)
          }
          return
        }

        console.log("Initial session check completed")

        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)

          // Check admin status if user exists
          if (session?.user) {
            await checkAdminStatus(session.user.id)
          }

          setIsLoading(false)
          setIsInitialized(true)
        }
      } catch (err) {
        console.error("Unexpected error in auth setup:", err)
        if (isMounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    setData()

    // Use a more stable listener setup
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event)

      // Skip state updates during authentication to prevent race conditions
      if (isAuthenticating && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        console.log("Skipping auth state update during authentication process")
        return
      }

      if (isMounted) {
        if (event === "SIGNED_OUT") {
          setSession(null)
          setUser(null)
          setIsAdmin(false) // Reset admin status on sign out
        } else if (newSession) {
          setSession(newSession)
          setUser(newSession.user)

          // Check admin status if user exists
          if (newSession.user) {
            await checkAdminStatus(newSession.user.id)
          }
        }
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      listener?.subscription.unsubscribe()
    }
  }, [isAuthenticating, checkAdminStatus])

  // Include isAdmin in the context value
  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshSession,
    getAuthToken,
    getUserProfile,
  }

  // Only render children when auth is initialized
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

