import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
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
        dateOfBirth: '',
        occupation: '',
    });
    const { name, email, confirmEmail, password, confirmPassword, investmentExperience, dateOfBirth, occupation } = formData;
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const onChange = (e) => {
        setError('');
        setFieldErrors((prev) => ({ ...prev, [e.target.id]: '' }));
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    };

    const validatePassword = (value) => {
        // At least 8 chars, 1 upper, 1 lower, 1 number, 1 special
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        return pattern.test(value);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const newFieldErrors = {};

        if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
            newFieldErrors.confirmEmail = 'Email and Confirm Email must match.';
        }
        if (password !== confirmPassword) {
            newFieldErrors.confirmPassword = 'Password and Confirm Password must match.';
        }
        if (!validatePassword(password)) {
            newFieldErrors.password =
                'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            setError('Please fix the highlighted fields.');
            return;
        }

        setLoading(true);
        try {
            const userData = {
                name,
                email,
                password,
                investmentExperience,
                dateOfBirth: dateOfBirth || undefined,
                occupation: occupation || undefined,
            };
            await authService.register(userData);
            navigate('/home');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
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
                                {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmEmail">Confirm Email</Label>
                                <Input id="confirmEmail" type="email" placeholder="m@example.com" value={confirmEmail} onChange={onChange} required />
                                {fieldErrors.confirmEmail && <p className="text-xs text-red-500">{fieldErrors.confirmEmail}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={onChange}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                                </p>
                                {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={onChange}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldErrors.confirmPassword && <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dateOfBirth">Date of Birth (optional)</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="occupation">Role / Occupation (optional)</Label>
                                <Input
                                    id="occupation"
                                    value={occupation}
                                    onChange={onChange}
                                    placeholder="e.g. Software Engineer"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="investmentExperience">Financial Experience (optional)</Label>
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
