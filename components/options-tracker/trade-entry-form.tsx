"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Upload } from "lucide-react"
import { createTrade } from "@/actions/trade-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createTradeDirectly } from "@/lib/supabase"
import { useTrades } from "@/hooks/use-trades"
import Image from "next/image"

interface TradeEntryFormProps {
  onCancel: () => void
}

export default function TradeEntryForm({ onCancel }: TradeEntryFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user, refreshSession, getAuthToken } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const { mutate } = useTrades() // Get the mutate function to refresh trades
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Ensure we have a user before proceeding
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add trades",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [user, router, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL for the selected image
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Add a function to calculate percentage gain for open trades
  // This will show a preview of the potential gain based on current entry price
  const calculatePercentageGain = (entryPrice: number, exitPrice: number, contracts: number) => {
    if (!entryPrice || !exitPrice || !contracts) return 0
    // Entry price and exit price are already per share
    // Each contract is for 100 shares
    const invested = entryPrice * contracts * 100
    const profit = (exitPrice - entryPrice) * contracts * 100
    return invested > 0 ? (profit / invested) * 100 : 0
  }

  // Add a state for showing potential gain
  const [potentialGain, setPotentialGain] = useState<{ profit: number; percentage: number } | null>(null)

  // Add a function to update potential gain when values change
  const updatePotentialGain = () => {
    const entryPriceValue = formRef.current?.elements.namedItem("entryPrice") as HTMLInputElement
    const contractsValue = formRef.current?.elements.namedItem("contracts") as HTMLInputElement

    if (entryPriceValue?.value && contractsValue?.value) {
      const entryPrice = Number.parseFloat(entryPriceValue.value)
      const contracts = Number.parseInt(contractsValue.value)

      // For demonstration purposes, calculate based on a hypothetical 10% increase
      const exitPrice = entryPrice * 1.1
      const profit = (exitPrice - entryPrice) * contracts * 100
      const percentage = calculatePercentageGain(entryPrice, exitPrice, contracts)

      setPotentialGain({ profit, percentage })
    } else {
      setPotentialGain(null)
    }
  }

  // Add an effect to update potential gain when form values change
  useEffect(() => {
    if (formRef.current) {
      const entryPriceInput = formRef.current.elements.namedItem("entryPrice") as HTMLInputElement
      const contractsInput = formRef.current.elements.namedItem("contracts") as HTMLInputElement

      const handleInputChange = () => updatePotentialGain()

      entryPriceInput?.addEventListener("input", handleInputChange)
      contractsInput?.addEventListener("input", handleInputChange)

      return () => {
        entryPriceInput?.removeEventListener("input", handleInputChange)
        contractsInput?.removeEventListener("input", handleInputChange)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Refresh the session before submitting
      await refreshSession()

      // Get the current auth token to verify we're authenticated
      const token = await getAuthToken()
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Could not verify your authentication. Please try logging in again.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      console.log("Client: 🔑 Auth token available:", !!token)

      // Make sure we have a valid form reference
      if (!formRef.current) {
        throw new Error("Form reference is not available")
      }

      // Create FormData from the form element
      const formData = new FormData(formRef.current)

      // Extract form data into an object
      const tradeData = {
        user_id: user?.id,
        symbol: formData.get("symbol") as string,
        strategy: formData.get("strategy") as string,
        option_type: formData.get("optionType") as "call" | "put",
        direction: "long", // Default to long since we're removing the direction option
        strike_price: Number.parseFloat(formData.get("strikePrice") as string),
        entry_price: Number.parseFloat(formData.get("entryPrice") as string),
        expiry_date: formData.get("expiryDate") as string,
        entry_date: formData.get("entryDate") as string,
        contracts: Number.parseInt(formData.get("contracts") as string),
        notes: (formData.get("notes") as string) || null,
        image_url: imagePreview || null,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Client: 📝 Trade data:", tradeData)

      // Try server action first
      let result = await createTrade(formData)
      console.log("Client: 📊 Server action result:", result)

      // If server action fails, try direct Supabase client
      if (!result.success) {
        console.log("Client: ⚠️ Server action failed, trying direct Supabase client")
        result = await createTradeDirectly(tradeData)
        console.log("Client: 📊 Direct Supabase result:", result)
      }

      // If direct Supabase client fails, try API route
      if (!result.success) {
        console.log("Client: ⚠️ Direct Supabase failed, trying API route")
        const apiResponse = await fetch("/api/trades", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tradeData),
        })

        const apiResult = await apiResponse.json()
        console.log("Client: 📊 API route result:", apiResult)

        if (apiResult.success) {
          result = { success: true }
        } else {
          result = { success: false, error: apiResult.error }
        }
      }

      if (result.success) {
        toast({
          title: "Trade added successfully",
          variant: "success",
        })

        // Refresh the trades data
        console.log("Client: 🔄 Refreshing trades data after adding trade")
        mutate()

        // Force a refresh of the page to update analytics
        router.refresh()

        // Close the form
        onCancel()
      } else {
        // Check if it's an authentication error
        if (result.authError) {
          toast({
            title: "Session expired",
            description: "Please log in again",
            variant: "destructive",
          })
          router.push("/login")
        } else {
          toast({
            title: "Error adding trade",
            description: result.error,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Client: ❌ Error adding trade:", error)
      toast({
        title: "Error adding trade",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If no user, don't render the form
  if (!user) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Add New Trade</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
            <input
              type="text"
              name="symbol"
              placeholder="SPY"
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Strategy</label>
            <input
              type="text"
              name="strategy"
              placeholder="Earnings Play"
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Option Type</label>
            <select
              name="optionType"
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contracts</label>
            <input
              type="number"
              name="contracts"
              placeholder="1"
              min="1"
              defaultValue="1"
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Strike Price ($)</label>
            <input
              type="number"
              name="strikePrice"
              placeholder="450"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Entry Price ($)</label>
            <input
              type="number"
              name="entryPrice"
              placeholder="3.50"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
        </div>

        {potentialGain && (
          <div className="text-green-500">
            Potential Gain: ${potentialGain.profit.toFixed(2)} ({potentialGain.percentage.toFixed(2)}%)
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Entry Date</label>
            <input
              type="date"
              name="entryDate"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
          <textarea
            name="notes"
            placeholder="Add any notes about this trade..."
            className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500 min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Trade Setup Image (Optional)</label>
          <div className="mt-1 flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center px-4 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm cursor-pointer hover:bg-[#2B2B30] transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </label>
            {imagePreview && (
              <button type="button" onClick={handleRemoveImage} className="ml-2 p-2 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {imagePreview && (
            <div className="mt-2 relative">
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Trade setup preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Add a section to show potential gain */}
        <div className="mt-4 p-3 bg-[#1A1A1E] rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Trade Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Potential P&L (10% move)</p>
              <p
                className={`text-sm font-medium ${potentialGain && potentialGain.profit > 0 ? "text-green-400" : "text-red-400"}`}
              >
                {potentialGain ? `$${potentialGain.profit.toFixed(2)}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Potential % Gain</p>
              <p
                className={`text-sm font-medium ${potentialGain && potentialGain.percentage > 0 ? "text-green-400" : "text-red-400"}`}
              >
                {potentialGain ? `${potentialGain.percentage.toFixed(2)}%` : "-"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">*Based on a hypothetical 10% price movement</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#2B2B30] hover:bg-[#3F3F46] text-white rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Trade"}
          </button>
        </div>
      </form>
    </div>
  )
}

