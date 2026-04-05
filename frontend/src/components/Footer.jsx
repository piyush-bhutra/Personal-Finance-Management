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
    <footer className="border-t border-[rgba(129,166,198,0.28)] bg-[rgb(243,227,208)]">
      <div className="mx-auto max-w-[1180px] px-4 pb-8 pt-12 sm:px-6">
        {/* Top row */}
        <div className="mb-7 flex flex-col gap-6 border-b border-[rgba(129,166,198,0.24)] pb-8 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "1.85rem",
                height: "1.85rem",
                borderRadius: "5px",
                background: "rgba(170,205,220,0.35)",
                border: "1px solid rgba(129,166,198,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChart3 size={13} color="rgb(129,166,198)" />
            </div>
            <span
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.1rem",
                color: "rgb(83,74,64)",
              }}
            >
              FinanceFlow
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "1.75rem" }}>
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: "rgb(83,74,64)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "rgb(83,74,64)")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgb(83,74,64)")
                }
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
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  color: "rgb(83,74,64)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row — copyright */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              color: "rgb(83,74,64)",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} FinanceFlow, Inc. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              color: "rgba(83,74,64,0.75)",
              margin: 0,
            }}
          >
            Built for clarity. Designed for trust.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
