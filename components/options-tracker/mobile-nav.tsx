"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Calendar, ChevronRight, Home, LogOut, Settings, User, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function MobileNav({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}) {
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
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="flex h-full flex-col overflow-y-auto bg-[#0F0F12] py-4">
                <div className="flex items-center justify-between px-4">
                  <h1 className="text-xl font-bold text-white">OptionsTracker</h1>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-gray-400 hover:text-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-5 flex flex-grow flex-col">
                  <nav className="flex-1 space-y-1 px-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          item.current
                            ? "bg-[#1F1F23] text-white"
                            : "text-gray-400 hover:bg-[#1F1F23] hover:text-white",
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={cn(
                            item.current ? "text-green-400" : "text-gray-400 group-hover:text-white",
                            "mr-4 h-5 w-5 flex-shrink-0",
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
                    onClick={() => {
                      signOut()
                      setSidebarOpen(false)
                    }}
                    className="group block w-full flex-shrink-0 rounded-md px-2 py-2 text-gray-400 hover:bg-[#1F1F23] hover:text-white"
                  >
                    <div className="flex items-center">
                      <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                      <div className="text-sm font-medium">Sign Out</div>
                    </div>
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

