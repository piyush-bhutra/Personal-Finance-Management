import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, BarChart3, PieChart, FileText } from "lucide-react";
import { GlowingShadow } from "@/components/ui/glowing-shadow";

export function Features8() {
  return (
    <section className="py-16 md:py-28">
      <div className="mx-auto max-w-3xl lg:max-w-5xl px-6">
        <div className="relative">
          <div className="mb-8 md:mb-12 text-center">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground">
              Features
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-foreground">
              Everything you need to manage your money
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Track expenses, manage investments, and generate reports — all in one calm, focused dashboard.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-6 gap-3">
            <GlowingCard className="col-span-full lg:col-span-2">
              <CardContent className="relative m-auto size-fit pt-6">
                <div className="relative flex h-24 w-56 items-center">
                  <svg
                    className="text-muted-foreground/30 absolute inset-0 size-full"
                    viewBox="0 0 254 104"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="mx-auto block w-fit text-5xl font-semibold">
                    360°
                  </span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-semibold">
                  Full picture
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  A unified view of expenses, investments, and net worth — so you always know where you stand.
                </p>
              </CardContent>
            </GlowingCard>

            <GlowingCard className="col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
              <CardContent className="pt-6">
                <div className="relative mx-auto flex aspect-square size-32 rounded-full border border-border before:absolute before:-inset-2 before:rounded-full before:border before:border-border/60">
                  <PieChart className="m-auto size-10 text-primary" strokeWidth={1.25} />
                </div>
                <div className="relative z-10 mt-6 space-y-2 text-center">
                  <h2 className="text-lg font-medium transition">
                    Expense tracking
                  </h2>
                  <p className="text-muted-foreground">
                    Capture one-time and recurring expenses and see where your money goes by category.
                  </p>
                </div>
              </CardContent>
            </GlowingCard>

            <GlowingCard className="col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
              <CardContent className="pt-6">
                <div className="pt-6 lg:px-6">
                  <div className="rounded-lg border border-border bg-secondary/20 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Investment value
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      Track growth
                    </p>
                  </div>
                </div>
                <div className="relative z-10 mt-14 space-y-2 text-center">
                  <h2 className="text-lg font-medium transition">
                    Investments
                  </h2>
                  <p className="text-muted-foreground">
                    Monitor active plans, realized exits, and performance trends over time.
                  </p>
                </div>
              </CardContent>
            </GlowingCard>

            <GlowingCard className="col-span-full overflow-hidden lg:col-span-3">
              <CardContent className="grid pt-6 sm:grid-cols-2">
                <div className="relative z-10 flex flex-col justify-between space-y-10">
                  <div className="relative flex aspect-square size-12 rounded-full border border-border before:absolute before:-inset-2 before:rounded-full before:border before:border-border/60">
                    <BarChart3 className="m-auto size-5 text-primary" strokeWidth={1.25} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-medium transition">
                      Analytics & trends
                    </h2>
                    <p className="text-muted-foreground">
                      Clear charts for spending, allocation, and performance — built for everyday decisions.
                    </p>
                  </div>
                </div>
                <div className="rounded-tl-[var(--radius)] relative -mb-6 -mr-6 mt-6 h-fit border-l border-t border-border p-6 py-6 sm:ml-6">
                  <div className="absolute left-3 top-2 flex gap-1">
                    <span className="block size-2 rounded-full border border-border bg-background/60"></span>
                    <span className="block size-2 rounded-full border border-border bg-background/60"></span>
                    <span className="block size-2 rounded-full border border-border bg-background/60"></span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-2 w-full rounded bg-muted/40" />
                    <div className="h-2 w-[85%] rounded bg-muted/40" />
                    <div className="h-2 w-[70%] rounded bg-muted/40" />
                  </div>
                </div>
              </CardContent>
            </GlowingCard>

            <GlowingCard className="col-span-full overflow-hidden lg:col-span-3">
              <CardContent className="grid h-full pt-6 sm:grid-cols-2">
                <div className="relative z-10 flex flex-col justify-between space-y-10">
                  <div className="relative flex aspect-square size-12 rounded-full border border-border before:absolute before:-inset-2 before:rounded-full before:border before:border-border/60">
                    <FileText className="m-auto size-6 text-primary" strokeWidth={1.25} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-medium transition">
                      Reports
                    </h2>
                    <p className="text-muted-foreground">
                      Generate period-based summaries and export-ready views for reviews and planning.
                    </p>
                  </div>
                </div>
                <div className="relative mt-6 border-l border-border/60 sm:-my-6 sm:-mr-6">
                  <div className="relative flex h-full flex-col justify-center space-y-4 py-6 px-6">
                    <div className="rounded-lg border border-border bg-secondary/20 p-4">
                      <p className="text-xs text-muted-foreground">Selected month</p>
                      <p className="mt-1 text-lg font-semibold">₹38,240</p>
                      <p className="text-xs text-muted-foreground">Total expenses</p>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/20 p-4">
                      <p className="text-xs text-muted-foreground">Realized returns</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-500">₹22,800</p>
                      <p className="text-xs text-muted-foreground">Net savings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlowingCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function GlowingCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <GlowingShadow contentClassName="h-full">
      <Card className={`relative flex h-full overflow-hidden ${className || ""}`}>
        {children}
      </Card>
    </GlowingShadow>
  );
}

