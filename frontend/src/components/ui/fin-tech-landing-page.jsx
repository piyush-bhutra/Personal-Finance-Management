import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import {
    PieChart,
    TrendingUp,
    Wallet,
    ShieldCheck,
    FileText,
    Bell,
    ArrowRight,
    ArrowUpRight,
    Users,
    CheckCircle2,
    BarChart3,
} from "lucide-react";

/* ─── Scroll-reveal hook ─────────────────────────────────────────── */
function useReveal() {
    useEffect(() => {
        const els = document.querySelectorAll(".ff-reveal");
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) {
            els.forEach((el) => el.classList.add("visible"));
            return;
        }

        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("visible");
                        obs.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, []);
}

/* ─── Mini dashboard mockup ──────────────────────────────────────── */
function DashboardMockup() {
    const bars = [42, 65, 55, 80, 60, 90, 72];
    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

    return (
        <div className="ff-mockup-ring p-6 w-full max-w-md mx-auto">
            {/* Top row */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Net Worth
                    </p>
                    <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.75rem", color: "hsl(var(--foreground))", lineHeight: 1.1, marginTop: "0.2rem" }}>
                        ₹4,82,360
                    </p>
                </div>
                <div style={{
                    background: "hsl(var(--accent) / 0.22)",
                    border: "1px solid hsl(var(--accent) / 0.35)",
                    borderRadius: "6px",
                    padding: "0.3rem 0.65rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                }}>
                    <TrendingUp size={13} color="hsl(var(--accent))" />
                    <span style={{ color: "hsl(var(--accent))", fontSize: "0.78rem", fontWeight: 600 }}>+23.4%</span>
                </div>
            </div>

            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.45rem", height: "90px" }}>
                {bars.map((h, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                        <div
                            style={{
                                width: "100%",
                                height: `${h}%`,
                                background: i === 5
                                    ? "hsl(var(--accent))"
                                    : "hsl(var(--primary) / 0.22)",
                                borderRadius: "4px 4px 0 0",
                                transformOrigin: "bottom",
                                animation: `ff-bar-grow 0.6s ${i * 0.07}s ease-out both`,
                            }}
                        />
                        <span style={{ fontSize: "0.6rem", color: "hsl(var(--primary))", fontFamily: "'DM Sans', sans-serif" }}>{months[i]}</span>
                    </div>
                ))}
            </div>

            {/* Bottom stats row */}
            <div style={{ display: "flex", gap: "0", marginTop: "1.25rem", borderTop: "1px solid hsl(var(--primary) / 0.22)", paddingTop: "1rem" }}>
                {[
                    { label: "Expenses", value: "₹38,240", color: "hsl(var(--primary))" },
                    { label: "Savings", value: "₹22,800", color: "hsl(var(--accent))" },
                    { label: "Invested", value: "₹1,20,000", color: "hsl(var(--primary))" },
                ].map((s, i) => (
                    <div key={i} style={{
                        flex: 1,
                        paddingRight: i < 2 ? "1rem" : 0,
                        paddingLeft: i > 0 ? "1rem" : 0,
                        borderRight: i < 2 ? "1px solid hsl(var(--primary) / 0.22)" : "none"
                    }}>
                        <p style={{ fontSize: "0.68rem", color: "hsl(var(--primary))", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.2rem" }}>{s.label}</p>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: s.color, fontFamily: "'DM Sans', sans-serif" }}>{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Feature card ───────────────────────────────────────────────── */
function FeatureCard({ icon, title, description }) {
    return (
        <div className="ff-card ff-reveal">
            <div className="ff-icon-wrap mb-4">{icon}</div>
            <h3 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.15rem",
                color: "hsl(var(--foreground))",
                marginBottom: "0.6rem",
                lineHeight: 1.25
            }}>{title}</h3>
            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                color: "hsl(var(--primary))",
                lineHeight: 1.7
            }}>{description}</p>
        </div>
    );
}

/* ─── Stat item ──────────────────────────────────────────────────── */
function StatItem({ value, label, icon }) {
    return (
        <div className="ff-reveal ff-stat-block" style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flex: 1,
            padding: "1.5rem 2rem",
        }}>
            <div className="ff-icon-wrap" style={{ width: "2.75rem", height: "2.75rem" }}>{icon}</div>
            <div>
                <div style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: "1.65rem",
                    color: "hsl(var(--foreground))",
                    lineHeight: 1.1,
                    marginBottom: "0.2rem"
                }}>{value}</div>
                <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.78rem",
                    color: "hsl(var(--primary))"
                }}>{label}</div>
            </div>
        </div>
    );
}

