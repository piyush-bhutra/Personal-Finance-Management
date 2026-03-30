import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, LogOut, Menu, User, ChevronDown, X } from "lucide-react";

const Navbar = ({ variant = "public" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
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
    setMobileOpen(false);
    setDropdownOpen(false);
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
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(243,227,208,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(129,166,198,0.28)",
        }}
      >
        <div
          className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-4 sm:px-6"
        >
          {/* ── Logo ── */}
          <Link
            to={variant === "auth" ? "/home" : "/"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "6px",
                background: "rgba(170,205,220,0.35)",
                border: "1px solid rgba(129,166,198,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChart3 size={15} color="rgb(129,166,198)" />
            </div>
            <span
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "1.2rem",
                color: "rgb(83,74,64)",
                letterSpacing: "-0.01em",
              }}
            >
              FinanceFlow
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
            }}
            className="hidden md:flex"
          >
            {links.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.875rem",
                  color: isActiveRoute(to)
                    ? "rgb(129,166,198)"
                    : "rgb(83,74,64)",
                  textDecoration: "none",
                  fontWeight: isActiveRoute(to) ? 600 : 400,
                  transition: "color 0.2s",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Desktop Right Actions ── */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            className="hidden md:flex"
          >
            {variant === "auth" ? (
              <div style={{ position: "relative" }} ref={dropdownRef}>
                {/* Account dropdown trigger */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  aria-label="Open account options"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "rgba(243,227,208,0.6)",
                    border: "1px solid rgba(129,166,198,0.35)",
                    borderRadius: "6px",
                    color: "rgb(83,74,64)",
                    padding: "0.45rem 0.85rem",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.875rem",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(170,205,220,0.35)";
                    e.currentTarget.style.borderColor =
                      "rgba(129,166,198,0.55)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(243,227,208,0.6)";
                    e.currentTarget.style.borderColor =
                      "rgba(129,166,198,0.35)";
                  }}
                  id="account-menu-btn"
                >
                  <User size={14} />
                  Account
                  <ChevronDown size={13} style={{ opacity: 0.5 }} />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    role="menu"
                    aria-label="Account menu"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "180px",
                      background: "rgb(243,227,208)",
                      border: "1px solid rgba(129,166,198,0.35)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0 16px 40px rgba(129,166,198,0.2)",
                      animation: "ff-fade-up 0.18s ease",
                    }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.7rem 1rem",
                        color: "rgb(83,74,64)",
                        textDecoration: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(170,205,220,0.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <User size={14} color="rgb(129,166,198)" />
                      View Profile
                    </Link>
                    <div
                      style={{
                        height: "1px",
                        background: "rgba(129,166,198,0.25)",
                        margin: "0 0.5rem",
                      }}
                    />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      role="menuitem"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.7rem 1rem",
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        color: "rgb(83,74,64)",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem",
                        textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(170,205,220,0.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      id="logout-btn"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  id="navbar-login-btn"
                  aria-label="Log in"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.875rem",
                    color: "rgb(83,74,64)",
                    textDecoration: "none",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(129,166,198,0.3)",
                    transition:
                      "color 0.2s, background 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "rgb(83,74,64)";
                    e.currentTarget.style.background = "rgba(170,205,220,0.18)";
                    e.currentTarget.style.borderColor =
                      "rgba(129,166,198,0.55)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgb(83,74,64)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "rgba(129,166,198,0.3)";
                  }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  id="navbar-get-started-btn"
                  aria-label="Get started"
                  style={{
                    background: "rgb(129,166,198)",
                    color: "rgb(243,227,208)",
                    borderRadius: "6px",
                    padding: "0.5rem 1.1rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgb(170,205,220)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(129,166,198,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgb(129,166,198)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu-panel"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            style={{
              background: "rgba(243,227,208,0.65)",
              border: "1px solid rgba(129,166,198,0.35)",
              borderRadius: "6px",
              padding: "0.4rem",
              cursor: "pointer",
              color: "rgb(83,74,64)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            id="mobile-menu-btn"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div
            id="mobile-menu-panel"
            style={{
              background: "rgb(243,227,208)",
              borderTop: "1px solid rgba(129,166,198,0.28)",
              padding: "1rem 1rem 1.5rem",
              animation: "ff-fade-up 0.18s ease",
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {links.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.95rem",
                    color: "rgb(83,74,64)",
                    textDecoration: "none",
                    padding: "0.8rem 0.25rem",
                    borderBottom: "1px solid rgba(129,166,198,0.18)",
                    transition: "color 0.2s",
                    display: "block",
                    fontWeight: isActiveRoute(to) ? 600 : 400,
                    background: isActiveRoute(to)
                      ? "rgba(170,205,220,0.2)"
                      : "transparent",
                    borderRadius: "6px",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div
              style={{
                marginTop: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              {variant === "auth" ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.65rem 1rem",
                      background: "rgba(170,205,220,0.2)",
                      border: "1px solid rgba(129,166,198,0.3)",
                      borderRadius: "6px",
                      color: "rgb(83,74,64)",
                      textDecoration: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.875rem",
                    }}
                  >
                    <User size={15} /> View Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.65rem 1rem",
                      background: "rgba(170,205,220,0.2)",
                      border: "1px solid rgba(129,166,198,0.35)",
                      borderRadius: "6px",
                      color: "rgb(83,74,64)",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.875rem",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.65rem 1rem",
                      background: "rgba(170,205,220,0.2)",
                      border: "1px solid rgba(129,166,198,0.35)",
                      borderRadius: "6px",
                      color: "rgb(83,74,64)",
                      textDecoration: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.875rem",
                      textAlign: "center",
                    }}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.65rem 1rem",
                      background: "rgb(129,166,198)",
                      borderRadius: "6px",
                      color: "rgb(243,227,208)",
                      textDecoration: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      textAlign: "center",
                    }}
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
