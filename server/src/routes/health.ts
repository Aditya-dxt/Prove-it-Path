import { Router } from 'express';
import type { Request, Response } from 'express';
import { getActiveAiProvider, isAiConfigured } from '../services/ai-provider.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  const activeProvider = getActiveAiProvider();
  const aiAvailable = isAiConfigured();

  res.json({
    status: 'ok',
    aiAvailable,
    provider: activeProvider === 'none' ? 'template' : activeProvider,
    timestamp: new Date().toISOString(),
  });
});
