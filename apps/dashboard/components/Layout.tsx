'use client';

import React from 'react';
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard,
  MessageSquare,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

// Sidebar Navigation Items
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  // Add other future links here
  // { href: "/users", label: "Users", icon: Users }, 
];

// Remove React.FC for broader compatibility, especially with RSC/React 19 changes
const DashboardLayout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar - Updated Styling */}
      <aside className="hidden w-64 flex-col border-r border-gray-700 bg-gray-900 text-white sm:flex fixed h-full">
        <div className="flex h-[60px] items-center border-b border-gray-700 px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            {/* <Package2 className="h-6 w-6 text-primary" /> Replace with your logo if desired */}
            <span>Admin Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <ul className="grid items-start px-4 text-sm font-medium">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    pathname === href
                      ? "bg-gray-700 text-white" // Active link style
                      : "text-gray-300 hover:bg-gray-800 hover:text-white" // Inactive link style
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col sm:ml-64">
        {/* Header - Updated Styling & User Menu */}
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 border-b border-gray-700 bg-gray-900 px-6 text-white shadow-sm">
          {/* Can add a mobile nav toggle here if needed */}
          <div className="flex-1">
              {/* Placeholder for potential search or actions */}
          </div>
          
          {/* User Session Dropdown */}
          {status === "authenticated" && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Avatar className="h-8 w-8">
                      {/* Placeholder for user image if available */}
                      {/* <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} /> */}
                      <AvatarFallback className="bg-gray-700 text-white">
                          <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name ?? "Admin"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Add other items like Settings here later */}
                  {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : status === "loading" ? (
              // Optional: Loading state for session
              <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse"></div>
          ) : (
              // Optional: Display Login button if not authenticated
              <Link href="/api/auth/signin">
                 <Button variant="outline" size="sm" className="text-gray-900">Login</Button> 
              </Link>
          )}
        </header>

        {/* Page Content - Added explicit background */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 