import type { AiExplanation, ExplainRequest, RoadmapRationaleRequest } from './ai-provider.js';

// ─── Configuration ───────────────────────────────────────────────────

const GROQ_API_KEY = () => process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL = () => process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
const GROQ_TIMEOUT_MS = 15_000;

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

// ─── Groq API Call ───────────────────────────────────────────────────

interface GroqChoice {
  message?: {
    content?: string;
  };
  finish_reason?: string;
}

interface GroqResponse {
  choices?: GroqChoice[];
  error?: { message?: string; type?: string; code?: string };
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = GROQ_API_KEY();
  const model = GROQ_MODEL();

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(`Groq API returned ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as GroqResponse;

    if (data.error) {
      throw new Error(`Groq API error: ${data.error.message ?? 'Unknown'}`);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Groq returned an empty or invalid response');
    }

    return sanitizeText(text.trim());
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Text Sanitization ──────────────────────────────────────────────

function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 2000);
}

// ─── Prompt Builders ─────────────────────────────────────────────────

const SYSTEM_EXPLAIN = `You are a friendly SQL tutor helping a beginner understand their query result.
RULES:
- Do NOT determine whether the query is correct. The evaluator already did that.
- Do NOT invent database results. Only reference what is provided.
- Do NOT claim to detect a misconception unless the DIAGNOSIS explicitly describes one.
- Explain the DIFFERENCE between actual and expected results in beginner-friendly language.
- If the result is correct, give a brief encouraging note.
- Keep your explanation under 150 words.
- Use plain text only, no markdown formatting.`;

const SYSTEM_RATIONALE = `You are a friendly SQL tutor explaining why a learning step is appropriate.
RULES:
- Explain concisely why moving to the next step makes sense.
- If the learner struggled, acknowledge it supportively.
- Do NOT override or modify the roadmap decision. It was already made by the engine.
- Keep under 100 words.
- Use plain text only, no markdown formatting.`;

function buildExplainPrompt(request: ExplainRequest): string {
  const taskId = request.taskId;
  const userSql = request.sql ?? request.userSql ?? '';
  const evaluation = request.evaluation ?? request.outcome ?? {
    state: 'unknown',
    correct: false,
    actualColumns: [],
    actualRows: [],
    expectedColumns: [],
    expectedRows: [],
    diagnosis: '',
  };

  return `TASK: ${taskId}
STUDENT'S SQL: ${userSql}
LEARNER STATE: ${evaluation.state}
CORRECT: ${evaluation.correct}

EXPECTED COLUMNS: ${JSON.stringify(evaluation.expectedColumns)}
EXPECTED ROWS (first 5): ${JSON.stringify(evaluation.expectedRows.slice(0, 5))}

ACTUAL COLUMNS: ${JSON.stringify(evaluation.actualColumns)}
ACTUAL ROWS (first 5): ${JSON.stringify(evaluation.actualRows.slice(0, 5))}

DIAGNOSIS FROM EVALUATOR: ${evaluation.diagnosis}

Provide your explanation:`;
}

function buildRationalePrompt(request: RoadmapRationaleRequest): string {
  const { currentNodeId, nextNodeId, previousOutcome } = request;

  return `CURRENT NODE: ${currentNodeId}
NEXT NODE: ${nextNodeId}
${previousOutcome ? `PREVIOUS STATE: ${previousOutcome.state}` : 'No previous outcome.'}
${previousOutcome ? `PREVIOUS DIAGNOSIS: ${previousOutcome.diagnosis}` : ''}

Provide your rationale:`;
}

// ─── Public API ──────────────────────────────────────────────────────

export async function generateGroqExplanation(request: ExplainRequest): Promise<AiExplanation> {
  const userPrompt = buildExplainPrompt(request);
  const text = await callGroq(SYSTEM_EXPLAIN, userPrompt);

  return {
    text,
    source: 'ai',
    fallbackUsed: false,
  };
}

export async function generateGroqRationale(request: RoadmapRationaleRequest): Promise<AiExplanation> {
  const userPrompt = buildRationalePrompt(request);
  const text = await callGroq(SYSTEM_RATIONALE, userPrompt);

  return {
    text,
    source: 'ai',
    fallbackUsed: false,
  };
}
