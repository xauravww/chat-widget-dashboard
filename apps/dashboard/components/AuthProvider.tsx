'use client'; // Provider component needs to be a client component

import { SessionProvider } from "next-auth/react";
import React from "react";

// Simpler definition, relying on inference for children type
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    // We don't need to pass the session prop here in App Router 
    // as NextAuth handles it automatically with server-side context.
    return <SessionProvider>{children}</SessionProvider>;
} 