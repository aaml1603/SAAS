"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Calendar, ChevronRight, Home, LogOut, Settings, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
    },
    {
      name: "Trading Calendar",
      href: "/trading-calendar",
      icon: Calendar,
      current: pathname === "/trading-calendar",
    },
    {
      name: "Performance",
      href: "/performance",
      icon: BarChart3,
      current: pathname === "/performance",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      current: pathname === "/profile",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: pathname === "/settings",
    },
  ]

  return (
    <div className="flex h-full flex-col bg-[#0F0F12] border-r border-[#1F1F23]">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <h1 className="text-xl font-bold text-white">OptionsTracker</h1>
        </div>
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                item.current ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:bg-[#1F1F23] hover:text-white",
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
              )}
            >
              <item.icon
                className={cn(
                  item.current ? "text-green-400" : "text-gray-400 group-hover:text-white",
                  "mr-3 h-5 w-5 flex-shrink-0",
                )}
                aria-hidden="true"
              />
              {item.name}
              <ChevronRight
                className={cn(
                  "ml-auto h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-white",
                  item.current ? "text-white" : "",
                )}
              />
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-shrink-0 border-t border-[#1F1F23] p-4">
        <button
          onClick={signOut}
          className="group block w-full flex-shrink-0 rounded-md px-2 py-2 text-gray-400 hover:bg-[#1F1F23] hover:text-white"
        >
          <div className="flex items-center">
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
            <div className="text-sm font-medium">Sign Out</div>
          </div>
        </button>
      </div>
    </div>
  )
}

