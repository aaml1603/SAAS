"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Layout from "@/components/options-tracker/layout"
import { Toaster } from "@/components/ui/toast"
import TradingCalendar from "@/components/options-tracker/trading-calendar"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function TradingCalendarPage() {
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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-4 md:space-y-6 px-2 sm:px-4 md:px-6 bg-[#0F0F12]"
          >
            <TradingCalendar />
          </motion.div>
        </Layout>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

