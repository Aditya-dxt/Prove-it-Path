import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { aiRouter } from './routes/ai.js';
import { evaluateRouter } from './routes/evaluate.js';
import { errorHandler } from './middleware/error-handler.js';
import { getActiveAiProvider } from './services/ai-provider.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────

app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '100kb' }));

// ─── Routes ──────────────────────────────────────────────────────────

app.use('/api', healthRouter);
app.use('/api', evaluateRouter);
app.use('/api/ai', aiRouter);

// ─── Error Handler ───────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    const provider = getActiveAiProvider();
    console.log(`[server] Prove-it-Path API listening on http://localhost:${PORT}`);
    console.log(`[server] CORS origin: ${CLIENT_ORIGIN}`);
    console.log(`[server] AI provider: ${provider !== 'none' ? provider.toUpperCase() + ' (configured)' : 'Template fallback (no API key configured)'}`);
  });
}

export { app };
