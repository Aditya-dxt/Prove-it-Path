import { LearningGoal } from '../types/contract';

export const LEARNING_GOALS: LearningGoal[] = [
  {
    id: 'interview',
    title: 'Pass an SQL interview',
    description: 'Practise the query patterns and reasoning used in technical interviews.',
    estimatedMinutes: 45
  },
  {
    id: 'analytics',
    title: 'Analyse data at work',
    description: 'Learn to filter, sort, aggregate, and explore data using SQL.',
    estimatedMinutes: 35
  },
  {
    id: 'backend',
    title: 'Learn database basics for backend development',
    description: 'Build practical foundations for querying relational databases in applications.',
    estimatedMinutes: 40
  }
];

export const DEFAULT_GOAL = LEARNING_GOALS[0];
