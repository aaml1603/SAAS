export interface Trade {
  id: string
  symbol: string
  strategy: string
  optionType: "call" | "put"
  direction: "long" | "short"
  strikePrice: number
  entryPrice: number
  exitPrice?: number
  expiryDate: string
  entryDate: string
  exitDate?: string
  contracts: number
  profit?: number
  percentageGain?: number // Add this line
  status: "open" | "closed"
  notes?: string
  imageUrl?: string
}

