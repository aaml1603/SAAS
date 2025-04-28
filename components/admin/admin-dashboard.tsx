"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserManagement from "./user-management"
import SystemSettings from "./system-settings"
import FeatureFlags from "./feature-flags"
import AppStatistics from "./app-statistics"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <FeatureFlags />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <AppStatistics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

