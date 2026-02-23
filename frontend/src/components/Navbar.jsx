import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, LogOut, Menu, User, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ThemeToggle } from './ui/theme-toggle';

const NavItem = ({ to, children, onClick }) => (
    <Link
        to={to}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClick}
    >
        {children}
    </Link>
);

const Navbar = ({ variant = 'public' }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 lg:px-8">
                <Link to={variant === 'auth' ? "/home" : "/"} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <PieChart className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">FinanceFlow</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {variant === 'auth' ? (
                        <>
                            <NavItem to="/home">Dashboard</NavItem>
                            <NavItem to="/expenses">Expenses</NavItem>
                            <NavItem to="/investments">Investments</NavItem>
                        </>
                    ) : (
                        <>
                            <NavItem to="/">Features</NavItem>
                            <NavItem to="/about">About</NavItem>
                            <NavItem to="/support">Support</NavItem>
                        </>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    {variant === 'auth' ? (
                        <div className="relative" ref={dropdownRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <User className="h-4 w-4" />
                                Account
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover ring-1 ring-border border border-border overflow-hidden origin-top-right z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="py-1">
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <User className="h-4 w-4" />
                                            View Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-accent hover:text-red-600 cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Log In</Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm" className="rounded-full px-6">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <div className="flex flex-col gap-8 mt-8">
                                <div className="flex flex-col gap-4">
                                    {variant === 'auth' ? (
                                        <>
                                            <NavItem to="/home" onClick={() => setIsOpen(false)}>Dashboard</NavItem>
                                            <NavItem to="/expenses" onClick={() => setIsOpen(false)}>Expenses</NavItem>
                                            <NavItem to="/investments" onClick={() => setIsOpen(false)}>Investments</NavItem>
                                            <div className="h-px bg-border my-2" />
                                            <NavItem to="/profile" onClick={() => setIsOpen(false)}>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    View Profile
                                                </div>
                                            </NavItem>
                                            <Button variant="outline" onClick={handleLogout} className="justify-start gap-2 mt-4 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20">
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <NavItem to="/" onClick={() => setIsOpen(false)}>Features</NavItem>
                                            <NavItem to="/about" onClick={() => setIsOpen(false)}>About</NavItem>
                                            <NavItem to="/support" onClick={() => setIsOpen(false)}>Support</NavItem>
                                            <div className="flex flex-col gap-2 mt-4">
                                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                                    <Button variant="outline" className="w-full">Log In</Button>
                                                </Link>
                                                <Link to="/register" onClick={() => setIsOpen(false)}>
                                                    <Button className="w-full">Get Started</Button>
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-sm text-muted-foreground">Theme</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
