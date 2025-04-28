import type { ReactNode } from "react"
import TopNav from "./top-nav"
import SidebarNew from "./sidebar-new"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#0F0F12] text-white">
      <SidebarNew />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="h-16 border-b border-[#1F1F23] sticky top-0 z-10 bg-[#0F0F12] w-full">
          <TopNav />
        </header>
        <main className="flex-1 overflow-auto p-3 sm:p-6 w-full">{children}</main>
      </div>
    </div>
  )
}

