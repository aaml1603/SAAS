"use client"

import { AnimatedImage } from "@/components/ui/animated-image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ImageGalleryExample() {
  // Array of images with intentional delay to demonstrate loading
  const images = [
    {
      src: "https://app.requestly.io/delay/2000/https://images.unsplash.com/photo-1682687220063-4742bd7fd538",
      alt: "Landscape image with 2s delay",
    },
    {
      src: "https://app.requestly.io/delay/4000/https://images.unsplash.com/photo-1682687220063-4742bd7fd538",
      alt: "Landscape image with 4s delay",
    },
    {
      src: "https://app.requestly.io/delay/6000/https://images.unsplash.com/photo-1682687220063-4742bd7fd538",
      alt: "Landscape image with 6s delay",
    },
  ]

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Image Gallery with Loading Animation</CardTitle>
        <CardDescription>Images with different loading delays to demonstrate the animation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              <AnimatedImage
                src={image.src}
                alt={image.alt}
                width={300}
                height={200}
                className="object-cover w-full h-full"
                showSkeleton={true}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

