import { describe, it, expect } from 'vitest';
import { getTemplateExplanation, getTemplateRationale } from '../services/template-fallback';

// ─── Template Explanation Tests ──────────────────────────────────────

describe('getTemplateExplanation', () => {
  const baseRequest = {
    taskId: 'task-1',
    userSql: 'SELECT * FROM test',
    evaluation: {
      state: 'proven' as const,
      correct: true,
      actualColumns: ['id'],
      actualRows: [[1]],
      expectedColumns: ['id'],
      expectedRows: [[1]],
      diagnosis: '',
      nextAction: { type: 'proceed' as const },
      roadmap: {} as unknown,
      remainingMinutes: 10,
    },
  };

  it('returns template source for proven state', () => {
    const result = getTemplateExplanation(baseRequest);
    expect(result.source).toBe('template');
    expect(result.fallbackUsed).toBe(true);
    expect(result.text).toContain('correct');
  });

  it('returns template for honest_gap state', () => {
    const request = {
      ...baseRequest,
      evaluation: {
        ...baseRequest.evaluation,
        state: 'honest_gap' as const,
        correct: false,
        diagnosis: 'Expected 3 rows but got 1.',
      },
    };
    const result = getTemplateExplanation(request);
    expect(result.source).toBe('template');
    expect(result.text).toContain('gap');
    expect(result.text).toContain('Expected 3 rows');
  });

  it('returns template for mirage state', () => {
    const request = {
      ...baseRequest,
      evaluation: {
        ...baseRequest.evaluation,
        state: 'mirage' as const,
        correct: false,
        diagnosis: 'Wrong results.',
      },
    };
    const result = getTemplateExplanation(request);
    expect(result.source).toBe('template');
    expect(result.text).toContain('re-check');
  });

  it('returns template for slip state', () => {
    const request = {
      ...baseRequest,
      evaluation: {
        ...baseRequest.evaluation,
        state: 'slip' as const,
        correct: false,
        diagnosis: 'Syntax error.',
      },
    };
    const result = getTemplateExplanation(request);
    expect(result.source).toBe('template');
    expect(result.text).toContain('syntax');
  });

  it('returns template for hidden_strength state', () => {
    const request = {
      ...baseRequest,
      evaluation: {
        ...baseRequest.evaluation,
        state: 'hidden_strength' as const,
      },
    };
    const result = getTemplateExplanation(request);
    expect(result.source).toBe('template');
    expect(result.text).toContain('know more');
  });
});

// ─── Template Rationale Tests ────────────────────────────────────────

describe('getTemplateRationale', () => {
  it('returns rationale with no previous outcome', () => {
    const result = getTemplateRationale({
      currentNodeId: 'node-1',
      nextNodeId: 'node-2',
      roadmap: {} as unknown,
    });
    expect(result.source).toBe('template');
    expect(result.fallbackUsed).toBe(true);
    expect(result.text).toContain('node-2');
  });

  it('returns rationale for successful previous outcome', () => {
    const result = getTemplateRationale({
      currentNodeId: 'node-1',
      nextNodeId: 'node-2',
      roadmap: {} as unknown,
      previousOutcome: {
        state: 'proven',
        correct: true,
        actualColumns: [],
        actualRows: [],
        expectedColumns: [],
        expectedRows: [],
        diagnosis: '',
        nextAction: { type: 'proceed' },
        roadmap: {} as unknown,
        remainingMinutes: 10,
      },
    });
    expect(result.text).toContain('successfully');
  });

  it('returns rationale for failed previous outcome', () => {
    const result = getTemplateRationale({
      currentNodeId: 'node-1',
      nextNodeId: 'node-2',
      roadmap: {} as unknown,
      previousOutcome: {
        state: 'honest_gap',
        correct: false,
        actualColumns: [],
        actualRows: [],
        expectedColumns: [],
        expectedRows: [],
        diagnosis: 'row mismatch',
        nextAction: { type: 'retry', hint: 'try again' },
        roadmap: {} as unknown,
        remainingMinutes: 10,
      },
    });
    expect(result.text).toContain('challenges');
  });
});

// ─── AI Response Validation ──────────────────────────────────────────

describe('AI response structure', () => {
  it('all template responses have required fields', () => {
    const states = ['proven', 'hidden_strength', 'honest_gap', 'mirage', 'slip'] as const;

    for (const state of states) {
      const result = getTemplateExplanation({
        taskId: 'test',
        userSql: 'SELECT 1',
        evaluation: {
          state,
          correct: state === 'proven' || state === 'hidden_strength',
          actualColumns: [],
          actualRows: [],
          expectedColumns: [],
          expectedRows: [],
          diagnosis: 'test',
          nextAction: { type: 'proceed' },
          roadmap: {} as unknown,
          remainingMinutes: 10,
        },
      });

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('fallbackUsed');
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(0);
    }
  });
});
