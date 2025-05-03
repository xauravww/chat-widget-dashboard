import { getServerSession } from "next-auth/next";
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardLayout from "@/components/Layout";
import { db } from "@/lib/db";
import { Message, SenderType } from "@/generated/prisma";
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from 'lucide-react'; // Import an icon for back link

// Function to fetch a single conversation and its messages
async function getConversationDetails(id: string) {
  try {
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc', // Show messages in chronological order
          },
        },
      },
    });
    return conversation;
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return null;
  }
}

// Page component (Server Component)
export default async function ConversationViewPage({ params }: { params: { conversationId: string } }) {
  const conversationId = params.conversationId;
  const conversation = await getConversationDetails(conversationId);

  // Handle conversation not found
  if (!conversation) {
    notFound(); // Renders the not-found page
  }

  return (
    <DashboardLayout>
      <Link href="/conversations" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Conversations
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Conversation Details</CardTitle>
          <CardDescription>
            Session ID: <span className="font-medium text-foreground">{conversation.sessionId}</span>
            <br />
            Started: {format(conversation.createdAt, 'Pp')} | Last Activity: {format(conversation.updatedAt, 'Pp')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">Messages</h3>
          <div className="space-y-4">
            {conversation.messages.length === 0 ? (
              <p className="text-muted-foreground">No messages in this conversation yet.</p>
            ) : (
              conversation.messages.map((message) => (
                <div key={message.id} className="flex flex-col p-3 rounded-md border bg-card text-card-foreground shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <Badge 
                      variant={ 
                        message.sender === 'USER' ? 'default' : (message.sender === 'AI' ? 'secondary' : 'outline')
                      }
                    >
                      {message.sender}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(message.createdAt, 'Pp')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
} 