import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { evaluateSqlAttempt, SERVER_TASKS } from '../engine/sql-engine.js';
import { getAiExplanation } from '../services/ai-provider.js';

export const evaluateRouter = Router();

// ─── POST /api/evaluate ──────────────────────────────────────────────

evaluateRouter.post('/evaluate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, sql, prediction, roadmap } = req.body;

    if (!taskId || typeof taskId !== 'string') {
      res.status(400).json({ error: 'taskId is required and must be a string.' });
      return;
    }
    if (typeof sql !== 'string') {
      res.status(400).json({ error: 'sql is required and must be a string.' });
      return;
    }
    if (prediction !== 'can_do' && prediction !== 'not_sure') {
      res.status(400).json({ error: 'prediction must be "can_do" or "not_sure".' });
      return;
    }

    const outcome = await evaluateSqlAttempt(taskId, sql, prediction, roadmap);
    res.json(outcome);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/explain ───────────────────────────────────────────────

evaluateRouter.post('/explain', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, sql, outcome, evaluation, userSql } = req.body;

    const targetTaskId = taskId ?? 'task-select-01';
    const targetSql = sql ?? userSql ?? '';
    const targetOutcome = outcome ?? evaluation;

    if (!targetOutcome) {
      res.status(400).json({ error: 'outcome or evaluation object is required.' });
      return;
    }

    const explanation = await getAiExplanation({
      taskId: targetTaskId,
      sql: targetSql,
      outcome: targetOutcome,
    });

    res.json(explanation);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/goal ──────────────────────────────────────────────────

evaluateRouter.post('/goal', (req: Request, res: Response) => {
  const { goalId } = req.body;

  const defaultRoadmap = [
    { id: 'select', label: 'SELECT', status: 'not_started' as const },
    { id: 'where', label: 'WHERE — AND / OR', status: 'not_started' as const },
    { id: 'orderby', label: 'ORDER BY — LIMIT', status: 'not_started' as const },
    { id: 'groupby', label: 'GROUP BY — COUNT', status: 'not_started' as const },
    { id: 'join', label: 'JOIN', status: 'not_started' as const },
  ];

  res.json({
    success: true,
    goalId: goalId ?? 'interview',
    roadmap: defaultRoadmap,
    currentTask: SERVER_TASKS['task-select-01'],
  });
});
