"use client"

import type React from "react"

import { motion } from "framer-motion"

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  once?: boolean
  as?: React.ElementType
}

export function AnimatedText({
  text,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  as: Component = "div",
}: AnimatedTextProps) {
  const words = text.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <Component className={className}>
      <motion.div
        style={{ display: "flex", flexWrap: "wrap" }}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once }}
      >
        {words.map((word, index) => (
          <motion.span variants={child} key={index} style={{ marginRight: "0.25em" }}>
            {word}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  )
}

