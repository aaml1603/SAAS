"use client"

import { useState, useEffect } from "react"
import Content from "./content"
import Layout from "./layout"
import { Toaster } from "@/components/ui/toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function Dashboard() {
  const { user } = useAuth()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Add a short delay to ensure all components have time to initialize
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="dark">
      <SidebarProvider>
        <Layout>
          {isInitializing && user ? (
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-400">Loading dashboard...</p>
            </div>
          ) : (
            <Content />
          )}
        </Layout>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

