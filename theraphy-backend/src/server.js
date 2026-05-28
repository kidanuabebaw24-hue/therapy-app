import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import { registerChatSocket } from './socket/chatSocket.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      '*',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

registerChatSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (HTTP + Socket.io chat)`);
});

export { io };
