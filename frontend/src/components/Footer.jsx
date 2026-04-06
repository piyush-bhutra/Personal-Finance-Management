import React from "react";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

const Footer = () => {
  const navLinks = [
    { label: "Features", to: "/features" },
    { label: "About", to: "/about" },
    { label: "Support", to: "/support" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1180px] px-4 pb-8 pt-12 sm:px-6">
        {/* Top row */}
        <div className="mb-7 flex flex-col gap-6 border-b border-border/60 pb-8 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/35 border border-primary/40">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-serif text-lg text-foreground tracking-tight">
              FinanceFlow
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-7 gap-y-3">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Legal */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors no-underline"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row — copyright */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-xs text-muted-foreground m-0">
            © {new Date().getFullYear()} FinanceFlow, Inc. All rights reserved.
          </p>
          <p className="font-sans text-xs text-muted-foreground/80 m-0">
            Built for clarity. Designed for trust.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
