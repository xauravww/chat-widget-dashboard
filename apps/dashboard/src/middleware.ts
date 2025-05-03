import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  // Allow specific API routes without auth check
  if (
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/api/socket') ||
    pathname.startsWith('/api/ai')
  ) {
    return NextResponse.next();
  }
  
  const token = await getToken({ req, secret });

  // If no token and accessing a protected route (not signin or signup)
  const isPublicPage = pathname.startsWith('/signin') || pathname.startsWith('/signup');
  if (!token && !isPublicPage) {
     // Redirect to custom sign-in page
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    console.log(`Middleware: No token, redirecting to ${signInUrl.toString()}`);
    return NextResponse.redirect(signInUrl);
  }
  
  // If token exists, or accessing a public page, allow access
  return NextResponse.next();
}

// Update matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/socket (allow socket connection without auth)
     * - api/auth (allow NextAuth API routes)
     * - signin (allow custom signin page)
     * - signup (allow custom signup page)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/socket|api/auth|signin|signup).*)',
  ],
}; 