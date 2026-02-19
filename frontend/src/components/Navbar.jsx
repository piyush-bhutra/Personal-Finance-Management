import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react'; // Example logo icon

const Navbar = () => {
    return (
        <nav className="navbar container">
            <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={24} color="var(--accent-secondary)" />
                FinanceFlow
            </Link>
            <div className="nav-links">
                <Link to="/features" className="nav-link">Features</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Log In</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Get Started</Link>
            </div>
        </nav>
    );
};

export default Navbar;