/* ─── Step item ──────────────────────────────────────────────────── */
function StepItem({ number, title, description }) {
    return (
        <div className="ff-reveal" style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
        }}>
            <div className="ff-step-number">{number}</div>
            <h3 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.15rem",
                color: "hsl(var(--foreground))",
                lineHeight: 1.25
            }}>{title}</h3>
            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                color: "hsl(var(--primary))",
                lineHeight: 1.7
            }}>{description}</p>
        </div>
    );
}

/* ─── Testimonial card ───────────────────────────────────────────── */
function TestimonialCard({ quote, name, role, initial }) {
    return (
        <div className="ff-testimonial ff-reveal">
            {/* Quote mark */}
            <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "3rem",
                color: "hsl(var(--primary) / 0.45)",
                lineHeight: 1,
                marginBottom: "0.5rem",
                marginTop: "-0.5rem"
            }}>"</div>
            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.9rem",
                color: "hsl(var(--foreground))",
                lineHeight: 1.75,
                marginBottom: "1.25rem",
                fontStyle: "italic"
            }}>{quote}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "50%",
                    background: "hsl(var(--primary) / 0.18)",
                    border: "1px solid hsl(var(--primary) / 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "hsl(var(--primary))",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    fontFamily: "'DM Sans', sans-serif"
                }}>{initial}</div>
                <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "hsl(var(--foreground))" }}>{name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "hsl(var(--primary))" }}>{role}</div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main landing page ──────────────────────────────────────────── */
