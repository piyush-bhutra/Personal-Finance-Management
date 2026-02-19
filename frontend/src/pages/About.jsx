import Navbar from '../components/Navbar';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />

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
