require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');

const app = express();
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
