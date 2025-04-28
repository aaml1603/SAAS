"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { testSupabaseConnection } from "@/lib/supabase"
import { useTrades } from "@/hooks/use-trades"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TrackerScore } from "./tracker-score/tracker-score"
import { CumulativePLChart } from "./pl-charts/cumulative-pl-chart"
import PerformanceMetrics from "./performance-metrics"
import TradeHistory from "./trade-history"
import OpenPositions from "./open-positions"
import TradeEntryForm from "./trade-entry-form"
import { AnimatePresence } from "framer-motion"

export default function Content() {
  const { user } = useAuth()
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; error?: string } | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { lastUpdate, mutate } = useTrades()
  const isMobile = useIsMobile()
  const lastRefreshRef = useRef(0)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialRenderRef = useRef(true)
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(true)

  // Test Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      // Only check connection once when the user is available
      if (user && connectionStatus === null) {
        const result = await testSupabaseConnection()
        setConnectionStatus(result)

        if (!result.success) {
          toast({
            title: "Database connection error",
            description: result.error || "Could not connect to the database. Please try again later.",
            variant: "destructive",
          })
        }
      }
    }

    checkConnection()
  }, [user, connectionStatus, toast])

  // Centralized refresh function - only mutate data, don't refresh the page
  const refreshData = useCallback(() => {
    const now = Date.now()

    // Prevent multiple refreshes within 30 seconds (except for the initial load and explicit user actions)
    if (!initialRenderRef.current && now - lastRefreshRef.current < 30000) {
      console.log("Client: ⏱️ Skipping refresh - cooldown period active")
      return
    }

    console.log("Client: 🔄 Refreshing dashboard data")
    mutate() // Only update the data, don't refresh the page
    lastRefreshRef.current = now

    // After first render, set initialRender to false
    if (initialRenderRef.current) {
      initialRenderRef.current = false
    }
  }, [mutate])

  // Clean up any pending timeouts
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  // Only refresh on initial mount and after explicit user actions
  useEffect(() => {
    // Force an immediate data refresh when the component mounts
    const loadInitialData = async () => {
      console.log("Client: 🔄 Initial dashboard data")
      setIsLoading(true)

      try {
        // Force a refresh of the data
        await mutate()

        // Add a small delay to ensure components have time to process the data
        setTimeout(() => {
          if (mountedRef.current) {
            router.refresh()
            initialRenderRef.current = false
          }
        }, 500)
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    // Only run on initial mount
    if (initialRenderRef.current && user) {
      loadInitialData()
    }

    return () => {
      mountedRef.current = false
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [mutate, router, user])

  const handleAddTrade = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add trades",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setShowTradeForm(true)
  }

  const handleTradeFormClose = () => {
    setShowTradeForm(false)
    // Force a refresh to update analytics after adding a trade
    refreshData()
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4 w-full">
      {/* Header section */}
      <motion.div
        variants={fadeInUp}
        className={cn("flex items-center", isMobile ? "flex-col space-y-3" : "flex-row justify-between")}
      >
        <div className="flex items-center gap-3 w-full">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("font-bold text-white", isMobile ? "text-xl" : "text-2xl")}
          >
            Options Trading Dashboard
          </motion.h1>
        </div>
        <Button onClick={handleAddTrade} className={cn(isMobile && "w-full")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Trade
        </Button>
      </motion.div>

      {/* Performance Overview */}
      <motion.div variants={fadeInUp}>
        <PerformanceMetrics refreshData={refreshData} />
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TrackerScore />
        <div className="lg:col-span-2">
          <CumulativePLChart />
        </div>
      </motion.div>

      {/* Positions and History */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0F0F12] rounded-xl p-4 sm:p-6 flex flex-col border border-[#1F1F23]">
          <h2 className="text-lg font-bold text-white mb-4">Open Positions</h2>
          <OpenPositions refreshData={refreshData} />
        </div>
        <div className="bg-[#0F0F12] rounded-xl p-4 sm:p-6 flex flex-col border border-[#1F1F23]">
          <h2 className="text-lg font-bold text-white mb-4">Trade History</h2>
          <TradeHistory refreshData={refreshData} />
        </div>
      </motion.div>

      {/* Trade Entry Form Modal */}
      <AnimatePresence>
        {showTradeForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#0F0F12] rounded-xl border border-[#1F1F23] p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <TradeEntryForm onCancel={handleTradeFormClose} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