export default function FinanceFlowLandingPage() {
    useReveal();

    return (
        <div style={{ minHeight: "100vh", background: "hsl(var(--background))", color: "hsl(var(--foreground))", overflowX: "hidden" }}>



            {/* ══ HERO ════════════════════════════════════════════════════ */}
            <section style={{ padding: "6rem 1.5rem 5rem" }}>
                <div style={{
                    maxWidth: "1180px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4rem",
                    alignItems: "center",
                }}
                    className="hero-grid"
                >
                    {/* Left */}
                    <div style={{ animation: "ff-fade-up 0.6s ease both" }}>
                        <div className="ff-label" style={{ marginBottom: "1.25rem" }}>
                            Personal Finance, Simplified
                        </div>
                        <h1 style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "clamp(2.6rem, 5vw, 3.75rem)",
                            color: "hsl(var(--foreground))",
                            lineHeight: 1.08,
                            letterSpacing: "-0.02em",
                            marginBottom: "1.5rem",
                        }}>
                            Clarity over<br />
                            your finances,<br />
                            <span style={{ color: "hsl(var(--primary))" }}>every day.</span>
                        </h1>
                        <p style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "1.05rem",
                            color: "hsl(var(--primary))",
                            lineHeight: 1.75,
                            maxWidth: "420px",
                            marginBottom: "2.25rem",
                        }}>
                            Track spending, manage investments, and build wealth — all from one calm, focused dashboard built for everyday people.
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                            <Link to="/register" className="ff-btn-accent" id="hero-get-started-btn" style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}>
                                Get Started — Free <ArrowUpRight size={16} />
                            </Link>
                            <Link to="/about" className="ff-btn-ghost" style={{ padding: "0.75rem 1.35rem", fontSize: "0.95rem" }}>
                                Learn more
                            </Link>
                        </div>
                        <p style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.78rem",
                            color: "hsl(var(--primary))",
                            marginTop: "1.25rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                        }}>
                            <ShieldCheck size={13} color="hsl(var(--accent))" /> No credit card required. Bank-grade encryption.
                        </p>
                    </div>

                    {/* Right — dashboard mockup */}
                    <div style={{
                        animation: "ff-fade-up 0.7s 0.15s ease both",
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        <DashboardMockup />
                    </div>
                </div>
            </section>

            {/* ══ STATS STRIP ════════════════════════════════════════════ */}
            <section style={{
                borderTop: "1px solid rgba(129,166,198,0.22)",
                borderBottom: "1px solid rgba(129,166,198,0.22)",
                background: "hsl(var(--secondary) / 0.6)",
            }}>
                <div style={{
                    maxWidth: "1180px",
                    margin: "0 auto",
                    padding: "0 1.5rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0,
                    position: "relative",
                }}>
                    {/* Vertical dividers between stats */}
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: "25%", width: "1px", background: "hsl(var(--primary) / 0.22)" }} className="hidden md:block" />
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: "1px", background: "hsl(var(--primary) / 0.22)" }} className="hidden md:block" />
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: "75%", width: "1px", background: "hsl(var(--primary) / 0.22)" }} className="hidden md:block" />

                    <StatItem value="10,000+" label="Active users managing budgets" icon={<Users size={16} />} />
                    <StatItem value="₹2.4Cr+" label="Total savings tracked" icon={<Wallet size={16} />} />
                    <StatItem value="23%" label="Average savings growth reported" icon={<TrendingUp size={16} />} />
                    <StatItem value="99.9%" label="Platform uptime guarantee" icon={<ShieldCheck size={16} />} />
                </div>
            </section>

            {/* ══ FEATURES ════════════════════════════════════════════════ */}
            <section style={{ padding: "6rem 1.5rem" }}>
                <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                    <div className="ff-reveal" style={{ maxWidth: "560px", marginBottom: "3.5rem" }}>
                        <div className="ff-label" style={{ marginBottom: "0.85rem" }}>What you get</div>
                        <h2 style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                            color: "hsl(var(--foreground))",
                            lineHeight: 1.12,
                            marginBottom: "1rem",
                        }}>
                            Everything you need to manage your money
                        </h2>
                        <p style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.95rem",
                            color: "hsl(var(--primary))",
                            lineHeight: 1.75
                        }}>
                            Built around how real people actually think about money — not how banks do.
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "1.25rem",
                    }} className="features-grid">
                        <FeatureCard
                            icon={<PieChart size={17} />}
                            title="Expense Tracking"
                            description="Categorize daily spending automatically and see exactly where every rupee goes — weekly, monthly, or by category."
                        />
                        <FeatureCard
                            icon={<Wallet size={17} />}
                            title="Smart Budgeting"
                            description="Set realistic budgets per category and receive clear warnings before you overspend — no surprises at month end."
                        />
                        <FeatureCard
                            icon={<TrendingUp size={17} />}
                            title="Investment Management"
                            description="Track one-time and recurring investments. Monitor active positions and visualize realized returns over time."
                        />
                        <FeatureCard
                            icon={<BarChart3 size={17} />}
                            title="Net Worth Overview"
                            description="Watch your net worth evolve as expenses, investments, and returns shift. One clear number. Always current."
                        />
                        <FeatureCard
                            icon={<FileText size={17} />}
                            title="Reports & Exports"
                            description="Generate detailed PDF and CSV reports for tax season, personal reviews, or sharing with a financial advisor."
                        />
                        <FeatureCard
                            icon={<ShieldCheck size={17} />}
                            title="Bank-Grade Security"
                            description="Your data is encrypted end-to-end. We never store banking credentials and comply with the highest security standards."
                        />
                    </div>
                </div>
            </section>

            {/* ══ HOW IT WORKS ════════════════════════════════════════════ */}
            <section style={{
                padding: "6rem 1.5rem",
                background: "hsl(var(--secondary) / 0.45)",
                borderTop: "1px solid rgba(129,166,198,0.22)",
                borderBottom: "1px solid rgba(129,166,198,0.22)",
            }}>
                <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                    <div className="ff-reveal" style={{ textAlign: "center", marginBottom: "4rem" }}>
                        <div className="ff-label" style={{ marginBottom: "0.85rem" }}>How it works</div>
                        <h2 style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "clamp(2rem, 3.5vw, 2.65rem)",
                            color: "hsl(var(--foreground))",
                            lineHeight: 1.12,
                        }}>
                            Up and running in minutes
                        </h2>
                    </div>

                    <div style={{
                        display: "flex",
                        gap: "3rem",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                    }}>
                        {/* Connector line between steps (decorative) */}
                        <StepItem
                            number="01"
                            title="Create your account"
                            description="Sign up in under a minute. No credit card, no bank login required — just your email and a password."
                        />
                        <div style={{
                            height: "1px",
                            flex: "0 0 3rem",
                            background: "hsl(var(--primary) / 0.2)",
                            marginTop: "1.1rem",
                            alignSelf: "flex-start"
                        }} className="hidden md:block" />
                        <StepItem
                            number="02"
                            title="Log your transactions"
                            description="Add expenses, income, and investments manually or import them. Categorize and annotate with ease."
                        />
                        <div style={{
                            height: "1px",
                            flex: "0 0 3rem",
                            background: "hsl(var(--primary) / 0.2)",
                            marginTop: "1.1rem",
                            alignSelf: "flex-start"
                        }} className="hidden md:block" />
                        <StepItem
                            number="03"
                            title="See the full picture"
                            description="Your dashboard updates in real time — track net worth, savings rate, and spending patterns across every period."
                        />
                    </div>
                </div>
            </section>

            {/* ══ TESTIMONIALS ════════════════════════════════════════════ */}
            <section style={{ padding: "6rem 1.5rem" }}>
                <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
                    <div className="ff-reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                        <div className="ff-label" style={{ marginBottom: "0.85rem" }}>From our users</div>
                        <h2 style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "clamp(2rem, 3.5vw, 2.65rem)",
                            color: "hsl(var(--foreground))",
                            lineHeight: 1.12,
                        }}>
                            Trusted by people who take money seriously
                        </h2>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "1.25rem",
                    }} className="testimonials-grid">
                        <TestimonialCard
                            quote="Finally a finance app that doesn't overwhelm you. The dashboard is clean and I actually check it every day now."
                            name="Priya Mehta"
                            role="Freelance Designer, Mumbai"
                            initial="P"
                        />
                        <TestimonialCard
                            quote="I've tried every budgeting app out there. FinanceFlow is the only one that made my savings habits stick — the reports are brilliant."
                            name="Arjun Sharma"
                            role="Software Engineer, Bengaluru"
                            initial="A"
                        />
                        <TestimonialCard
                            quote="The investment tracking is exactly what I was looking for. Simple, no clutter, and the net worth view is genuinely motivating."
                            name="Kavya Nair"
                            role="Product Manager, Hyderabad"
                            initial="K"
                        />
                    </div>
                </div>
            </section>

            {/* ══ CTA BANNER ══════════════════════════════════════════════ */}
            <section className="ff-cta-banner ff-reveal" style={{ padding: "6rem 1.5rem" }}>
                <div style={{
                    maxWidth: "720px",
                    margin: "0 auto",
                    textAlign: "center",
                }}>
                    <div className="ff-label" style={{ marginBottom: "1.25rem" }}>Start today</div>
                    <h2 style={{
                        fontFamily: "'DM Serif Display', Georgia, serif",
                        fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
                        color: "hsl(var(--foreground))",
                        lineHeight: 1.1,
                        marginBottom: "1.25rem",
                        letterSpacing: "-0.02em",
                    }}>
                        Take control of your financial future
                    </h2>
                    <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "1rem",
                        color: "hsl(var(--primary))",
                        lineHeight: 1.75,
                        marginBottom: "2.25rem",
                        maxWidth: "460px",
                        margin: "0 auto 2.25rem",
                    }}>
                        Join over 10,000 users who use FinanceFlow to build clarity, reduce anxiety around money, and grow consistently.
                    </p>
                    <Link
                        to="/register"
                        id="cta-banner-btn"
                        className="ff-btn-accent"
                        style={{ padding: "0.85rem 2.25rem", fontSize: "1rem", fontWeight: 500, display: "inline-flex" }}
                    >
                        Create Free Account <ArrowRight size={17} style={{ marginLeft: "0.35rem" }} />
                    </Link>
                    <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.78rem",
                        color: "hsl(var(--primary))",
                        marginTop: "1.1rem",
                    }}>
                        No credit card required
                    </p>
                </div>
            </section>

            {/* Responsive grid fix via style tag */}
            <style>{`
                @media (max-width: 768px) {
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                        gap: 2.5rem !important;
                    }
                    .features-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .testimonials-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .ff-stat-block {
                        flex: 0 0 50%;
                    }
                }
                @media (max-width: 480px) {
                    .ff-stat-block {
                        flex: 0 0 100%;
                    }
                }
            `}</style>
        </div>
    );
}

