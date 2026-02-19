import React from 'react';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Zap, Shield, Smile } from 'lucide-react';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />
            <main className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Features</h1>
                    <p className="text-xl text-muted-foreground">Everything you need to manage your finances.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <Zap className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Fast & Secure</CardTitle>
                        </CardHeader>
                        <CardContent>
                            Lighting fast transactions and bank-grade security for your peace of mind.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Shield className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Data Protection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            Your data is encrypted and stored securely. We never sell your information.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Smile className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>User Friendly</CardTitle>
                        </CardHeader>
                        <CardContent>
                            Intuitive design that makes managing money a breeze, not a chore.
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
