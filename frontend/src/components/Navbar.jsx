import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ThemeToggle } from './ui/theme-toggle';

const Navbar = ({ variant = 'public' }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const NavLink = ({ to, children, onClick }) => (
        <Link
            to={to}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClick}
        >
            {children}
        </Link>
    );

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
                            <NavLink to="/home">Dashboard</NavLink>
                            <NavLink to="/expenses">Expenses</NavLink>
                            <NavLink to="/investments">Investments</NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/">Features</NavLink>
                            <NavLink to="/about">About</NavLink>
                            <NavLink to="/support">Support</NavLink>
                        </>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    {variant === 'auth' ? (
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
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
                                            <NavLink to="/home" onClick={() => setIsOpen(false)}>Dashboard</NavLink>
                                            <NavLink to="/expenses" onClick={() => setIsOpen(false)}>Expenses</NavLink>
                                            <NavLink to="/investments" onClick={() => setIsOpen(false)}>Investments</NavLink>
                                            <Button variant="outline" onClick={handleLogout} className="justify-start gap-2 mt-4">
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink to="/" onClick={() => setIsOpen(false)}>Features</NavLink>
                                            <NavLink to="/about" onClick={() => setIsOpen(false)}>About</NavLink>
                                            <NavLink to="/support" onClick={() => setIsOpen(false)}>Support</NavLink>
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
