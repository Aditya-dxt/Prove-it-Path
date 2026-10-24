import {
  ExperienceLevel,
  TimeOption,
  TopicPlan,
  InterpretedPlan
} from '../types/onboarding';

export interface GoalInterpreterInput {
  rawGoalText: string;
  experienceLevel: ExperienceLevel;
  timePerSession: TimeOption;
  deadline?: string;
  strugglingTopics?: string[];
}

const TOPIC_METADATA = [
  { id: 'select', label: 'SELECT', defaultRole: 'Foundation' },
  { id: 'where', label: 'WHERE — AND / OR', defaultRole: 'Filtering' },
  { id: 'orderby', label: 'ORDER BY — LIMIT', defaultRole: 'Ordering' },
  { id: 'groupby', label: 'GROUP BY — COUNT', defaultRole: 'Aggregation' },
  { id: 'join', label: 'JOIN', defaultRole: 'Relational' }
];

/**
 * Deterministic Goal Interpreter
 * 
 * Maps free-text goals, declared experience, and struggle areas into a
 * structured, personalized learning roadmap without making ungrounded AI claims.
 * Easily replaceable by a real backend endpoint in Milestone 4.
 */
export function interpretLearningGoal(input: GoalInterpreterInput): InterpretedPlan {
  const text = (input.rawGoalText || '').toLowerCase();
  const struggles = new Set(input.strugglingTopics || []);

  // 1. Identify specific mentioned topics in text
  if (text.includes('join') || text.includes('inner join') || text.includes('left join')) {
    struggles.add('join');
  }
  if (text.includes('group by') || text.includes('groupby') || text.includes('aggregation') || text.includes('count')) {
    struggles.add('groupby');
  }
  if (text.includes('where') || text.includes('filter') || text.includes('and/or')) {
    struggles.add('where');
  }
  if (text.includes('order by') || text.includes('limit') || text.includes('sort')) {
    struggles.add('orderby');
  }
  if (text.includes('select') || text.includes('basics') || text.includes('syntax') || text.includes('fundamentals')) {
    struggles.add('select');
  }

  // 2. Classify high-level objective
  let title = 'Mastery-Driven SQL Pathway';
  let summary = 'A calibrated sequence through essential SQL query patterns with continuous confidence calibration.';

  if (text.includes('interview') || text.includes('screen') || text.includes('hiring') || text.includes('job') || text.includes('prep') || text.includes('leetcode')) {
    title = 'Technical Interview Preparation';
    summary = 'Targeted query practice under realistic constraints with a focus on projection accuracy, filtering logic, and table joins.';
  } else if (text.includes('work') || text.includes('analytic') || text.includes('business') || text.includes('dashboard') || text.includes('metric') || text.includes('report') || text.includes('data')) {
    title = 'Workplace Data Analysis';
    summary = 'Master practical filtering, multi-dimensional aggregation with GROUP BY, and joined reporting tables.';
  } else if (text.includes('backend') || text.includes('api') || text.includes('database') || text.includes('orm') || text.includes('postgres') || text.includes('mysql') || text.includes('server')) {
    title = 'Backend Database Foundations';
    summary = 'Build solid intuition for relational schema models, indexable predicates, multi-table joins, and reliable record queries.';
  }

  // 3. Determine recommended starting node
  let startingNodeId = 'select';
  let startingLevel = 'Beginner Foundations';

  if (input.experienceLevel === 'comfortable') {
    startingLevel = 'Advanced Practice';
    if (struggles.has('join')) {
      startingNodeId = 'join';
    } else if (struggles.has('groupby')) {
      startingNodeId = 'groupby';
    } else {
      startingNodeId = 'orderby';
    }
  } else if (input.experienceLevel === 'some_experience') {
    startingLevel = 'Intermediate Calibrated';
    if (struggles.has('groupby') && !struggles.has('where') && !struggles.has('select')) {
      startingNodeId = 'groupby';
    } else if (struggles.has('join') && !struggles.has('where') && !struggles.has('select')) {
      startingNodeId = 'where'; // reinforce where before join
    } else if (struggles.has('orderby')) {
      startingNodeId = 'orderby';
    } else {
      startingNodeId = 'where';
    }
  } else {
    startingLevel = 'Foundational Beginner';
    startingNodeId = 'select';
  }

  // 4. Construct topic breakdown showing rationale for each topic
  const topicPlans: TopicPlan[] = TOPIC_METADATA.map((meta) => {
    const isStarting = meta.id === startingNodeId;
    const isStruggle = struggles.has(meta.id);

    let priority: TopicPlan['priority'] = 'core';
    let reason = '';

    if (isStruggle) {
      priority = 'focus';
      reason = 'Focus Area: Identified as a key struggle point in your stated goal.';
    } else if (isStarting) {
      priority = 'core';
      reason = `Recommended Starting Point: Calibrated for ${startingLevel}.`;
    } else if (meta.id === 'select' && startingNodeId !== 'select') {
      priority = 'foundation';
      reason = 'Verified Foundation: Can be reviewed quickly or revisited if needed.';
    } else if (meta.id === 'join' || meta.id === 'groupby') {
      priority = 'advanced';
      reason = 'Target Competency: Essential relational skill to solidify your objective.';
    } else {
      priority = 'core';
      reason = 'Core Prerequisite: Builds the filtering and ordering habits needed for aggregations.';
    }

    return {
      nodeId: meta.id,
      label: meta.label,
      reason,
      priority,
      isStartingNode: isStarting
    };
  });

  return {
    title,
    summary,
    recommendedStartingNodeId: startingNodeId,
    startingLevel,
    estimatedMinutes: input.timePerSession || 45,
    topicPlans,
    rawGoalText: input.rawGoalText,
    experienceLevel: input.experienceLevel,
    timePerSession: input.timePerSession,
    deadline: input.deadline,
    strugglingTopics: Array.from(struggles)
  };
}
