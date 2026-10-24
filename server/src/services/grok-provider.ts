// ─── xAI Grok Provider Adapter ───────────────────────────────────────

const GROK_API_KEY = () => process.env.GROK_API_KEY ?? '';
const GROK_MODEL = () => process.env.GROK_MODEL ?? 'grok-2-latest';
const GROK_TIMEOUT_MS = 15_000;

export function isGrokConfigured(): boolean {
  return Boolean(process.env.GROK_API_KEY?.trim());
}

interface GrokChoice {
  message?: {
    content?: string;
  };
}

interface GrokResponse {
  choices?: GrokChoice[];
  error?: { message?: string };
}

export async function callGrok(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = GROK_API_KEY();
  const model = GROK_MODEL();

  if (!apiKey) {
    throw new Error('GROK_API_KEY is not configured');
  }

  const url = 'https://api.x.ai/v1/chat/completions';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROK_TIMEOUT_MS);

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
      throw new Error(`Grok API returned ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as GrokResponse;
    if (data.error) {
      throw new Error(`Grok error: ${data.error.message}`);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
      throw new Error('Grok returned an empty response');
    }

    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 2000);
  } finally {
    clearTimeout(timeoutId);
  }
}
