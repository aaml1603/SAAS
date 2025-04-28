"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface TrackerScoreProps {
  userId?: string
}

export function TrackerScore({ userId }: TrackerScoreProps) {
  const { user } = useAuth()
  const [score, setScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchScore = async () => {
      setIsLoading(true)
      try {
        const targetUserId = userId || user?.id
        if (!targetUserId) return

        // Calculate score based on trades
        const { data: trades, error } = await supabase.from("trades").select("*").eq("user_id", targetUserId)

        if (error) {
          console.error("Error fetching trades for score calculation:", error)
          return
        }

        if (!trades || trades.length === 0) {
          setScore(0)
          return
        }

        // Calculate score based on win rate, profit factor, and number of trades
        const closedTrades = trades.filter((t) => t.status === "closed")
        if (closedTrades.length === 0) {
          setScore(0)
          return
        }

        const winningTrades = closedTrades.filter((t) => t.profit !== null && t.profit > 0)
        const winRate = (winningTrades.length / closedTrades.length) * 100

        const grossProfit = winningTrades.reduce((sum, t) => sum + (t.profit || 0), 0)
        const losingTrades = closedTrades.filter((t) => t.profit !== null && t.profit <= 0)
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit || 0), 0))
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0

        // Calculate score (0-100)
        // 40% based on win rate, 40% based on profit factor, 20% based on number of trades
        const winRateScore = Math.min(100, winRate) * 0.4
        const profitFactorScore = Math.min(100, profitFactor * 20) * 0.4
        const tradesScore = Math.min(100, (closedTrades.length / 50) * 100) * 0.2

        const calculatedScore = winRateScore + profitFactorScore + tradesScore
        setScore(Math.round(calculatedScore))
      } catch (err) {
        console.error("Error calculating tracker score:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScore()
  }, [user, userId])

  const getScoreColor = () => {
    if (score === null) return "text-gray-400"
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreLabel = () => {
    if (score === null) return "Calculating..."
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Average"
    if (score >= 20) return "Needs Improvement"
    return "Poor"
  }

  return (
    <Card className="bg-[#0F0F12] border-[#1F1F23]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-white">Trader Score</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <Skeleton className="h-16 w-16 rounded-full mb-4" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className={`text-6xl font-bold ${getScoreColor()}`}>{score}</div>
            <div className="text-xl font-medium text-white mt-2">{getScoreLabel()}</div>
            <div className="text-sm text-gray-400 mt-1">Based on trading performance</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

