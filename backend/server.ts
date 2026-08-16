import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import interviewRoutes from './routes/interviewRoutes';

const app = express();
const PORT = Number(process.env.PORT || 5001);

app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_ORIGIN || '']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Namespace backend APIs under /api/* so frontend routes like /interview don't clash with API routes.
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    message: 'Convoo API is running',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
});

// Useful for verifying Vite proxy (/api -> backend)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    message: 'Convoo API is running (via /api)',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
});

// Legacy /api: transcribe (STT) only. Mount AFTER /api/auth and /api/interview
// to avoid any possibility of shadowing those routes.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const legacyWhisperRoutes = require(path.join(process.cwd(), 'routes', 'whisperRoutes.js'));
app.use('/api', legacyWhisperRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unknown error';
  console.error('[server] error:', message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong'
  });
});

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Convoo server listening on http://localhost:${PORT}`);
      console.log(`- Health: http://localhost:${PORT}/health`);
      console.log(`- Auth: POST /api/auth/signup, /api/auth/login, GET /api/auth/me`);
      console.log(
        `- Interview: POST /api/interview/start, /api/interview/answer, GET /api/interview/history, /api/interview/:id`
      );
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[server] Port ${PORT} is already in use.`);
        console.error(`[server] Stop the other process using :${PORT}, or set PORT to a free port in backend/.env.`);
      } else {
        console.error('[server] Failed to start server:', err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });

