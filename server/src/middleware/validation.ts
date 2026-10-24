import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { createApiError } from './error-handler.js';

// ─── Shared Zod Schemas ─────────────────────────────────────────────

const LearnerStateSchema = z.enum(['proven', 'hidden_strength', 'honest_gap', 'mirage', 'slip']);

const NextActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('proceed') }),
  z.object({ type: z.literal('retry'), hint: z.string(), variantTaskId: z.string().optional() }),
  z.object({ type: z.literal('recheck'), afterNodeId: z.string() }),
  z.object({ type: z.literal('lesson'), content: z.string() }),
]);

const RoadmapNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  taskIds: z.array(z.string()),
  status: z.enum(['locked', 'active', 'completed', 'recheck', 'skipped']),
  estimatedMinutes: z.number(),
  isRecheck: z.boolean().optional(),
  recheckForNodeId: z.string().optional(),
});

const RoadmapStateSchema = z.object({
  goalId: z.string(),
  goalTitle: z.string(),
  nodes: z.array(RoadmapNodeSchema),
  currentNodeIndex: z.number().int().min(0),
  totalEstimatedMinutes: z.number(),
});

const EvaluationOutcomeSchema = z.object({
  state: LearnerStateSchema,
  correct: z.boolean(),
  actualColumns: z.array(z.string()),
  actualRows: z.array(z.array(z.unknown())),
  expectedColumns: z.array(z.string()),
  expectedRows: z.array(z.array(z.unknown())),
  diagnosis: z.string(),
  nextAction: NextActionSchema,
  roadmap: RoadmapStateSchema,
  remainingMinutes: z.number(),
});

// ─── Request Schemas ─────────────────────────────────────────────────

export const ExplainRequestSchema = z.object({
  taskId: z.string().min(1).max(200),
  userSql: z.string().min(1).max(5000),
  evaluation: EvaluationOutcomeSchema,
});

export const RoadmapRationaleRequestSchema = z.object({
  currentNodeId: z.string().min(1).max(200),
  nextNodeId: z.string().min(1).max(200),
  roadmap: RoadmapStateSchema,
  previousOutcome: EvaluationOutcomeSchema.optional(),
});

// ─── Validation Middleware Factory ────────────────────────────────────

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      next(createApiError(400, `Validation failed: ${messages.join('; ')}`, 'VALIDATION_ERROR'));
      return;
    }
    // Attach parsed body
    (req as Request & { validatedBody: T }).validatedBody = result.data;
    next();
  };
}
