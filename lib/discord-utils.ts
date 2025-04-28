// Discord webhook utilities

export type FeedbackType = "feature" | "improvement" | "bug"

export interface DiscordEmbed {
  title: string
  description: string
  color: number
  fields: {
    name: string
    value: string
    inline?: boolean
  }[]
  footer?: {
    text: string
    icon_url?: string
  }
  timestamp?: string
}

export interface DiscordWebhookPayload {
  content?: string
  username?: string
  avatar_url?: string
  embeds: DiscordEmbed[]
}

// Discord webhook URLs for different feedback types
export const WEBHOOK_URLS: Record<FeedbackType, string> = {
  feature: process.env.DISCORD_FEATURE_WEBHOOK_URL || "https://discord.com/api/webhooks/your-webhook-url",
  improvement: process.env.DISCORD_IMPROVEMENT_WEBHOOK_URL || "https://discord.com/api/webhooks/your-webhook-url",
  bug: process.env.DISCORD_BUG_WEBHOOK_URL || "https://discord.com/api/webhooks/your-webhook-url",
}

// Colors for different feedback types (in decimal format for Discord)
export const EMBED_COLORS: Record<FeedbackType, number> = {
  feature: 5763719, // Green
  improvement: 3447003, // Blue
  bug: 15548997, // Red
}

// Icons for different feedback types
export const TYPE_ICONS: Record<FeedbackType, string> = {
  feature: "🚀",
  improvement: "💡",
  bug: "🐛",
}

// Format feedback for Discord webhook
export function formatFeedbackForDiscord(
  feedbackType: FeedbackType,
  feedbackText: string,
  user: { id?: string; email?: string },
  feedbackId?: string,
): DiscordWebhookPayload {
  // Format the current date
  const currentDate = new Date().toISOString()

  // Create the Discord embed
  const embed: DiscordEmbed = {
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
        name: "Feedback ID",
        value: feedbackId || "N/A",
        inline: true,
      },
    ],
    footer: {
      text: "OptionsTracker Feedback System",
    },
    timestamp: currentDate,
  }

  return {
    username: "OptionsTracker Feedback",
    embeds: [embed],
  }
}

// Send feedback to Discord webhook
export async function sendFeedbackToDiscord(
  feedbackType: FeedbackType,
  feedbackText: string,
  user: { id?: string; email?: string },
  feedbackId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the appropriate webhook URL
    const webhookUrl = WEBHOOK_URLS[feedbackType]
    if (!webhookUrl) {
      return { success: false, error: "Invalid feedback type" }
    }

    // Format the payload
    const payload = formatFeedbackForDiscord(feedbackType, feedbackText, user, feedbackId)

    // Send the webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Discord webhook error:", errorText)
      return { success: false, error: `Discord API error: ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending Discord webhook:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

