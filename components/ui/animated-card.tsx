"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverScale?: number
  delay?: number
}

export function AnimatedCard({ children, className, hoverScale = 1.02, delay = 0, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ scale: hoverScale }}
      className={cn(
        "bg-[#1A1A1E] rounded-xl p-6 border border-[#2B2B30] transition-colors duration-300 hover:border-green-500/50",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

