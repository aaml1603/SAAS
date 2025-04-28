"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Layout from "@/components/options-tracker/layout"
import { Toaster } from "@/components/ui/toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()

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
          <AdminDashboard />
        </Layout>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

