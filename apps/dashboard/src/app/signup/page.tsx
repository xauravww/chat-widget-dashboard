'use client'; // This page requires client-side interaction (state, form handling)

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Check if response is not OK (e.g., 400, 409, 500)
      if (!response.ok) {
        let errorMsg = 'Failed to create account.'; // Default error
        try {
          // Attempt to parse the error message from the API response
          const data = await response.json();
          // Use the specific error from the API if available
          errorMsg = data.error || `Server responded with status: ${response.status}`;
        } catch (e) {
          // If parsing fails, use the status text or the default message
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      // On successful signup, redirect to sign-in page
      router.push('/signin?signup=success');

    } catch (error: any) {
      console.error("Signup error:", error);
      // Set the specific error message caught from the fetch response or generic error
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Create Admin Account</h1>
          <p className="text-gray-300 text-sm">Enter details to register.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create a password"
            />
          </div>
           <div>
            <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4">
                Sign in
            </Link>
        </p>
      </div>
    </div>
  );
} 