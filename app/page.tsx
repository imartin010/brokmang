"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Users,
  PieChart as PieChartIcon,
  Sparkles,
  Target,
  BarChart3,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  Crown,
  Briefcase,
  LineChart,
  Activity,
  Award,
  Building2,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";

// Floating icon component
function FloatingIcon({ icon: Icon, delay = 0, className = "" }: { icon: any; delay?: number; className?: string }) {
    return (
        <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-20, 20, -20] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className={className}
    >
      <Icon className="h-full w-full" />
        </motion.div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  const features = [
    {
      icon: Calculator,
      title: "Break-Even Analysis",
      description: "Calculate your exact break-even point with detailed financial breakdowns and cost per seat analysis.",
      gradient: "from-blue-500 to-cyan-500",
      delay: 0.1,
    },
    {
      icon: Users,
      title: "Agent Management",
      description: "Manage your sales team, assign roles, organize teams with leaders, and track performance metrics.",
      gradient: "from-purple-500 to-pink-500",
      delay: 0.2,
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Monitor daily activities, attendance, calls, meetings, and sales with comprehensive KPI dashboards.",
      gradient: "from-green-500 to-emerald-500",
      delay: 0.3,
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description: "Beautiful charts and graphs that make your data easy to understand and act upon instantly.",
      gradient: "from-orange-500 to-red-500",
      delay: 0.4,
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and row-level access control.",
      gradient: "from-indigo-500 to-blue-500",
      delay: 0.5,
    },
    {
      icon: Zap,
      title: "Real-Time Updates",
      description: "Instant calculations and live updates across all your metrics and team performance data.",
      gradient: "from-yellow-500 to-orange-500",
      delay: 0.6,
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Set Your Parameters",
      description: "Enter your business structure, team size, costs, and commission rates.",
      icon: Briefcase,
    },
    {
      number: "02",
      title: "Analyze Results",
      description: "Get instant break-even analysis with detailed cost breakdowns and projections.",
      icon: PieChartIcon,
    },
    {
      number: "03",
      title: "Manage Your Team",
      description: "Add agents, create teams, assign leaders, and configure performance targets.",
      icon: Users,
    },
    {
      number: "04",
      title: "Track Performance",
      description: "Log daily activities and monitor KPIs with automated monthly scoring.",
      icon: Activity,
    },
  ];

  const benefits = [
    "Instant break-even calculations",
    "Team hierarchy management",
    "Automated performance scoring",
    "Beautiful visual dashboards",
    "Export reports to CSV/PDF",
    "Customizable KPI weights",
    "Multi-agent tracking",
    "Dark mode support",
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" />
        
        {/* Floating Icons Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingIcon
            icon={DollarSign}
            delay={0}
            className="absolute top-20 left-10 w-12 h-12 text-blue-500/20"
          />
          <FloatingIcon
            icon={TrendingUp}
            delay={1}
            className="absolute top-40 right-20 w-16 h-16 text-purple-500/20"
          />
          <FloatingIcon
            icon={Users}
            delay={2}
            className="absolute bottom-40 left-20 w-14 h-14 text-green-500/20"
          />
          <FloatingIcon
            icon={Target}
            delay={1.5}
            className="absolute bottom-20 right-10 w-12 h-12 text-orange-500/20"
          />
          <FloatingIcon
            icon={BarChart3}
            delay={0.5}
            className="absolute top-1/2 right-1/4 w-10 h-10 text-cyan-500/20"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8"
          >
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              The Ultimate Brokerage Management Platform
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Brokmang.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Transform your real estate business with powerful break-even analysis,
            intelligent team management, and automated performance tracking.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/auth/signup">
              <Button size="lg" className="gradient-bg group text-lg px-10 py-6">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Instant setup</span>
            </div>
          </motion.div>
      </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full p-1"
          >
            <motion.div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full mx-auto" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for real estate brokerages
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Get Started in{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                4 Simple Steps
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From setup to insights in minutes
            </p>
        </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
        <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden group hover:shadow-xl transition-all">
                  <CardContent className="p-8">
                    <div className="absolute top-0 right-0 text-9xl font-bold text-primary/5 -mt-4 -mr-4 group-hover:text-primary/10 transition-colors">
                      {step.number}
                    </div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground text-lg">{step.description}</p>
                    </div>
            </CardContent>
          </Card>
        </motion.div>
            ))}
          </div>
      </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
      <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Brokmang.?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by real estate professionals, for real estate professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200/50 dark:border-green-800/50"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Award className="h-20 w-20 text-white/90" />
              </motion.div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Brokerage?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of successful brokerages using Brokmang. to optimize
              their operations and maximize profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analyze">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 group">
                  <PieChartIcon className="mr-2 h-5 w-5" />
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/crm/sales">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <Users className="mr-2 h-5 w-5" />
                  Explore Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Brokmang.
            </h3>
            <p className="text-gray-400 mb-6">
              Real Estate Management Platform
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-400">
              <span>© 2025 Brokmang. All rights reserved.</span>
            </div>
      </motion.div>
        </div>
      </footer>
    </div>
  );
}
