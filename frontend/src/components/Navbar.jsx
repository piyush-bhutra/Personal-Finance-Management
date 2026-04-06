import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, LogOut, Menu, User, ChevronDown, X } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";
import { motion } from "framer-motion";
import authService from "../features/auth/authService";

const MotionLink = motion(Link);

const Navbar = ({ variant = "public" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOpen(false);
      setDropdownOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("ff-no-scroll", mobileOpen);
    return () => document.body.classList.remove("ff-no-scroll");
  }, [mobileOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const publicLinks = [
    { label: "Features", to: "/features" },
    { label: "About", to: "/about" },
    { label: "Support", to: "/support" },
  ];

  const authLinks = [
    { label: "Dashboard", to: "/home" },
    { label: "Expenses", to: "/expenses" },
    { label: "Investments", to: "/investments" },
    { label: "Analytics", to: "/analytics" },
  ];

  const links = variant === "auth" ? authLinks : publicLinks;
  const isActiveRoute = (to) => location.pathname === to;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-4 sm:px-6">
          {/* ── Logo ── */}
          <MotionLink
            to={variant === "auth" ? "/home" : "/"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 shrink-0 no-underline"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/35 border border-primary/50">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-serif text-xl text-foreground tracking-tight">
              FinanceFlow
            </span>
          </MotionLink>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ label, to }) => (
              <MotionLink
                key={label}
                to={to}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`font-sans text-sm transition-colors hover:text-primary ${isActiveRoute(to)
                  ? "text-primary font-semibold"
                  : "text-foreground font-normal"
                  }`}
              >
                {label}
              </MotionLink>
            ))}
          </div>

          {/* ── Desktop Right Actions ── */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {variant === "auth" ? (
              <div className="relative" ref={dropdownRef}>
                {/* Account dropdown trigger */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  aria-label="Open account options"
                  id="account-menu-btn"
                  className="flex items-center gap-2 px-3 py-2 rounded-md font-sans text-sm bg-background/60 text-foreground border border-primary/30 transition-colors hover:bg-accent/35 hover:border-primary/50"
                >
                  <User className="h-3.5 w-3.5" />
                  Account
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </motion.button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    role="menu"
                    aria-label="Account menu"
                    className="absolute right-0 top-[calc(100%+8px)] w-48 bg-background border border-primary/30 rounded-xl overflow-hidden shadow-2xl animate-accordion-down"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-3 font-sans text-sm text-foreground hover:bg-accent/20 transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-primary" />
                      View Profile
                    </Link>
                    <div className="h-px bg-primary/20 mx-2" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      role="menuitem"
                      id="logout-btn"
                      className="flex w-full items-center gap-2 px-4 py-3 text-left font-sans text-sm text-foreground hover:bg-accent/20 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <MotionLink
                  to="/login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  id="navbar-login-btn"
                  aria-label="Log in"
                  className="font-sans text-sm font-medium text-foreground px-4 py-2 rounded-md border border-primary/30 transition-colors hover:bg-accent/20 hover:border-primary/50"
                >
                  Log In
                </MotionLink>
                <MotionLink
                  to="/register"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  id="navbar-get-started-btn"
                  aria-label="Get started"
                  className="font-sans text-sm font-medium bg-primary text-primary-foreground px-5 py-2 rounded-md transition-all shadow-sm hover:bg-primary/90 hover:shadow-md"
                >
                  Get Started
                </MotionLink>
              </>
            )}
          </div>

          {/* ── Mobile Actions ── */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="flex items-center justify-center p-2 rounded-md bg-background/60 border border-primary/30 text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu-panel"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              id="mobile-menu-btn"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div
            id="mobile-menu-panel"
            className="bg-background border-t border-border px-4 pt-4 pb-6 animate-accordion-down max-h-[calc(100vh-64px)] overflow-y-auto"
          >
            <div className="flex flex-col">
              {links.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`font-sans text-base block px-3 py-3 border-b border-primary/20 transition-colors rounded-md ${isActiveRoute(to)
                    ? "bg-accent/20 text-foreground font-semibold"
                    : "text-foreground font-normal"
                    }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {variant === "auth" ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent/20 border border-primary/30 text-foreground font-sans text-sm"
                  >
                    <User className="h-4 w-4" /> View Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent/20 border border-primary/30 text-foreground font-sans text-sm text-left w-full"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-2.5 rounded-md bg-accent/20 border border-primary/30 text-foreground font-sans text-sm text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-sans text-sm font-medium text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
