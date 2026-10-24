import type { AiExplanation, ExplainRequest, RoadmapRationaleRequest } from './ai-provider.js';

// ─── Configuration ───────────────────────────────────────────────────

const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY ?? '';
const GEMINI_MODEL = () => process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_TIMEOUT_MS = 15_000;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

// ─── Gemini API Call ─────────────────────────────────────────────────

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message?: string; code?: number };
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = GEMINI_API_KEY();
  const model = GEMINI_MODEL();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(`Gemini API returned ${response.status}: ${errorBody}`);
    }

    const data: GeminiResponse = await response.json() as GeminiResponse;

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message ?? 'Unknown'}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Gemini returned an empty or invalid response');
    }

    return sanitizeText(text.trim());
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Text Sanitization ──────────────────────────────────────────────

function sanitizeText(text: string): string {
  // Remove any potential script tags or HTML
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 2000); // Hard limit on response length
}

// ─── Prompt Builders ─────────────────────────────────────────────────

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

  return `You are a friendly SQL tutor helping a beginner understand their query result.

TASK: ${taskId}
STUDENT'S SQL: ${userSql}
LEARNER STATE: ${evaluation.state}
CORRECT: ${evaluation.correct}

EXPECTED COLUMNS: ${JSON.stringify(evaluation.expectedColumns)}
EXPECTED ROWS (first 5): ${JSON.stringify(evaluation.expectedRows.slice(0, 5))}

ACTUAL COLUMNS: ${JSON.stringify(evaluation.actualColumns)}
ACTUAL ROWS (first 5): ${JSON.stringify(evaluation.actualRows.slice(0, 5))}

DIAGNOSIS FROM EVALUATOR: ${evaluation.diagnosis}

RULES:
- Do NOT determine whether the query is correct. The evaluator already did that.
- Do NOT invent database results. Only reference what is shown above.
- Do NOT claim to detect a misconception unless the DIAGNOSIS explicitly describes one.
- Explain the DIFFERENCE between actual and expected results in beginner-friendly language.
- If the result is correct, give a brief encouraging note.
- Keep your explanation under 150 words.
- Use plain text only, no markdown formatting.

Provide your explanation:`;
}

function buildRationalePrompt(request: RoadmapRationaleRequest): string {
  const { currentNodeId, nextNodeId, previousOutcome } = request;

  return `You are a friendly SQL tutor explaining why a learning step is appropriate.

CURRENT NODE: ${currentNodeId}
NEXT NODE: ${nextNodeId}
${previousOutcome ? `PREVIOUS STATE: ${previousOutcome.state}` : 'No previous outcome.'}
${previousOutcome ? `PREVIOUS DIAGNOSIS: ${previousOutcome.diagnosis}` : ''}

RULES:
- Explain concisely why moving to the next step makes sense.
- If the learner struggled, acknowledge it supportively.
- Do NOT override or modify the roadmap decision. It was already made by the engine.
- Keep under 100 words.
- Use plain text only, no markdown formatting.

Provide your rationale:`;
}

// ─── Public API ──────────────────────────────────────────────────────

export async function generateGeminiExplanation(request: ExplainRequest): Promise<AiExplanation> {
  const prompt = buildExplainPrompt(request);
  const text = await callGemini(prompt);

  return {
    text,
    source: 'ai',
    fallbackUsed: false,
  };
}

export async function generateGeminiRationale(request: RoadmapRationaleRequest): Promise<AiExplanation> {
  const prompt = buildRationalePrompt(request);
  const text = await callGemini(prompt);

  return {
    text,
    source: 'ai',
    fallbackUsed: false,
  };
}
