import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-[1180px] mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">Contact Support</h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Have a question or need help? Fill out the form and our team will get back to you within 24 hours.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-foreground">Email Us</div>
                                <div className="text-muted-foreground">support@financeflow.com</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-foreground">Call Us</div>
                                <div className="text-muted-foreground">+1 (555) 000-0000</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your name" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your@email.com" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <textarea
                                id="message"
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                                placeholder="How can we help?"
                            ></textarea>
                        </div>
                        <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                </div>
            </main>
        </div>
    );
}
