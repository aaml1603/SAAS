"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Layout from "@/components/options-tracker/layout"
import { Toaster } from "@/components/ui/toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import UserPerformanceContent from "@/components/admin/user-performance-content"
import type { Database } from "@/lib/database.types"

type Trade = Database["public"]["Tables"]["trades"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function UserPerformancePage({ params }: { params: { id: string } }) {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoadingTrades, setIsLoadingTrades] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // Redirect if not logged in
      if (!user) {
        router.push("/login")
        return
      }

      // Redirect if not an admin
      if (!isAdmin) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin && params.id) {
      fetchUserProfile()
      fetchUserTrades()
    }
  }, [user, isAdmin, params.id])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", params.id).single()

      if (error) {
        throw error
      }

      setUserProfile(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    }
  }

  const fetchUserTrades = async () => {
    try {
      setIsLoadingTrades(true)
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", params.id)
        .order("entry_date", { ascending: false })

      if (error) {
        throw error
      }

      setTrades(data || [])
    } catch (error) {
      console.error("Error fetching user trades:", error)
      toast({
        title: "Error",
        description: "Failed to load user trades",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTrades(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUserTrades()
    setIsRefreshing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="dark">
      <SidebarProvider>
        <Layout>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/admin")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold text-white">User Performance</h1>
              </div>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {userProfile && (
              <Card className="bg-[#0F0F12] border-[#1F1F23] mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-white">User Profile</CardTitle>
                  <CardDescription>User information and account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="text-white">{userProfile.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{userProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Joined</p>
                      <p className="text-white">{new Date(userProfile.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Admin Status</p>
                      <p className="text-white">{userProfile.is_admin ? "Admin" : "Regular User"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <UserPerformanceContent trades={trades} isLoading={isLoadingTrades} userId={params.id} />
          </div>
        </Layout>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

