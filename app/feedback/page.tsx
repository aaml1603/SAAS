"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Layout from "@/components/options-tracker/layout"
import { Toaster } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MessageSquare, Send, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function FeedbackPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [feedbackType, setFeedbackType] = useState<"feature" | "bug" | "improvement">("feature")
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    router.push("/login")
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Update the handleSubmit function with better error handling

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!feedbackText.trim()) {
      toast({
        title: "Please enter your feedback",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the feedback data object
      const feedbackData = {
        user_id: user?.id,
        feedback_type: feedbackType,
        feedback_text: feedbackText,
        status: "new",
        created_at: new Date().toISOString(),
      }

      console.log("Submitting feedback:", feedbackData)

      // Store feedback in Supabase
      const { data, error: supabaseError } = await supabase.from("feedback").insert(feedbackData).select()

      if (supabaseError) {
        console.error("Supabase error:", supabaseError)
        throw new Error(`Supabase error: ${supabaseError.message}`)
      }

      console.log("Feedback saved to database:", data)

      // Get the feedback ID
      const feedbackId = data?.[0]?.id

      // Send webhook to Discord
      try {
        console.log("Sending webhook to Discord")
        const webhookResponse = await fetch("/api/feedback-webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedbackType,
            feedbackText,
            user: {
              id: user?.id,
              email: user?.email,
            },
            feedbackId,
          }),
        })

        if (!webhookResponse.ok) {
          const webhookError = await webhookResponse.json()
          console.warn("Discord webhook warning:", webhookError)
          // Continue even if webhook has an error
        } else {
          console.log("Discord webhook sent successfully")
        }
      } catch (webhookError) {
        console.warn("Error sending webhook:", webhookError)
        // Continue even if webhook fails
      }

      // Show success message
      toast({
        title: "Feedback submitted successfully",
        description: "Thank you for helping us improve OptionsTracker!",
        variant: "success",
      })

      // Reset form and show thank you message
      setFeedbackText("")
      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error submitting feedback",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setFeedbackType("feature")
    setFeedbackText("")
  }

  return (
    <div className="dark">
      <SidebarProvider>
        <Layout>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Feedback & Suggestions</h1>

            {submitted ? (
              <div className="bg-[#0F0F12] rounded-xl p-8 border border-[#1F1F23] text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-900/30 rounded-full">
                    <ThumbsUp className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Thank You for Your Feedback!</h2>
                <p className="text-gray-400 mb-6">
                  Your input is invaluable as we work to improve OptionsTracker. We review all feedback and use it to
                  prioritize our development roadmap.
                </p>
                <Button onClick={resetForm}>Submit Another Idea</Button>
              </div>
            ) : (
              <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23]">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Share Your Ideas</h2>
                </div>

                <p className="text-gray-400 mb-6">
                  We're building OptionsTracker based on trader feedback. Your suggestions help us prioritize features
                  that matter most to you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Feedback Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFeedbackType("feature")}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          feedbackType === "feature"
                            ? "bg-green-900/50 text-green-400 border border-green-500/50"
                            : "bg-[#1F1F23] text-gray-300 border border-[#2B2B30]"
                        }`}
                      >
                        New Feature
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackType("improvement")}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          feedbackType === "improvement"
                            ? "bg-blue-900/50 text-blue-400 border border-blue-500/50"
                            : "bg-[#1F1F23] text-gray-300 border border-[#2B2B30]"
                        }`}
                      >
                        Improvement
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackType("bug")}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          feedbackType === "bug"
                            ? "bg-red-900/50 text-red-400 border border-red-500/50"
                            : "bg-[#1F1F23] text-gray-300 border border-[#2B2B30]"
                        }`}
                      >
                        Bug Report
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Feedback
                    </label>
                    <textarea
                      id="feedback"
                      rows={6}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={
                        feedbackType === "feature"
                          ? "Describe the new feature you'd like to see..."
                          : feedbackType === "improvement"
                            ? "How can we improve an existing feature?"
                            : "Please describe the issue you encountered..."
                      }
                      className="w-full px-3 py-2 bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}

            <div className="mt-6 bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23]">
              <h3 className="text-lg font-bold text-white mb-4">What Happens Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-[#1F1F23] rounded-full mt-0.5">
                    <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-500 text-[10px] font-bold">
                      1
                    </div>
                  </div>
                  <p className="text-gray-300">Our team reviews all feedback submissions</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-[#1F1F23] rounded-full mt-0.5">
                    <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-500 text-[10px] font-bold">
                      2
                    </div>
                  </div>
                  <p className="text-gray-300">Popular requests are prioritized in our development roadmap</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-[#1F1F23] rounded-full mt-0.5">
                    <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-500 text-[10px] font-bold">
                      3
                    </div>
                  </div>
                  <p className="text-gray-300">We'll notify you when features you requested are implemented</p>
                </li>
              </ul>
            </div>
          </div>
        </Layout>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

