import { NextResponse } from "next/server"

// Discord webhook URLs for different feedback types
const WEBHOOK_URLS: Record<string, string> = {
  feature: process.env.DISCORD_FEATURE_WEBHOOK_URL || "",
  improvement: process.env.DISCORD_IMPROVEMENT_WEBHOOK_URL || "",
  bug: process.env.DISCORD_BUG_WEBHOOK_URL || "",
}

// Colors for different feedback types (in decimal format for Discord)
const EMBED_COLORS: Record<string, number> = {
  feature: 5763719, // Green
  improvement: 3447003, // Blue
  bug: 15548997, // Red
}

// Icons for different feedback types
const TYPE_ICONS: Record<string, string> = {
  feature: "🚀",
  improvement: "💡",
  bug: "🐛",
}

export async function POST(request: Request) {
  try {
    console.log("Received webhook request")

    // Parse the request body
    const data = await request.json()
    console.log("Request data:", data)

    const { feedbackType, feedbackText, user, feedbackId } = data

    if (!feedbackType || !feedbackText || !user) {
      console.error("Missing required fields:", { feedbackType, feedbackText, user })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the appropriate webhook URL based on feedback type
    const webhookUrl = WEBHOOK_URLS[feedbackType]
    if (!webhookUrl) {
      console.error("Invalid feedback type:", feedbackType)
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 })
    }

    // Format the current date
    const currentDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Create the Discord embed
    const embed = {
      title: `${TYPE_ICONS[feedbackType]} New ${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} Feedback`,
      color: EMBED_COLORS[feedbackType],
      description: feedbackText,
      fields: [
        {
          name: "Submitted By",
          value: user.email || "Anonymous User",
          inline: true,
        },
        {
          name: "User ID",
          value: user.id || "Unknown",
          inline: true,
        },
        {
          name: "Submitted At",
          value: currentDate,
          inline: true,
        },
      ],
      footer: {
        text: "OptionsTracker Feedback System",
      },
    }

    // Add feedback ID if available
    if (feedbackId) {
      embed.fields.push({
        name: "Feedback ID",
        value: feedbackId,
        inline: false,
      })
    }

    const webhookBody = {
      embeds: [embed],
    }

    console.log("Sending Discord webhook to:", webhookUrl)
    console.log("Sending webhook payload")

    // Send the webhook to Discord
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Discord webhook error:", errorText, "Status:", response.status)
      return NextResponse.json(
        {
          error: "Failed to send webhook",
          details: errorText,
          status: response.status,
        },
        { status: 500 },
      )
    }

    console.log("Discord webhook sent successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending Discord webhook:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

