import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isGeminiConfigured } from '../services/gemini-provider';

describe('isGeminiConfigured', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns false when GEMINI_API_KEY is not set', () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(isGeminiConfigured()).toBe(false);
  });

  it('returns false when GEMINI_API_KEY is whitespace', () => {
    vi.stubEnv('GEMINI_API_KEY', '   ');
    expect(isGeminiConfigured()).toBe(false);
  });

  it('returns true when GEMINI_API_KEY is set', () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key-123');
    expect(isGeminiConfigured()).toBe(true);
  });
});
