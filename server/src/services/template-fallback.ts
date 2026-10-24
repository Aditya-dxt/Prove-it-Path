import type { AiExplanation, ExplainRequest, RoadmapRationaleRequest } from './ai-provider.js';

// ─── Template Explanations ───────────────────────────────────────────

const STATE_TEMPLATES: Record<string, string> = {
  proven:
    'Great work! Your query returned the correct result. You demonstrated understanding of this concept.',
  hidden_strength:
    "You weren't sure, but your query is actually correct! You know more than you think.",
  honest_gap:
    "Your result doesn't match the expected output. That's okay — identifying gaps is how we learn. Look at the difference between your result and what was expected.",
  mirage:
    "You predicted you could do this, but the result doesn't match. Let's look carefully at the difference between what you got and what was expected. A re-check will appear later in your roadmap.",
  slip:
    'It looks like there was a small syntax error or typo. Double-check your SQL and try again — you likely know the concept.',
};

/**
 * Generate a template-based explanation when AI is unavailable.
 */
export function getTemplateExplanation(request: ExplainRequest): AiExplanation {
  const evaluation = request.evaluation ?? request.outcome ?? { state: 'honest_gap', correct: false, diagnosis: '' };
  const baseText = STATE_TEMPLATES[evaluation.state] ?? 'Review your query and compare the results.';

  let text = baseText;

  // Append diagnosis info if there is one
  if (!evaluation.correct && evaluation.diagnosis) {
    text += ` Detail: ${evaluation.diagnosis}`;
  }

  return {
    text,
    source: 'template',
    fallbackUsed: true,
  };
}

// ─── Template Rationale ──────────────────────────────────────────────

/**
 * Generate a template-based rationale when AI is unavailable.
 */
export function getTemplateRationale(request: RoadmapRationaleRequest): AiExplanation {
  const { currentNodeId, nextNodeId, previousOutcome } = request;

  let text: string;

  if (!previousOutcome) {
    text = `Moving from "${currentNodeId}" to "${nextNodeId}" — the next step in your learning path.`;
  } else if (previousOutcome.correct) {
    text = `You completed the previous step successfully. "${nextNodeId}" builds on what you just learned.`;
  } else {
    text = `The previous step had some challenges. "${nextNodeId}" will help reinforce the concepts. Keep going!`;
  }

  return {
    text,
    source: 'template',
    fallbackUsed: true,
  };
}
