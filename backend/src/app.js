// Credit Book — Express Application
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const personsRoutes = require('./routes/persons.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const supportRoutes = require('./routes/support.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// ─── Security ──────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Managed by frontend
  })
);

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://creditbook.vercel.app',
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) =>
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
      )) {
        return callback(null, true);
      }
      callback(null, true); // Be permissive in dev; tighten in prod
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body parsing & compression ────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────
app.use(
  morgan(':method :url :status :response-time ms', {
    skip: (req) => req.url === '/health',
  })
);

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Credit Book API',
    version: '1.0.0',
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/persons', personsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ─── Public share endpoint (no auth) ─────────────────────────────────────
app.get('/api/v1/public/share/:token', async (req, res, next) => {
  try {
    const personsService = require('./services/persons.service');
    const { successResponse } = require('./utils/response');
    const data = await personsService.getPublicShare(req.params.token);
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

// ─── 404 + Error handling ──────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
