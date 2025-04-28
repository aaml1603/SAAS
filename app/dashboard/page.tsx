"use client"

import { useState } from "react"
import Dashboard from "@/components/options-tracker/dashboard"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [isCheckingAuth, setIsCheckingAuth] = useState(false) // Change to false by default
  const [authError, setAuthError] = useState<string | null>(null)

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Show auth error if any
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F12] p-4">
        <div className="bg-red-900/30 text-red-400 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Authentication Error</h2>
          <p className="mb-4">{authError}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  // If we get here, the user should be authenticated
  return <Dashboard />
}

