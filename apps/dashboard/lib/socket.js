import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

let io;

export const initSocketServer = (server) => {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*', // Allow all origins for development
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('a user connected:', socket.id);

      socket.on('join', (data) => {
        console.log('User joined:', data);
      });

      socket.on('chat message', async (msg) => {
        console.log('message received from', socket.id, ':', msg);
        
        if (!msg.sessionId || !msg.sender || !msg.text) {
            console.error('Invalid message received:', msg);
            return; // Ignore invalid messages
        }

        try {
          // 1. Find or create the conversation based on sessionId
          const conversation = await prisma.conversation.upsert({
            where: { sessionId: msg.sessionId },
            update: {}, // No fields to update on existing conversation for now
            create: { sessionId: msg.sessionId }
          });

          // 2. Create the message and connect it to the conversation
          const savedMessage = await prisma.message.create({
            data: {
              sender: msg.sender.toUpperCase(), // Ensure enum compatibility (USER, AI, SYSTEM)
              text: msg.text,
              conversation: { // Use the relation to connect
                connect: {
                  id: conversation.id
                }
              }
              // Alternatively, connect using the foreign key directly:
              // conversationId: conversation.id 
            }
          });
          console.log('Message saved:', savedMessage.id, 'to conversation:', conversation.id);
          
          // Broadcast the original message
          socket.broadcast.emit('chat message', msg);

        } catch (error) {
          console.error('Failed to process message or save to DB:', error);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('user disconnected:', socket.id, 'Reason:', reason);
      });

      socket.on('error', (err) => {
        console.error('Socket error:', err);
      });
    });
    console.log('Socket.IO server initialized');
  }

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Please call initSocketServer first.');
  }
  return io;
};