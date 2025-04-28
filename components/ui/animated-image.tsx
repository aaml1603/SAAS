"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface AnimatedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  wrapperClassName?: string
  showSkeleton?: boolean
  aspectRatio?: string
}

export function AnimatedImage({
  alt,
  src,
  width,
  height,
  className,
  wrapperClassName,
  showSkeleton = true,
  aspectRatio,
  ...props
}: AnimatedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div
      className={cn("relative overflow-hidden", aspectRatio && `aspect-[${aspectRatio}]`, wrapperClassName)}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    >
      {showSkeleton && isLoading && (
        <Skeleton className={cn("absolute inset-0 z-10 animate-pulse bg-muted/60", className)} />
      )}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", className)}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  )
}

