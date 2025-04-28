"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Home,
  LogOut,
  Settings,
  User,
  Menu,
  X,
  MessageSquare,
  Info,
  ShieldAlert,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export default function SidebarNew() {
  const pathname = usePathname()
  const { signOut, isAdmin } = useAuth() // Add isAdmin here
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Update the navigation array to include Admin section for admin users
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
      name: "Feedback",
      href: "/feedback",
      icon: MessageSquare,
      current: pathname === "/feedback",
    },
    {
      name: "About",
      href: "/about",
      icon: Info,
      current: pathname === "/about",
    },
    // Only show admin section to admin users
    ...(isAdmin
      ? [
          {
            name: "Admin",
            href: "/admin",
            icon: ShieldAlert,
            current: pathname === "/admin" || pathname.startsWith("/admin/"),
          },
        ]
      : []),
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

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Mobile menu overlay
  const MobileMenuOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity",
        mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      onClick={() => setMobileMenuOpen(false)}
    />
  )

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      type="button"
      className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-[#1F1F23] text-gray-400"
      onClick={toggleMobileMenu}
    >
      {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  )

  // Mobile sidebar
  const MobileSidebar = () => (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#0F0F12] border-r border-[#1F1F23] transition-transform transform md:hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-[#1F1F23]">
        <h1 className="text-xl font-bold text-white truncate">OptionsTracker</h1>
      </div>

      <div className="py-4 flex flex-col h-[calc(100%-4rem)] justify-between">
        <div>
          <ul className="space-y-1 px-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    item.current ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:bg-[#1F1F23] hover:text-white",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon
                    className={cn("mr-3 h-5 w-5 flex-shrink-0", item.current ? "text-green-400" : "text-gray-400")}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-2 mt-auto">
          <button
            onClick={() => {
              signOut()
              setMobileMenuOpen(false)
            }}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-[#1F1F23] hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <MobileMenuButton />
      <MobileMenuOverlay />
      <MobileSidebar />

      {/* Desktop Sidebar */}
      <Sidebar
        collapsible="icon"
        className="bg-[#0F0F12] border-r border-[#1F1F23] shrink-0 hidden md:block"
        style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
      >
        <SidebarHeader className="h-16 flex items-center px-4 border-b border-[#1F1F23]">
          <h1 className="text-xl font-bold text-white truncate">OptionsTracker</h1>
        </SidebarHeader>

        <SidebarContent className="py-4">
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={item.current}
                  tooltip={item.name}
                  className={cn(
                    item.current ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:bg-[#1F1F23] hover:text-white",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full",
                  )}
                >
                  <Link href={item.href} className="flex items-center w-full min-w-0">
                    <item.icon
                      className={cn(
                        item.current ? "text-green-400" : "text-gray-400 group-hover:text-white",
                        "mr-3 h-5 w-5 flex-shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    <ChevronRight
                      className={cn(
                        "ml-auto h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-white",
                        item.current ? "text-white" : "",
                      )}
                    />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-[#1F1F23] p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={signOut}
                className="group w-full flex-shrink-0 rounded-md px-2 py-2 text-gray-400 hover:bg-[#1F1F23] hover:text-white"
              >
                <div className="flex items-center">
                  <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                  <div className="text-sm font-medium">Sign Out</div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  )
}

