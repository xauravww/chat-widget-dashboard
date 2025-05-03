const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors'); // Import cors

const app = express();
const server = http.createServer(app);

// Configure CORS
// Allow connections from any origin for development.
// For production, restrict this to the actual domain where the widget is hosted.
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Socket.IO Server is running.');
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // Handle user joining (optional, useful for tracking users)
  socket.on('join', (data) => {
    console.log('User joined:', data);
    // You could store user info here if needed
  });

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    console.log('message received from ', socket.id, ': ', msg);
    // Broadcast the message to everyone EXCEPT the sender
    socket.broadcast.emit('chat message', msg);
    // To send to everyone INCLUDING the sender, use: 
    // io.emit('chat message', msg);
  });

  socket.on('disconnect', (reason) => {
    console.log('user disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle connection errors on the socket instance
  socket.on('error', (err) => {
    console.error("Socket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on *:${PORT}`);
});

// Handle server-level errors
server.on('error', (err) => {
  console.error("Server error:", err);
});
 