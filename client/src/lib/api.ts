import {
  EvaluationOutcome,
  AIExplanationResponse,
  Prediction,
  RoadmapNode,
  LearningGoal
} from '../types/contract';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  status?: number;
  isTimeout: boolean;
  isNetworkError: boolean;

  constructor(message: string, options?: { status?: number; isTimeout?: boolean; isNetworkError?: boolean }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.isTimeout = options?.isTimeout ?? false;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

/**
 * Fetch with configurable timeout and error parsing.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out while waiting for server response.', { isTimeout: true });
    }
    throw new ApiError(error.message || 'Network error occurred.', { isNetworkError: true });
  } finally {
    clearTimeout(id);
  }
}

/**
 * API client to communicate with the Express backend & learning engine.
 */
export const apiClient = {
  /**
   * Set or update active learning goal on backend engine.
   */
  async setGoal(goalId: string): Promise<{ success: boolean; roadmap: RoadmapNode[]; currentTask: any }> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/goal`, {
      method: 'POST',
      body: JSON.stringify({ goalId })
    });

    if (!res.ok) {
      throw new ApiError(`Failed to set goal: ${res.statusText}`, { status: res.status });
    }
    return res.json();
  },

  /**
   * Submit an attempt with user SQL and required confidence prediction.
   */
  async submitAttempt(payload: {
    taskId: string;
    sql: string;
    prediction: Prediction;
  }): Promise<EvaluationOutcome> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new ApiError(`Evaluation failed with status ${res.status}`, { status: res.status });
    }
    return res.json();
  },

  /**
   * Request an AI explanation for an evaluated outcome (Grok through backend).
   * Server returns whether AI was used or template fallback occurred.
   */
  async requestExplanation(payload: {
    taskId: string;
    sql: string;
    outcome: EvaluationOutcome;
  }): Promise<AIExplanationResponse> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/explain`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // Return a graceful truthful fallback state
      return {
        text: 'The explanation service is temporarily unavailable. Please review the diagnosis and contrast example to refine your query.',
        source: 'template',
        fallbackUsed: true
      };
    }

    const data: AIExplanationResponse = await res.json();
    return {
      text: data.text || 'No explanation provided.',
      source: data.source === 'ai' ? 'ai' : 'template',
      fallbackUsed: Boolean(data.fallbackUsed || data.source === 'template')
    };
  }
};

export const LEARNING_GOALS: LearningGoal[] = [
  {
    id: 'interview',
    title: 'Pass an SQL interview',
    description: 'Master core interview patterns from filtering to multi-table joins under realistic constraints.',
    estimatedMinutes: 45
  },
  {
    id: 'analytics',
    title: 'Analyse data at work',
    description: 'Query operational tables, aggregate metrics with GROUP BY, and extract business insights reliably.',
    estimatedMinutes: 35
  },
  {
    id: 'backend',
    title: 'Learn database basics for backend development',
    description: 'Understand relational schemas, primary/foreign keys, joins, and predictable query mechanics.',
    estimatedMinutes: 40
  }
];
