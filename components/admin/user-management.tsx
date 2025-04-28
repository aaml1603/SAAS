"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Search, Shield, ShieldOff, RefreshCw, BarChart } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { updateUserAdminStatus } from "@/actions/admin-actions"

interface User {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  created_at: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, is_admin, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error fetching users",
        description: "There was a problem loading the user list.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUsers()
    setIsRefreshing(false)
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Set processing state for this user
      setProcessingUsers((prev) => ({ ...prev, [userId]: true }))

      // First try with the server action
      const result = await updateUserAdminStatus(userId, !currentStatus)

      if (!result.success) {
        // If server action fails, fall back to client-side update
        const { error } = await supabase.from("profiles").update({ is_admin: !currentStatus }).eq("id", userId)

        if (error) {
          throw error
        }
      }

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, is_admin: !currentStatus } : user)))

      toast({
        title: "User updated",
        description: `Admin status ${!currentStatus ? "granted" : "revoked"} successfully.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error updating user",
        description: "There was a problem updating the user's admin status.",
        variant: "destructive",
      })
    } finally {
      // Clear processing state for this user
      setProcessingUsers((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="bg-[#0F0F12] border-[#1F1F23]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-white">User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-9 bg-[#1F1F23] border-[#2B2B30]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="shrink-0">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm ? "No users found matching your search" : "No users found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#2B2B30]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Joined</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400">Admin</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#2B2B30] hover:bg-[#1F1F23] transition-colors">
                    <td className="py-3 px-4 text-sm text-white">{user.full_name || "N/A"}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={user.is_admin}
                          onCheckedChange={() => toggleAdminStatus(user.id, user.is_admin)}
                          disabled={processingUsers[user.id]}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          disabled={processingUsers[user.id]}
                          className="flex items-center gap-1"
                        >
                          {user.is_admin ? (
                            <>
                              <ShieldOff className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Revoke Admin</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Make Admin</span>
                            </>
                          )}
                        </Button>
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <BarChart className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Performance</span>
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

