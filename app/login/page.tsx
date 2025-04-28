"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { TrendingUp, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { fadeIn, fadeInUp, buttonTap } from "@/lib/animations"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Initialize auth context outside of try/catch to avoid conditional hook call
  const authContext = useAuth()
  const { signIn, user, session } = authContext || { signIn: null, user: null, session: null }

  useEffect(() => {
    // Set authInitialized to true once authContext is available
    if (authContext && !authInitialized) {
      setAuthInitialized(true)
    }
  }, [authContext, authInitialized])

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user || session) {
      console.log("Login page: User already logged in, redirecting to dashboard")
      // Use direct window location for more reliable redirect
      window.location.href = "/dashboard"
    }
  }, [user, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!signIn) {
        setError("Authentication service not available. Please try again.")
        setIsLoading(false)
        return
      }

      console.log("Attempting to sign in with email:", email)
      const { error } = await signIn(email, password)

      if (error) {
        console.error("Login error:", error)
        setError(error.message)
        setIsLoading(false)
        return
      }

      // If login is successful, redirect to dashboard
      console.log("Login successful, redirecting to dashboard")
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Unexpected login error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // Show loading state until auth is initialized
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F12]">
        <div className="text-white">Loading authentication...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen flex items-center justify-center bg-[#0F0F12] p-4"
    >
      <div className="w-full max-w-md">
        {/* Back to home link */}
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <TrendingUp className="h-8 w-8 text-green-400" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white"
            >
              OptionsTracker
            </motion.span>
          </div>
        </div>

        <motion.div variants={fadeInUp} className="bg-[#1F1F23] rounded-xl p-8 shadow-lg border border-[#2B2B30]">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Log In</h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-900/30 text-red-400 p-3 rounded-lg mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={fadeInUp} transition={{ delay: 0.1 }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#2B2B30] border border-[#3F3F46] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ delay: 0.2 }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#2B2B30] border border-[#3F3F46] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </motion.div>

            <motion.button
              variants={buttonTap}
              whileHover={{ scale: 1.02 }}
              whileTap="tap"
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </motion.button>
          </form>

          <motion.div
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-gray-400"
          >
            Don't have an account?{" "}
            <motion.span whileHover={{ scale: 1.05 }}>
              <Link href="/signup" className="text-green-400 hover:text-green-300">
                Sign up
              </Link>
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

