import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { PieChart } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Simple Nav */}
            <nav className="w-full max-w-[1180px] mx-auto px-4 py-6 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow">
                        <PieChart className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-foreground">FinanceFlow</span>
                </a>
            </nav>

            <div className="flex-1 flex items-center justify-center px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>Enter your email below to login to your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full">Sign in</Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <a href="/register" className="underline hover:text-primary">
                                Sign up
                            </a>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
