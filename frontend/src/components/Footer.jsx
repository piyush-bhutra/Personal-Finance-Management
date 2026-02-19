import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full border-t border-border bg-background">
            <div className="mx-auto w-full max-w-[1180px] px-4 py-10 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        <span className="text-lg font-semibold text-foreground">FinanceFlow</span>
                    </Link>

                    {/* Nav links */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                        <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
                        <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
                        <Link to="/support" className="hover:text-foreground transition-colors">Contact Support</Link>
                    </div>

                    {/* Legal links */}
                    <div className="flex gap-6 text-xs text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                    </div>
                </div>

                <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} FinanceFlow, Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
