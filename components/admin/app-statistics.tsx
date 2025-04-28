"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Users, TrendingUp, FileText } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AppStats {
  totalUsers: number
  newUsersToday: number
  totalTrades: number
  tradesThisWeek: number
  activeTradersThisWeek: number
  averageTradesPerUser: number
}

interface UserGrowthData {
  date: string
  count: number
}

export default function AppStatistics() {
  const [stats, setStats] = useState<AppStats | null>(null)
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchStatistics = async () => {
    try {
      setIsLoading(true)

      // Fetch total users
      const { count: totalUsers, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      if (usersError) throw usersError

      // Fetch new users today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count: newUsersToday, error: newUsersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString())

      if (newUsersError) throw newUsersError

      // Fetch total trades
      const { count: totalTrades, error: tradesError } = await supabase
        .from("trades")
        .select("*", { count: "exact", head: true })

      if (tradesError) throw tradesError

      // Fetch trades this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { count: tradesThisWeek, error: weekTradesError } = await supabase
        .from("trades")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString())

      if (weekTradesError) throw weekTradesError

      // Fetch active traders this week
      const { data: activeTradersData, error: activeTradersError } = await supabase
        .from("trades")
        .select("user_id")
        .gte("created_at", weekAgo.toISOString())
        .order("user_id")

      if (activeTradersError) throw activeTradersError

      const uniqueTraders = new Set(activeTradersData.map((trade) => trade.user_id))
      const activeTradersThisWeek = uniqueTraders.size

      // Calculate average trades per user
      const averageTradesPerUser = totalUsers ? Math.round((totalTrades / totalUsers) * 10) / 10 : 0

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        totalTrades: totalTrades || 0,
        tradesThisWeek: tradesThisWeek || 0,
        activeTradersThisWeek,
        averageTradesPerUser,
      })

      // Fetch user growth data for the last 30 days
      await fetchUserGrowthData()
    } catch (error) {
      console.error("Error fetching statistics:", error)
      toast({
        title: "Error fetching statistics",
        description: "There was a problem loading the application statistics.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserGrowthData = async () => {
    try {
      // Get data for the last 30 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const { data, error } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at")

      if (error) throw error

      // Group by day
      const usersByDay: Record<string, number> = {}

      data.forEach((user) => {
        const date = new Date(user.created_at).toISOString().split("T")[0]
        usersByDay[date] = (usersByDay[date] || 0) + 1
      })

      // Fill in missing days
      const growthData: UserGrowthData[] = []
      const currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0]
        growthData.push({
          date: dateStr,
          count: usersByDay[dateStr] || 0,
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }

      setUserGrowth(growthData)
    } catch (error) {
      console.error("Error fetching user growth data:", error)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchStatistics()
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-xl text-white">Application Statistics</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="shrink-0">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : !stats ? (
        <div className="text-center py-8 text-gray-400">No statistics available</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-[#1A1A1E] border-[#2B2B30]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                <p className="text-sm text-gray-400">{stats.newUsersToday} new today</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1E] border-[#2B2B30]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-400" />
                  Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalTrades}</div>
                <p className="text-sm text-gray-400">{stats.tradesThisWeek} this week</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1E] border-[#2B2B30]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  Active Traders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.activeTradersThisWeek}</div>
                <p className="text-sm text-gray-400">{stats.averageTradesPerUser} trades per user</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#0F0F12] border-[#1F1F23]">
            <CardHeader>
              <CardTitle className="text-lg text-white">User Growth (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d2d42" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                      tickMargin={8}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} tickMargin={8} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F1F23",
                        borderColor: "#2B2B30",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "#9CA3AF" }}
                      formatter={(value: number) => [`${value} new users`, "Users"]}
                      labelFormatter={(label) => {
                        const date = new Date(label)
                        return date.toLocaleDateString()
                      }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

