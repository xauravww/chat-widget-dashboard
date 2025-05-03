import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Import our Prisma client instance

export async function GET() {
  try {
    const totalConversations = await db.conversation.count();

    // Add more analytics calculations here later (e.g., messages per convo, avg duration)
    
    return NextResponse.json({ 
        totalConversations 
        // Add other stats here
    });

  } catch (error) {
    console.error("[API_ANALYTICS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 