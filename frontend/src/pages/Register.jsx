import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import authService from '../features/auth/authService';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: '',
        investmentExperience: 'beginner',
    });
    const { name, email, confirmEmail, password, confirmPassword, investmentExperience } = formData;
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
        if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
            setError('Emails do not match.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const userData = {
                name,
                email,
                password,
                investmentExperience,
            };
            await authService.register(userData);
            navigate('/home');
        } catch (error) {
            console.error(error);
            setError('Registration failed. Please try again.');
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
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>Enter your details below to create your account.</CardDescription>
                    </CardHeader>
                    <form onSubmit={onSubmit}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="John Doe" value={name} onChange={onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmEmail">Confirm Email</Label>
                                <Input id="confirmEmail" type="email" placeholder="m@example.com" value={confirmEmail} onChange={onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={onChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="investmentExperience">Investment Experience</Label>
                                <select
                                    id="investmentExperience"
                                    value={investmentExperience}
                                    onChange={onChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <a href="/login" className="underline hover:text-primary">
                                    Login
                                </a>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
