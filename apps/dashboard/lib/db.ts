import { PrismaClient } from '@/src/generated/prisma' // Ensure import uses the alias to the generated path

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = 
  globalThis.prisma ||
  new PrismaClient({
    // Optional: Add logging based on environment
    // log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db; 