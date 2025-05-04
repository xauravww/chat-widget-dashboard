import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client'; // Imports from default node_modules location
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors middleware

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001; // Use separate port (e.g., 3001) or from env
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*' // Allow specific origin or default to all

// Create HTTP server
const httpServer = http.createServer((req, res) => {
  // Basic response for health checks or direct access
  // Use cors middleware for HTTP requests if needed (though not primary focus)
  cors({ origin: CORS_ORIGIN })(req, res, () => {
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Socket.IO Server Running\n');
    } else {
      res.writeHead(404);
      res.end();
    }
  });
});

// Initialize Socket.IO server
const io = new Server(httpServer, {
  // No specific path needed here, clients connect to the base URL
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

console.log(`Socket server configured to accept connections from: ${CORS_ORIGIN}`);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chat message', async (msg) => {
    console.log('Message received:', msg);

    if (!msg.sessionId || !msg.sender || !msg.text) {
      console.error('Invalid message structure received:', msg);
      return; // Ignore invalid messages
    }

    try {
      // 1. Find or create the conversation
      const conversation = await prisma.conversation.upsert({
        where: { sessionId: msg.sessionId },
        update: { updatedAt: new Date() }, // Update timestamp on new message
        create: { sessionId: msg.sessionId }
      });

      // 2. Create the message linked to the conversation
      const savedMessage = await prisma.message.create({
        data: {
          sender: msg.sender.toUpperCase(), // Ensure enum case
          text: msg.text,
          conversationId: conversation.id // Connect via foreign key
        }
      });
      console.log('Message saved:', savedMessage.id, 'to conversation:', conversation.id);

      // Broadcast message to other clients (optional)
      // socket.broadcast.emit('chat message', msg);

    } catch (error) {
      console.error('Database error processing message:', error);
      // Consider emitting an error back to the client
      // socket.emit('error_saving_message', { message: 'Failed to save your message.' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});

// Graceful shutdown (optional but good practice)
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 