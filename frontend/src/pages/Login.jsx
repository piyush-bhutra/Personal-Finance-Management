import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import authService from '../features/auth/authService';
import Navbar from '../components/Navbar';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { email, password } = formData;
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onChange = (e) => {
        setError('');
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const userData = {
                email,
                password,
            };
            await authService.login(userData);
            navigate('/home');
        } catch (error) {
            console.error(error);
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar variant="public" />

            <div className="flex-1 flex items-center justify-center px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>Enter your email below to login to your account.</CardDescription>
                    </CardHeader>
                    <form onSubmit={onSubmit}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={onChange} required />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <a href="/register" className="underline hover:text-primary">
                                    Sign up
                                </a>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
