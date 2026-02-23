import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { motion as Motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar variant="auth" />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <Motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="space-y-2">
                        <h1 className="text-6xl font-black text-primary tracking-tight">404</h1>
                        <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
                        <p className="text-muted-foreground">
                            We couldn't find the page you're looking for. It might have been moved or removed.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} /> Go Back
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2"
                        >
                            <Home size={16} /> Return Home
                        </Button>
                    </div>
                </Motion.div>
            </div>
        </div>
    );
}
