"use client";

import React from "react";
import { ArrowUpRight, BarChart3, Plus, ShieldCheck, Wallet, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const cardContents = [
  {
    title: "Expense Tracking",
    description:
      "Log everyday spending, recurring bills, and category trends without losing sight of your monthly budget.",
    icon: Wallet,
    className: "lg:col-span-3 lg:row-span-2",
  },
  {
    title: "Investment Visibility",
    description:
      "Track active positions, realized returns, and portfolio movement in one clean view built for fast decisions.",
    icon: BarChart3,
    className: "lg:col-span-2 lg:row-span-2",
  },
  {
    title: "Flexible Financial Overview",
    description:
      "See expenses, savings, and net worth in a responsive dashboard layout that stays readable across mobile, tablet, and desktop. The bento structure keeps the most important signals prominent while still giving supporting details room to breathe.",
    icon: ShieldCheck,
    className: "lg:col-span-4 lg:row-span-1",
  },
  {
    title: "Secure by Default",
    description:
      "Your finance workflow stays protected with a focused, privacy-minded product experience.",
    icon: ShieldCheck,
    className: "lg:col-span-2 lg:row-span-1",
  },
  {
    title: "Fast Daily Check-ins",
    description:
      "Open the dashboard, understand the numbers, and move on with your day in seconds.",
    icon: Zap,
    className: "lg:col-span-2 lg:row-span-1",
  },
];

type PlusCardProps = {
  className?: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

function PlusCard({
  className = "",
  title,
  description,
  icon: Icon,
}: PlusCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 p-6 shadow-[0_18px_50px_-24px_hsl(var(--primary)/0.45)] transition-all duration-300",
        "min-h-[220px] hover:-translate-y-1 hover:border-[hsl(var(--primary)/0.45)] hover:shadow-[0_28px_70px_-26px_hsl(var(--primary)/0.55)]",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[hsl(var(--primary)/0.55)] before:to-transparent",
        className
      )}
    >
      <CornerPlusIcons />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.18),transparent_40%)] opacity-80" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--background)/0.8)] text-[hsl(var(--primary))]">
            <Icon className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--background)/0.7)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
            FinanceFlow
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl leading-tight text-[hsl(var(--foreground))]">{title}</h3>
          <p className="max-w-[42rem] text-sm leading-7 text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function CornerPlusIcons() {
  return (
    <>
      <PlusIcon className="-left-3 -top-3" />
      <PlusIcon className="-right-3 -top-3" />
      <PlusIcon className="-bottom-3 -left-3" />
      <PlusIcon className="-bottom-3 -right-3" />
    </>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
        className
      )}
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
    </span>
  );
}

export default function RuixenBentoCards() {
  return (
    <section className="border-y border-[hsl(var(--border))] bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--secondary)/0.42)_100%)] py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col gap-5 lg:max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
            Features
          </p>
          <h2 className="text-4xl leading-tight text-[hsl(var(--foreground))] md:text-5xl">
            Built for clarity. Designed for momentum.
          </h2>
          <p className="max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">
            FinanceFlow keeps the feature section structured and balanced again with a responsive bento layout that highlights your strongest product benefits first.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {cardContents.map((card) => (
            <PlusCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
