export type ExperienceLevel = 'beginner' | 'some_experience' | 'comfortable';

export type TimeOption = 15 | 30 | 45 | 60;

export type TopicPriority = 'focus' | 'core' | 'advanced' | 'foundation';

export interface TopicPlan {
  nodeId: string;
  label: string;
  reason: string;
  priority: TopicPriority;
  isStartingNode: boolean;
}

export interface InterpretedPlan {
  title: string;
  summary: string;
  recommendedStartingNodeId: string;
  startingLevel: string;
  estimatedMinutes: number;
  topicPlans: TopicPlan[];
  rawGoalText: string;
  experienceLevel: ExperienceLevel;
  timePerSession: TimeOption;
  deadline?: string;
  strugglingTopics?: string[];
}
