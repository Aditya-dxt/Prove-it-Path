import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  ExplainRequestSchema,
  RoadmapRationaleRequestSchema,
  validateBody,
} from '../middleware/validation.js';
import { getAiExplanation, getRoadmapRationale } from '../services/ai-provider.js';
import type { ExplainRequest, RoadmapRationaleRequest } from '../services/ai-provider.js';

export const aiRouter = Router();

// ─── POST /api/ai/explain ────────────────────────────────────────────

aiRouter.post(
  '/explain',
  validateBody(ExplainRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = (req as Request & { validatedBody: ExplainRequest }).validatedBody;
      const explanation = await getAiExplanation(body);

      res.json({ explanation });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/ai/roadmap-rationale ──────────────────────────────────

aiRouter.post(
  '/roadmap-rationale',
  validateBody(RoadmapRationaleRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = (req as Request & { validatedBody: RoadmapRationaleRequest }).validatedBody;
      const rationale = await getRoadmapRationale(body);

      res.json({ rationale });
    } catch (err) {
      next(err);
    }
  }
);
