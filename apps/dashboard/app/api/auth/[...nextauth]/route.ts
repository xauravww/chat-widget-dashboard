import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db"; // Import Prisma client
import bcrypt from 'bcryptjs'; // Import bcryptjs

// Basic authentication configuration
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log("--- Authorize Attempt ---");
        if (!credentials?.username || !credentials?.password) {
          console.log("Authorize: Missing credentials");
          return null;
        }
        console.log(`Authorize: Attempting for user: ${credentials.username}`);

        try {
          // Find user in the database
          const user = await db.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user) {
            console.log(`Authorize: User not found: ${credentials.username}`);
            return null; // User not found
          }
          console.log(`Authorize: User found: ${user.username}, checking password...`);

          // Compare hashed password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            console.log(`Authorize: Invalid password for user: ${credentials.username}`);
            return null; // Password doesn't match
          }

          console.log(`Authorize: Credentials VALID for user: ${user.username}`);
          // Return user object (without password hash) if valid
          return {
             id: user.id,
             name: user.username, // Use username as name for now
             // email: user.email, // Add email if you store it
          };

        } catch (error) {
            console.error("Authorize: Error during authorization:", error);
            return null; // Return null on database or bcrypt errors
        }
      }
    })
  ],
  // Optional: Configure session strategy (jwt is default)
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // Use the secret from .env
  
  // Add pages configuration
  pages: {
    signIn: '/signin', // Use our custom signin page component at /signin
    // error: '/auth/error', // Optional: Custom error page
  },
  
  // Add callbacks to include user ID in the session token and session object
  callbacks: {
    async jwt({ token, user }) {
      // Add user id to the JWT token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id to the session object
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};

// Export the handler for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 