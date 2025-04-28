"use client"

import type React from "react"
import { LogOut, MoveUpRight, Settings, CreditCard, FileText, TrendingUp, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTradeStats } from "@/hooks/use-trades"

interface MenuItem {
  label: string
  value?: string
  href: string
  icon?: React.ReactNode
  external?: boolean
}

interface TraderProfileProps {
  avatar?: string
}

export default function TraderProfile({ avatar }: TraderProfileProps) {
  const { user, signOut, getUserProfile } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { stats, isLoading: statsLoading } = useTradeStats()

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true)
        const profileData = await getUserProfile()
        setProfile(profileData)
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, getUserProfile])

  const menuItems: MenuItem[] = [
    {
      label: "Subscription",
      value: "Pro Plan",
      href: "#",
      icon: <CreditCard className="w-4 h-4" />,
      external: false,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="w-4 h-4" />,
      external: true,
    },
  ]

  if (isLoading || statsLoading) {
    return (
      <div className="w-full max-w-sm mx-auto p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-zinc-800 h-16 w-16 mb-4"></div>
          <div className="h-4 bg-zinc-800 rounded w-24 mb-2"></div>
          <div className="h-3 bg-zinc-800 rounded w-16 mb-6"></div>
          <div className="w-full space-y-3">
            <div className="h-8 bg-zinc-800 rounded"></div>
            <div className="h-8 bg-zinc-800 rounded"></div>
            <div className="h-8 bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const displayName = profile?.full_name || user?.email || "Trader"
  const role = "Options Trader"

  // Format the real statistics
  const formattedStats = {
    winRate: `${stats.winRate.toFixed(1)}%`,
    totalTrades: stats.totalTrades.toString(),
    totalProfit: `$${stats.totalProfit.toLocaleString()}`,
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800">
        <div className="relative px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative shrink-0">
              <Image
                src={avatar || "/placeholder.svg?height=72&width=72"}
                alt={displayName}
                width={72}
                height={72}
                className="rounded-full ring-4 ring-zinc-900 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 ring-2 ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-zinc-100">{displayName}</h2>
              <p className="text-zinc-400">{role}</p>
            </div>
          </div>

          {/* Trader Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-zinc-800/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-zinc-400">Win Rate</span>
              </div>
              <p className="text-lg font-semibold text-zinc-100">{formattedStats.winRate}</p>
            </div>
            <div className="bg-zinc-800/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-zinc-400">Trades</span>
              </div>
              <p className="text-lg font-semibold text-zinc-100">{formattedStats.totalTrades}</p>
            </div>
            <div className="bg-zinc-800/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-zinc-400">P&L</span>
              </div>
              <p className={`text-lg font-semibold ${stats.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formattedStats.totalProfit}
              </p>
            </div>
          </div>

          <div className="h-px bg-zinc-800 my-6" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2 
                                  hover:bg-zinc-800/50 
                                  rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-zinc-100">{item.label}</span>
                </div>
                <div className="flex items-center">
                  {item.value && <span className="text-sm text-zinc-400 mr-2">{item.value}</span>}
                  {item.external && <MoveUpRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}

            <button
              onClick={signOut}
              type="button"
              className="w-full flex items-center justify-between p-2 
                              hover:bg-zinc-800/50 
                              rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-100">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

