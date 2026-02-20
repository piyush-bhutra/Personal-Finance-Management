import React from "react";
import { motion as Motion } from "framer-motion";
import { ShieldCheck, ArrowUpRight, CheckCircle2, PieChart, TrendingUp, Wallet, Users } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { MagicCard } from "./magic-card";
import { useTheme } from "@/context/ThemeContext";

/** FinanceFlow Landing Page */

const Stat = ({ label, value }) => (
    <div className="space-y-1">
        <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
    </div>
);

const SoftButton = ({ children, className = "", ...props }) => (
    <button
        className={
            "rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 " +
            "focus:ring-primary " +
            className
        }
        {...props}
    >
        {children}
    </button>
);

function MiniBars() {
    return (
        <div className="mt-6 flex h-36 items-end gap-4 rounded-xl bg-gradient-to-b from-secondary/50 to-background p-4 border border-border">
            {[18, 48, 72, 96].map((h, i) => (
                <Motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0.6 }}
                    animate={{ height: h }}
                    transition={{ delay: 0.5 + i * 0.15, type: "spring" }}
                    className="w-10 rounded-xl bg-chart-2 opacity-80 shadow-sm"
                />
            ))}
        </div>
    );
}

function Planet() {
    return (
        <Motion.svg
            initial={{ rotate: -8 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 2, type: "spring" }}
            width="220"
            height="220"
            viewBox="0 0 220 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" />
                </linearGradient>
            </defs>
            <circle cx="110" cy="110" r="56" fill="url(#grad)" opacity="0.95" />
            <circle cx="94" cy="98" r="10" fill="white" opacity="0.45" />
            <circle cx="132" cy="126" r="8" fill="white" opacity="0.35" />
            <Motion.ellipse
                cx="110" cy="110" rx="100" ry="34" stroke="white" strokeOpacity="0.6" fill="none"
                animate={{ strokeDashoffset: [200, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} strokeDasharray="200 200"
            />
            <Motion.circle cx="210" cy="110" r="4" fill="white" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.2, repeat: Infinity }} />
        </Motion.svg>
    );
}

const FeatureItem = ({ icon, title, description }) => (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

export default function MoneyflowLandingPage() {
    const { isDark } = useTheme();
    const magicColor = isDark ? "#2d2d2d" : "#D9D9D955";
    return (
        <div className="min-h-screen w-full bg-background text-foreground font-sans">

            {/* Top nav */}
            <nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-6 md:px-0 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow">
                        <PieChart className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-foreground">FinanceFlow</span>
                </div>
                <div className="hidden items-center gap-8 md:flex">
                    {['Features', 'About', 'Support'].map((item) => (
                        <a key={item} href={`/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">{item}</a>
                    ))}
                </div>
                <div className="hidden gap-3 md:flex items-center">
                    <ThemeToggle />
                    <a href="/login" className="rounded-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors inline-block text-center pt-2.5 font-medium">Login</a>
                    <SoftButton onClick={() => window.location.href = '/register'} className="bg-primary text-primary-foreground hover:opacity-90">Sign Up</SoftButton>
                </div>
            </nav>

            {/* Hero area */}
            <div className="relative z-10 mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-12 px-4 pb-14 pt-10 md:grid-cols-2 md:px-0">
                {/* Left: headline */}
                <div className="flex flex-col justify-center space-y-8 pr-2">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-foreground">
                            Master your money
                            <br />
                            with clarity.
                        </h1>
                        <p className="mt-6 max-w-md text-lg text-muted-foreground">
                            Track expenses, manage investments, and review net worth using your recorded transactions.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <SoftButton onClick={() => window.location.href = '/register'} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-base">
                            Get Started <ArrowUpRight className="ml-1 inline h-5 w-5" />
                        </SoftButton>
                    </div>
                </div>

                {/* Right: concise capabilities */}
                {/* Right-side hero cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

  {/* Card 1 â€” Expense Tracking */}
  <Motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.5 }}
  >
    <MagicCard
      className="h-full p-6 shadow-sm border-border"
      gradientColor={magicColor}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Expense Tracking
      </span>
      <p className="mt-3 text-sm text-foreground leading-relaxed">
        Capture daily spending, group it by category, and clearly see where your
        money actually goes.
      </p>
    </MagicCard>
  </Motion.div>

  {/* Card 2 â€” Investment Management */}
  <Motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15, duration: 0.5 }}
  >
    <MagicCard
      className="h-full p-6 shadow-sm border-border"
      gradientColor={magicColor}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Investment Management
      </span>
      <p className="mt-3 text-sm text-foreground leading-relaxed">
        Manage one-time and recurring investments, with a clear view of whatâ€™s
        active and whatâ€™s already closed.
      </p>
    </MagicCard>
  </Motion.div>

  {/* Card 3 â€” Net Worth Overview */}
  <Motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.5 }}
  >
    <MagicCard
      className="h-full p-6 shadow-sm border-border"
      gradientColor={magicColor}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Net Worth Overview
      </span>
      <p className="mt-3 text-sm text-foreground leading-relaxed">
        Watch your net worth evolve as expenses, active investments, and
        realized returns change over time.
      </p>
    </MagicCard>
  </Motion.div>

  {/* Card 4 â€” History & Insights */}
  <Motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25, duration: 0.5 }}
  >
    <MagicCard
      className="h-full p-6 shadow-sm border-border"
      gradientColor={magicColor}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        History & Insights
      </span>
      <p className="mt-3 text-sm text-foreground leading-relaxed">
        Look back at past transactions and portfolio allocation to understand
        long-term patterns, not just todayâ€™s numbers.
      </p>
    </MagicCard>
  </Motion.div>

</div>
            </div>

            {/* Depth: Features Section */}
            <section className="py-24 bg-muted/30 border-t border-border/50">
                <div className="mx-auto max-w-[1180px] px-4 md:px-0">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Everything you need to grow wealth</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            We provide the tools you need to take control of your financial future, all in one place.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureItem
                            icon={<PieChart className="w-6 h-6 text-primary" />}
                            title="Expense Tracking"
                            description="Automatically categorize your spending to see exactly where your money goes each month."
                        />
                        <FeatureItem
                            icon={<Wallet className="w-6 h-6 text-primary" />}
                            title="Smart Budgeting"
                            description="Set realistic budgets for different categories and get notified when you're close to limits."
                        />
                        <FeatureItem
                            icon={<TrendingUp className="w-6 h-6 text-primary" />}
                            title="Goal Setting"
                            description="Create savings goals for vacations, emergencies, or large purchases and track your progress."
                        />
                        <FeatureItem
                            icon={<ShieldCheck className="w-6 h-6 text-primary" />}
                            title="Bank-Grade Security"
                            description="Your data is encrypted and secure. We never store your banking credentials."
                        />
                        <FeatureItem
                            icon={<Users className="w-6 h-6 text-primary" />}
                            title="Family Sharing"
                            description="Manage household finances together. Share budgets and track expenses with your partner."
                        />
                        <FeatureItem
                            icon={<CheckCircle2 className="w-6 h-6 text-primary" />}
                            title="Export & Reports"
                            description="Generate detailed PDF and CSV reports for tax season or personal analysis."
                        />
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-24">
                <div className="mx-auto max-w-[900px] px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">Ready to take control?</h2>
                    <p className="text-lg text-muted-foreground mb-8">Build a clear view of your finances with expenses, investments, and reports in one place.</p>
                    <SoftButton onClick={() => window.location.href = '/register'} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-base">
                        Create Free Account
                    </SoftButton>
                </div>
            </section>

        </div>
    );
}


