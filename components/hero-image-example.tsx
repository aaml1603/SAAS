"use client"

import { AnimatedImage } from "@/components/ui/animated-image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HeroImageExample() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Hero Image with Loading Animation</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <AnimatedImage
          alt="HeroUI hero Image with delay"
          height={200}
          src="https://app.requestly.io/delay/5000/https://heroui.com/images/hero-card-complete.jpeg"
          width={300}
          showSkeleton={true}
        />
      </CardContent>
    </Card>
  )
}

