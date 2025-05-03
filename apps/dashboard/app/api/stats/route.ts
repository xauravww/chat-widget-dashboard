import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total conversations
    const totalConversations = await db.conversation.count();

    // Get total messages to calculate average
    const totalMessages = await db.message.count();
    const averageMessages = totalConversations > 0
      ? Math.round(totalMessages / totalConversations)
      : 0;

    // For active connections, we'll use the total conversations updated in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeConnections = await db.conversation.count({
      where: {
        updatedAt: {
          gte: fiveMinutesAgo
        }
      }
    });

    return NextResponse.json({
      totalConversations,
      activeConnections,
      averageMessages
    });

  } catch (error) {
    console.error("[API_STATS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}