"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useInView } from "framer-motion"

export function useScrollAnimation(ref: React.RefObject<HTMLElement>) {
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated])

  return { isInView, hasAnimated }
}

