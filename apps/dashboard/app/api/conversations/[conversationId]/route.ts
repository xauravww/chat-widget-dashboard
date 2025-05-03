import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// DELETE handler for deleting a specific conversation
export async function DELETE(
  req: NextRequest, 
  { params }: { params: { conversationId: string } }
) {
  try {
    const conversationId = params.conversationId;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" }, 
        { status: 400 }
      );
    }

    console.log(`Attempting to delete conversation with ID: ${conversationId}`);

    // Check if conversation exists (optional but good practice)
    const conversationExists = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversationExists) {
      return NextResponse.json(
        { error: "Conversation not found" }, 
        { status: 404 }
      );
    }

    // Delete the conversation (Prisma will cascade delete related messages)
    await db.conversation.delete({
      where: { id: conversationId },
    });

    console.log(`Successfully deleted conversation with ID: ${conversationId}`);
    // Return a success response with no content
    return new NextResponse(null, { status: 204 }); 

  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET handler if you need to fetch a single conversation later
// export async function GET(...) { ... } 