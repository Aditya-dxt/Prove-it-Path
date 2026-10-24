import { isGrokConfigured, callGrok } from './grok-provider.js';
import { isGroqConfigured, generateGroqExplanation, generateGroqRationale } from './groq-provider.js';
import { isGeminiConfigured, generateGeminiExplanation, generateGeminiRationale } from './gemini-provider.js';
import { getTemplateExplanation, getTemplateRationale } from './template-fallback.js';

export interface AiExplanation {
  text: string;
  source: 'ai' | 'template';
  fallbackUsed: boolean;
}

export interface ExplainRequest {
  taskId: string;
  sql?: string;
  userSql?: string;
  outcome?: {
    state: string;
    correct: boolean;
    actualColumns: string[];
    actualRows: unknown[][];
    expectedColumns: string[];
    expectedRows: unknown[][];
    diagnosis: string;
    nextAction?: unknown;
    errorMessage?: string | null;
  };
  evaluation?: {
    state: string;
    correct: boolean;
    actualColumns: string[];
    actualRows: unknown[][];
    expectedColumns: string[];
    expectedRows: unknown[][];
    diagnosis: string;
    nextAction?: unknown;
    errorMessage?: string | null;
  };
}

export interface RoadmapRationaleRequest {
  currentNodeId: string;
  nextNodeId: string;
  roadmap: unknown;
  previousOutcome?: any;
}

export type ActiveProvider = 'grok' | 'groq' | 'gemini' | 'none';

export function getActiveAiProvider(): ActiveProvider {
  const preferred = process.env.AI_PROVIDER?.toLowerCase();
  if (preferred === 'grok' && isGrokConfigured()) return 'grok';
  if (preferred === 'groq' && isGroqConfigured()) return 'groq';
  if (preferred === 'gemini' && isGeminiConfigured()) return 'gemini';

  // Auto-detection priority: Grok -> Groq -> Gemini
  if (isGrokConfigured()) return 'grok';
  if (isGroqConfigured()) return 'groq';
  if (isGeminiConfigured()) return 'gemini';
  return 'none';
}

export function isAiConfigured(): boolean {
  return getActiveAiProvider() !== 'none';
}

const SYSTEM_EXPLAIN = `You are a friendly SQL tutor helping a beginner understand why their query produced a different result from what was expected.
RULES:
- Do NOT determine whether the query is correct. The deterministic evaluator already decided that.
- Do NOT invent database rows or claim you ran SQL.
- Explain the DIFFERENCE between actual and expected results in beginner-friendly language.
- Keep your explanation under 120 words.
- Use plain text only, no markdown or code blocks.`;

function buildExplainPrompt(req: ExplainRequest): string {
  const taskId = req.taskId;
  const sql = req.sql ?? req.userSql ?? '';
  const outcome = req.outcome ?? req.evaluation ?? {
    state: 'unknown',
    correct: false,
    actualColumns: [],
    actualRows: [],
    expectedColumns: [],
    expectedRows: [],
    diagnosis: '',
  };

  return `TASK: ${taskId}
STUDENT SQL: ${sql}
STATE: ${outcome.state} (Correct: ${outcome.correct})
EXPECTED COLUMNS: ${JSON.stringify(outcome.expectedColumns)}
EXPECTED ROWS: ${JSON.stringify(outcome.expectedRows.slice(0, 5))}
ACTUAL COLUMNS: ${JSON.stringify(outcome.actualColumns)}
ACTUAL ROWS: ${JSON.stringify(outcome.actualRows.slice(0, 5))}
DIAGNOSIS: ${outcome.diagnosis}
ERROR: ${outcome.errorMessage ?? 'None'}

Provide a concise, encouraging explanation of what went wrong or why the output differs:`;
}

export async function getAiExplanation(request: ExplainRequest): Promise<AiExplanation> {
  const provider = getActiveAiProvider();

  // Normalize request
  const normalizedReq: ExplainRequest = {
    taskId: request.taskId,
    sql: request.sql ?? request.userSql ?? '',
    userSql: request.userSql ?? request.sql ?? '',
    outcome: request.outcome ?? request.evaluation,
    evaluation: request.evaluation ?? request.outcome,
  };

  if (provider === 'grok') {
    try {
      const userPrompt = buildExplainPrompt(normalizedReq);
      const text = await callGrok(SYSTEM_EXPLAIN, userPrompt);
      return { text, source: 'ai', fallbackUsed: false };
    } catch (err) {
      console.error('[ai-provider] Grok API error, using template fallback:', err);
      return getTemplateExplanation(normalizedReq as any);
    }
  }

  if (provider === 'groq') {
    try {
      return await generateGroqExplanation(normalizedReq as any);
    } catch (err) {
      console.error('[ai-provider] Groq API error, using template fallback:', err);
      return getTemplateExplanation(normalizedReq as any);
    }
  }

  if (provider === 'gemini') {
    try {
      return await generateGeminiExplanation(normalizedReq as any);
    } catch (err) {
      console.error('[ai-provider] Gemini API error, using template fallback:', err);
      return getTemplateExplanation(normalizedReq as any);
    }
  }

  // Template fallback
  return getTemplateExplanation(normalizedReq as any);
}

export async function getRoadmapRationale(request: RoadmapRationaleRequest): Promise<AiExplanation> {
  const provider = getActiveAiProvider();

  if (provider === 'groq') {
    try {
      return await generateGroqRationale(request);
    } catch (err) {
      return getTemplateRationale(request);
    }
  }

  if (provider === 'gemini') {
    try {
      return await generateGeminiRationale(request);
    } catch (err) {
      return getTemplateRationale(request);
    }
  }

  return getTemplateRationale(request);
}
