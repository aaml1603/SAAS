"use client"

import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismissToast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col items-end gap-2 p-4 max-h-screen overflow-hidden">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center justify-between gap-2 rounded-lg p-4 shadow-lg transition-all",
            "bg-[#1F1F23] border border-[#2B2B30] text-white",
            "animate-in slide-in-from-right-full fade-in duration-300",
            "w-full max-w-md",
            toast.variant === "success" && "border-l-4 border-l-green-500",
            toast.variant === "destructive" && "border-l-4 border-l-red-500",
          )}
        >
          <div className="flex-1">
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && <p className="text-sm text-gray-400 mt-1">{toast.description}</p>}
          </div>
          <button onClick={() => dismissToast(toast.id)} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

