"use client"

import type * as React from "react"
import { Dot } from "lucide-react"
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
  }
>

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn("chart-container", className)}
      style={
        {
          "--chart-1": config[Object.keys(config)[0]]?.color,
          "--chart-2": config[Object.keys(config)[1]]?.color,
          "--chart-3": config[Object.keys(config)[2]]?.color,
          "--chart-4": config[Object.keys(config)[3]]?.color,
          "--chart-5": config[Object.keys(config)[4]]?.color,
          "--chart-6": config[Object.keys(config)[5]]?.color,
          "--chart-7": config[Object.keys(config)[6]]?.color,
          "--chart-8": config[Object.keys(config)[7]]?.color,
          "--chart-9": config[Object.keys(config)[8]]?.color,
          "--chart-10": config[Object.keys(config)[9]]?.color,
          "--color-desktop": "hsl(var(--chart-1))",
          "--color-mobile": "hsl(var(--chart-2))",
          "--color-tablet": "hsl(var(--chart-3))",
          "--color-revenue": "hsl(var(--chart-4))",
          "--color-expenses": "hsl(var(--chart-5))",
          "--color-profit": "hsl(var(--chart-6))",
          "--color-conversions": "hsl(var(--chart-7))",
          "--color-impressions": "hsl(var(--chart-8))",
          "--color-clicks": "hsl(var(--chart-9))",
          "--color-ctr": "hsl(var(--chart-10))",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<TooltipProps<ValueType, NameType>, "active" | "payload" | "label" | "labelFormatter"> {
  indicator?: "dot" | "line"
  hideLabel?: boolean
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  className,
  indicator = "line",
  hideLabel = false,
  ...props
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props}>
      {!hideLabel && (
        <div className="text-xs text-muted-foreground">{labelFormatter ? labelFormatter(label, payload) : label}</div>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {indicator === "dot" && (
              <Dot
                className="size-5"
                style={{
                  color: item.color,
                }}
              />
            )}
            {indicator === "line" && (
              <div
                className="size-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            <span className="text-xs font-medium">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Tooltip as ChartTooltip } from "recharts"

