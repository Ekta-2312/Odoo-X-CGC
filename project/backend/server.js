require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.use(cors());
app.use(express.json());

// Express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);

connectDB();

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Requests & Workshops
const requestController = require('./controllers/requestController');
requestController.setSocket(io);
app.use('/api/requests', require('./routes/requests'));
app.use('/api/workshops', require('./routes/workshops'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});
