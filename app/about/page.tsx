"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Layout from "@/components/options-tracker/layout"
import { Toaster } from "@/components/ui/toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TrendingUp, Users, Lightbulb, LineChart, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="dark">
      <SidebarProvider>
        <Layout>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h1 className="text-2xl font-bold text-white">About OptionsTracker</h1>
            </div>

            <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23] mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 mb-4">
                OptionsTracker was created by options traders for options traders. Our mission is to provide a powerful
                yet intuitive platform that helps traders track, analyze, and improve their options trading performance.
              </p>
              <p className="text-gray-300 mb-4">
                We believe that proper trade tracking and performance analysis are essential for consistent
                profitability in options trading. By providing these tools for free during our beta phase, we aim to
                gather valuable feedback from real traders to build the most effective platform possible.
              </p>
              <p className="text-gray-300">
                Your feedback and suggestions are crucial to our development process. We're committed to building
                features that address the real needs of options traders.
              </p>
            </div>

            <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23] mb-6">
              <h2 className="text-xl font-bold text-white mb-6">Current Development Phase</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-green-900/30 text-green-400 h-fit">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Beta Testing & Community Building</h3>
                    <p className="text-gray-300">
                      We're currently in beta, focusing on gathering user feedback and building a community of options
                      traders. All features are free during this phase as we refine the platform based on your input.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400 h-fit">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Feature Development</h3>
                    <p className="text-gray-300">
                      Our development roadmap is shaped by user feedback. We're actively implementing new features and
                      improvements based on what our community tells us they need most.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-purple-900/30 text-purple-400 h-fit">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Future Plans</h3>
                    <p className="text-gray-300">
                      In the future, we plan to introduce premium features while maintaining a robust free tier. Our
                      goal is to ensure OptionsTracker remains accessible while offering advanced tools for serious
                      traders.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23] mb-6">
              <h2 className="text-xl font-bold text-white mb-6">Our Commitments</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-amber-900/30 text-amber-400 h-fit">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Data Privacy</h3>
                    <p className="text-gray-300 text-sm">
                      Your trading data belongs to you. We implement strong security measures and will never sell your
                      personal information.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-green-900/30 text-green-400 h-fit">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Continuous Improvement</h3>
                    <p className="text-gray-300 text-sm">
                      We're committed to regular updates and improvements based on user feedback and emerging trading
                      needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23] text-center">
              <h2 className="text-xl font-bold text-white mb-4">Help Shape OptionsTracker</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Your feedback is essential to our development process. Share your ideas, report bugs, or suggest
                improvements to help us build the ultimate options trading platform.
              </p>
              <Link href="/feedback">
                <Button size="lg">Submit Feedback</Button>
              </Link>
            </div>
          </div>
        </Layout>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

