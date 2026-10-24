import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isGroqConfigured } from '../services/groq-provider.js';
import { getActiveAiProvider, isAiConfigured } from '../services/ai-provider.js';

describe('isGroqConfigured', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns false when GROQ_API_KEY is not set', () => {
    vi.stubEnv('GROQ_API_KEY', '');
    expect(isGroqConfigured()).toBe(false);
  });

  it('returns false when GROQ_API_KEY is whitespace', () => {
    vi.stubEnv('GROQ_API_KEY', '   ');
    expect(isGroqConfigured()).toBe(false);
  });

  it('returns true when GROQ_API_KEY is set', () => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test123');
    expect(isGroqConfigured()).toBe(true);
  });
});

describe('getActiveAiProvider', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns none when no keys are set', () => {
    vi.stubEnv('GROQ_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(getActiveAiProvider()).toBe('none');
    expect(isAiConfigured()).toBe(false);
  });

  it('returns groq when GROQ_API_KEY is set', () => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test123');
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(getActiveAiProvider()).toBe('groq');
    expect(isAiConfigured()).toBe(true);
  });

  it('returns gemini when only GEMINI_API_KEY is set', () => {
    vi.stubEnv('GROQ_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', 'gemini_test123');
    expect(getActiveAiProvider()).toBe('gemini');
    expect(isAiConfigured()).toBe(true);
  });

  it('respects AI_PROVIDER override', () => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test123');
    vi.stubEnv('GEMINI_API_KEY', 'gemini_test123');
    vi.stubEnv('AI_PROVIDER', 'gemini');
    expect(getActiveAiProvider()).toBe('gemini');

    vi.stubEnv('AI_PROVIDER', 'groq');
    expect(getActiveAiProvider()).toBe('groq');
  });
});
