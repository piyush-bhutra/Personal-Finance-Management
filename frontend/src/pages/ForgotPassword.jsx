import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Navbar from "../components/Navbar";
import authService from "../features/auth/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setDevResetUrl("");

    try {
      const response = await authService.forgotPassword({ email });
      setSuccessMessage(
        response.message ||
          "If an account exists for this email, reset instructions were generated.",
      );
      if (response.resetUrl) {
        setDevResetUrl(response.resetUrl);
      }
    } catch (apiError) {
      const msg =
        apiError.response?.data?.message ||
        "Could not process request right now. Please try again.";
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
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your account email to generate a secure password reset link.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-primary">{error}</p>}
              {successMessage && (
                <p className="text-sm text-accent">{successMessage}</p>
              )}

              {devResetUrl && (
                <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-xs text-muted-foreground">
                  <p className="mb-1 font-medium text-primary">Dev Reset Link</p>
                  <a
                    href={devResetUrl}
                    className="break-all underline hover:text-primary"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Generating link..." : "Generate Reset Link"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link to="/login" className="underline hover:text-primary">
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
