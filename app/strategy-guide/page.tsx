"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Layout from "@/components/options-tracker/layout"
import { Toaster } from "@/components/ui/toast"
import { BookOpen } from "lucide-react"

export default function StrategyGuidePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="dark">
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Strategy Guide</h1>

          <div className="bg-[#0F0F12] rounded-xl p-8 border border-[#1F1F23] flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-[#1F1F23] mb-4">
              <BookOpen className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Options Strategy Guide</h2>
            <p className="text-gray-400 text-center max-w-md mb-6">
              Learn about different options trading strategies, risk profiles, and when to use them.
            </p>
            <p className="text-gray-500 text-sm">Coming soon</p>
          </div>
        </div>
      </Layout>
      <Toaster />
    </div>
  )
}

