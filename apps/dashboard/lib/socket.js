import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

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

      socket.on('chat message', (msg) => {
        console.log('message received from', socket.id, ':', msg);
        socket.broadcast.emit('chat message', msg);
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