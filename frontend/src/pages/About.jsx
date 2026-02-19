import React from 'react';
import { PieChart } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background font-sans">
            <nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-6 md:px-0 border-b border-border">
                <a href="/" className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow">
                        <PieChart className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-foreground">FinanceFlow</span>
                </a>
                <div className="flex gap-4">
                    <a href="/login" className="text-sm font-medium hover:underline">Login</a>
                    <a href="/register" className="text-sm font-medium hover:underline">Sign Up</a>
                </div>
            </nav>

            <main className="mx-auto max-w-[800px] px-4 py-16">
                <h1 className="text-4xl font-bold tracking-tight mb-6">About FinanceFlow</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Our mission is to empower individuals to take control of their financial destiny through clarity, simplicity, and smart insights.
                </p>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="mb-4">
                        Founded in 2024, FinanceFlow was built on the belief that personal finance shouldn't be complicated. We saw people struggling with spreadsheets and complex banking apps, and knew there had to be a better way.
                    </p>
                    <p className="mb-4">
                        Our platform brings all your financial data into one secure, beautifully designed dashboard. Whether you want to track daily expenses, set monthly budgets, or analyze your long-term savings growth, FinanceFlow makes it effortless.
                    </p>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Why We Do It</h2>
                    <p className="mb-4">
                        Financial stress is real. We want to reduce that stress by providing a tool that gives you confidence. When you know exactly where your money is going, you can make better decisions for your future.
                    </p>
                </div>
            </main>
        </div>
    );
}
