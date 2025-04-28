"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Layout from "@/components/options-tracker/layout"
import { Toaster } from "@/components/ui/toast"
import TradeHistory from "@/components/options-tracker/trade-history"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function HistoryPage() {
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
      <SidebarProvider>
        <Layout>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Trade History</h1>

            <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23]">
              <TradeHistory />
            </div>
          </div>
        </Layout>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

