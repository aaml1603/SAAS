"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, LineChart, BarChart3, Calendar, TrendingUp, Shield, FileText, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-white overflow-hidden">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F12] via-[#0A0A0D] to-[#0A0A0D] z-0" />

        {/* Animated background grid */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2px, transparent 0)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="relative z-20 container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
            </motion.div>
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl font-bold"
            >
              OptionsTracker
            </motion.span>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            <motion.a
              href="#features"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </motion.a>
            <motion.a
              href="#testimonials"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Testimonials
            </motion.a>
            <motion.a
              href="#pricing"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </motion.a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-gray-800 dark:text-white">
                  Log in
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Link href="/signup">
                <Button size="sm" className="bg-green-500 hover:bg-green-600">
                  Sign up
                </Button>
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn(
            "fixed inset-0 z-10 bg-[#0A0A0D]/90 backdrop-blur-sm md:hidden transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-8 p-4">
            <a href="#features" className="text-xl font-medium text-white" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#testimonials" className="text-xl font-medium text-white" onClick={() => setMobileMenuOpen(false)}>
              Testimonials
            </a>
            <a href="#pricing" className="text-xl font-medium text-white" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </a>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-gray-800 dark:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-green-500 hover:bg-green-600">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-16 sm:pb-24 md:pt-24 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300"
            >
              Track Your Options Trades Like a Pro
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0"
            >
              Analyze performance, visualize profits, and make data-driven decisions with our powerful options trading
              dashboard.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 w-full">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-gray-800 dark:text-white">
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10 container mx-auto px-4 sm:px-6 -mb-16 sm:-mb-24 md:-mb-32"
        >
          <div className="rounded-xl overflow-hidden shadow-2xl border border-[#1F1F23] relative">
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0D]/80 to-transparent z-10" />

            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8YvzFeZDqama7CMW1gyxHjVbtEz89Q.png"
              alt="OptionsTracker Dashboard"
              width={1200}
              height={675}
              className="w-full h-auto"
              priority
            />
          </div>
        </motion.div>
      </header>

      {/* Features Section */}
      <section id="features" className="pt-24 sm:pt-32 md:pt-48 pb-16 sm:pb-24 bg-[#0F0F12]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Powerful Features for Options Traders</h2>
            <p className="text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
              Everything you need to track, analyze, and improve your options trading performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#1A1A1E] rounded-xl p-5 sm:p-6 border border-[#2B2B30] hover:border-green-500/50 transition-colors"
              >
                <div className="p-2 sm:p-3 bg-[#2B2B30] rounded-lg w-fit mb-4">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24 bg-[#0A0A0D]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Trusted by Options Traders</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">See what our users are saying about OptionsTracker.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#1A1A1E] rounded-xl p-5 sm:p-6 border border-[#2B2B30]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">{testimonial.title}</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-300 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-[#0F0F12]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Free During Development</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              All features are currently free while we're in development. We're focused on building the best platform
              based on your feedback.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "bg-[#1A1A1E] rounded-xl p-5 sm:p-6 border relative",
                  plan.popular ? "border-green-500 md:scale-105 z-10" : "border-[#2B2B30]",
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{plan.title}</h3>
                <div className="mb-4">
                  <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-400"> during beta</span>
                </div>
                <p className="text-sm sm:text-base text-gray-300 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block mt-auto">
                  <Button
                    className={cn(
                      "w-full",
                      plan.popular
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-[#2B2B30] hover:bg-[#3F3F46] text-white",
                    )}
                  >
                    Try Now
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-[#0A0A0D] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2px, transparent 0)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#1A1A1E] to-[#2B2B30] rounded-2xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto border border-[#3F3F46]"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Ready to Level Up Your Options Trading?
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Join thousands of traders who are making data-driven decisions with OptionsTracker.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 w-full">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-gray-800 dark:text-white">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0F0F12] border-t border-[#1F1F23]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <span className="text-lg font-bold">OptionsTracker</span>
              </div>
              <p className="text-gray-400 text-sm">Track, analyze, and improve your options trading performance.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white text-sm">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1F1F23] mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} OptionsTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Data
const features = [
  {
    title: "Performance Analytics",
    description: "Track your win rate, profit/loss, and other key metrics to understand your trading performance.",
    icon: BarChart3,
  },
  {
    title: "Trading Calendar",
    description: "Visualize your trading activity and results on a calendar view to identify patterns.",
    icon: Calendar,
  },
  {
    title: "P&L Visualization",
    description: "See your profit and loss over time with beautiful, interactive charts.",
    icon: LineChart,
  },
  {
    title: "Trade Journal",
    description: "Log your trades with detailed notes and screenshots to learn from past decisions.",
    icon: FileText,
  },
  {
    title: "Real-time Updates",
    description: "Get instant updates when you add or modify trades, with data that syncs across devices.",
    icon: TrendingUp,
  },
  {
    title: "Secure & Private",
    description: "Your trading data is encrypted and securely stored, accessible only to you.",
    icon: Shield,
  },
]

const testimonials = [
  {
    name: "Alex Thompson",
    title: "Options Day Trader",
    avatar: "/placeholder.svg?height=48&width=48",
    quote:
      "OptionsTracker has completely transformed how I analyze my trades. The performance metrics helped me identify and fix patterns that were costing me money.",
  },
  {
    name: "Sarah Chen",
    title: "Swing Trader",
    avatar: "/placeholder.svg?height=48&width=48",
    quote:
      "The trading calendar is my favorite feature. Being able to see my P&L by day has helped me optimize my trading schedule for better results.",
  },
  {
    name: "Michael Rodriguez",
    title: "Options Strategist",
    avatar: "/placeholder.svg?height=48&width=48",
    quote:
      "I've tried several trading journals, but OptionsTracker is by far the most intuitive and comprehensive. It's now an essential part of my trading routine.",
  },
]

const pricingPlans = [
  {
    title: "Basic",
    price: "Free",
    description: "Perfect for beginners and casual traders.",
    features: ["Up to 50 trades per month", "Basic performance metrics", "7-day trade history", "Email support"],
    popular: false,
  },
  {
    title: "Pro",
    price: "Free",
    description: "For active traders who want deeper insights.",
    features: ["Unlimited trades", "Advanced analytics", "Full trade history", "Trading calendar", "Priority support"],
    popular: true,
  },
  {
    title: "Enterprise",
    price: "Free",
    description: "For professional traders and small firms.",
    features: [
      "Everything in Pro",
      "Multiple portfolios",
      "API access",
      "Custom reporting",
      "Dedicated support",
      "Team collaboration",
    ],
    popular: false,
  },
]

