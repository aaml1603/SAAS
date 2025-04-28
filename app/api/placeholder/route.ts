import { NextResponse } from "next/server"

export async function GET() {
  // This is a simple placeholder route that returns a 1x1 transparent pixel
  // In a real application, you would serve actual images
  return new NextResponse("Dashboard placeholder", {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}

