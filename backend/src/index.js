const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const { initSocket } = require('./utils/socket');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://tabmind.app',
    /^chrome-extension:\/\//,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Initialize Passport (stateless — no sessions)
app.use(passport.initialize());

// Routes
const authRoutes = require('./routes/auth.routes');
const tabRoutes = require('./routes/tab.routes');
const sessionRoutes = require('./routes/session.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const digestRoutes = require('./routes/digest.routes');
const userRoutes = require('./routes/user.routes');
app.use('/api/auth', authRoutes);
app.use('/api/tabs', tabRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/digest', digestRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.send('TabMind API is running...');
});

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://tabmind.app',
    ],
    credentials: true,
  },
});

// Initialize socket auth + room logic
initSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Start weekly digest cron job
  const weeklyDigestJob = require('./jobs/weeklyDigest.job');
  weeklyDigestJob.start();
  console.log('Weekly digest cron job scheduled (every Monday 9am)');
});
