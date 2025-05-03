import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ITEMS_PER_PAGE = 10; // Number of conversations per page

// GET handler for App Router
export async function GET(req: NextRequest) {
  try {
    // Get page number from search parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const filter = searchParams.get('filter') || ''; // Get filter query param
    const limitParam = searchParams.get('limit'); // Get optional limit param
    
    const itemsToTake = limitParam ? parseInt(limitParam) : ITEMS_PER_PAGE;
    const skip = limitParam ? 0 : (page - 1) * ITEMS_PER_PAGE; // Skip only applies if not using limit

    // Prisma where clause for filtering
    const whereClause = filter 
      ? { 
          sessionId: { 
            contains: filter, // Case-insensitive search for sessionId
            mode: 'insensitive' as const // Ensure Prisma knows the mode
          } 
        }
      : {};

    // Fetch total count based on filter
    const totalConversations = await db.conversation.count({ where: whereClause });

    // Fetch conversations with filter and limit/take
    const conversations = await db.conversation.findMany({
      where: whereClause, 
      skip: skip,
      take: itemsToTake, // Use limit or ITEMS_PER_PAGE
      orderBy: {
        updatedAt: 'desc', // Show most recent conversations first
      },
      // Optionally include related data like message count
      // include: {
      //   _count: {
      //     select: { messages: true },
      //   },
      // }
    });

    const totalPages = limitParam ? 1 : Math.ceil(totalConversations / ITEMS_PER_PAGE);

    // Return different structure if limit is used (no pagination needed)
    if (limitParam) {
        return NextResponse.json({ conversations });
    }

    // Original response structure with pagination
    return NextResponse.json({
      conversations,
      pagination: {
        currentPage: page,
        totalPages,
        totalConversations,
        itemsPerPage: ITEMS_PER_PAGE, // Stick to original ITEMS_PER_PAGE for pagination context
      },
    });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    // Use NextResponse for error responses in App Router
    return NextResponse.json(
      { error: "Failed to fetch conversations" }, 
      { status: 500 }
    );
  }
}

// We might need a POST handler here later if the dashboard allows
// admins to initiate or modify conversations, but not required by spec yet. 