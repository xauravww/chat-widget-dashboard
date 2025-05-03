import { Server as NetServer, IncomingMessage, ServerResponse } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import { db } from "@/lib/db"; // Import db (Prisma client instance)
import { SenderType } from "@/generated/prisma"; // Import the generated SenderType enum
import type { Socket as NetSocket } from 'net'; // Import NetSocket

// Define custom types for NextApiResponse with Socket.IO
interface SocketWithIO extends NetSocket {
  server: NetServer & {
    io?: ServerIO;
  };
}

interface NextApiResponseServerIO extends NextApiResponse {
  socket: SocketWithIO;
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, let Socket.IO handle it
  },
};

// Store the server instance globally to avoid creating it multiple times
// NOTE: In a serverless environment, this instance might not persist between invocations.
// Consider alternative state management (like Redis) for production scaling.
declare global {
  // eslint-disable-next-line no-var
  var io: ServerIO | undefined;
}

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // Check if the Socket.IO server has already been initialized
  if (!globalThis.io) {
    console.log("*Initializing Socket.IO server (Pages Router)*");
    // Get the underlying HTTP server instance from the response object
    const httpServer: NetServer = res.socket.server as any;
    // Create a new Socket.IO server instance
    const io = new ServerIO(httpServer, {
      path: "/api/socket", // Ensure this matches the client path
      addTrailingSlash: false,
      // Add CORS configuration
      cors: {
        origin: "*", // Allow all origins (Use with caution!)
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Store the initialized server instance globally
    globalThis.io = io;

    // --- Socket.IO Event Handlers ---
    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      const sessionId = socket.handshake.query.sessionId as string;

      if (!sessionId) {
        console.error("Connection attempt without sessionId. Disconnecting.");
        socket.disconnect(true);
        return;
      }

      console.log(`Session ID for ${socket.id}: ${sessionId}`);
      // Join a room based on sessionId so messages are isolated to a specific chat session
      socket.join(sessionId);

      // Handle incoming 'chat message' events from this client
      socket.on("chat message", async (msg: { sender: 'user' | 'ai' | 'system'; text: string; sessionId: string }) => {
        console.log(`Received message from ${msg.sender} in session ${msg.sessionId}: ${msg.text}`);

        // Security/Integrity Check: Ensure the message's session matches the socket's room
        if (msg.sessionId !== sessionId) {
            console.warn(`Message sessionId ${msg.sessionId} does not match socket room ${sessionId}. Ignoring.`);
            return; 
        }

        try {
          // Find the conversation associated with this session ID
          let conversation = await db.conversation.findFirst({
            where: { sessionId },
          });

          // If no conversation exists for this session, create one
          if (!conversation) {
            console.log(`Creating new conversation for session: ${sessionId}`);
            conversation = await db.conversation.create({
              data: {
                sessionId,
              },
            });
          }

          // Map the incoming sender string ('user', 'ai', 'system') to the Prisma enum (USER, AI, SYSTEM)
          let senderEnumValue: SenderType;
          switch (msg.sender) {
            case 'user': senderEnumValue = SenderType.USER; break;
            case 'ai': senderEnumValue = SenderType.AI; break;
            case 'system': senderEnumValue = SenderType.SYSTEM; break;
            default:
              console.error(`Invalid sender type received: ${msg.sender}. Ignoring message.`);
              return; // Don't save message with invalid sender
          }

          // Save the message to the database
          const savedMessage = await db.message.create({
            data: {
              conversationId: conversation.id,
              sender: senderEnumValue, // Use the mapped Prisma enum value
              text: msg.text,
            },
          });
          console.log(`Saved message ${savedMessage.id} to conversation ${conversation.id}`);

          // Explicitly update the conversation to trigger the @updatedAt field
          await db.conversation.update({
            where: { id: conversation.id },
            data: { 
              // We can update any field to trigger updatedAt; using sessionId is simple
              sessionId: conversation.sessionId 
            },
          });

          // Broadcast the message *only* to clients in the same session room (i.e., the same widget instance)
          // We emit the original string sender type, as that's what the client expects.
          io.to(sessionId).emit("chat message", {
            sender: msg.sender, // Send original string ('user', 'ai', 'system') back to client
            text: savedMessage.text,
          });
          console.log(`Broadcasted message to room: ${sessionId}`);

        } catch (error) {
          console.error("Error handling chat message:", error);
          // Optionally emit an error back to the specific client that sent the message
          socket.emit("message error", { error: "Failed to process message" });
        }
      });

      // Handle client disconnection
      socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
        // Perform any cleanup if needed when a specific chat session disconnects
      });
    });
    
    console.log("Socket.IO server initialized and attached.");

  } else {
    console.log("*Reusing existing Socket.IO server (Pages Router)*");
  }
  // End the response for the initial HTTP request that sets up the connection
  res.end(); 
};

export default SocketHandler; 