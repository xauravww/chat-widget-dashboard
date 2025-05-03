'use client';

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from "next-auth/react";
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

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/'; // Default redirect to dashboard
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get error message from query params (if redirected from failed sign-in)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
        // Map NextAuth error codes to user-friendly messages
        switch (errorParam) {
            case 'CredentialsSignin':
                setError('Invalid username or password.');
                break;
            default:
                setError('An error occurred during sign in.');
        }
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually based on result
        username,
        password,
        callbackUrl: callbackUrl, 
      });

      if (result?.error) {
        setError("Invalid username or password."); // Provide specific error message
        setIsLoading(false);
      } else if (result?.ok) {
        // Successful sign in
        router.push(callbackUrl); // Redirect to intended page or dashboard
      } else {
        setError("An unknown error occurred during sign in.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    // Full screen container with dark background gradient
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white">
      
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
          <p className="text-gray-300 text-sm">Please sign in to access your dashboard.</p>
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
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
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        
        {/* Added Sign Up link */}
        <p className="mt-4 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4">
                Sign up
            </Link>
        </p>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninForm />
    </Suspense>
  );
}