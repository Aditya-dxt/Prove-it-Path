import React, { useState } from 'react';
import { LearningGoal } from '../types/contract';
import { InterpretedPlan } from '../types/onboarding';
import { interpretLearningGoal } from '../lib/goalInterpreter';
import { GoalInputStep } from './GoalInputStep';
import { ContextStep, ContextStepData } from './ContextStep';
import { PlanSummaryStep } from './PlanSummaryStep';

interface OnboardingPageProps {
  onConfirmGoal: (goal: LearningGoal) => void;
  initialGoal?: LearningGoal | null;
}

type OnboardingStep = 'input' | 'context' | 'summary';

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onConfirmGoal,
  initialGoal
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('input');
  const [rawGoalText, setRawGoalText] = useState<string>(
    initialGoal?.personalizedContext?.rawGoalText || ''
  );

  const [contextData, setContextData] = useState<ContextStepData>({
    experienceLevel: initialGoal?.personalizedContext?.experienceLevel || 'some_experience',
    timePerSession: initialGoal?.personalizedContext?.timePerSessionMinutes || 30,
    deadline: initialGoal?.personalizedContext?.deadline || '',
    strugglingTopics: initialGoal?.personalizedContext?.focusTopics || []
  });

  const [interpretedPlan, setInterpretedPlan] = useState<InterpretedPlan | null>(null);

  // Step 1 -> Step 2
  const handleGoalInputContinue = (text: string) => {
    setRawGoalText(text);
    setCurrentStep('context');
  };

  // Step 2 -> Step 3
  const handleContextContinue = (data: ContextStepData) => {
    setContextData(data);
    const plan = interpretLearningGoal({
      rawGoalText,
      experienceLevel: data.experienceLevel,
      timePerSession: data.timePerSession,
      deadline: data.deadline,
      strugglingTopics: data.strugglingTopics
    });
    setInterpretedPlan(plan);
    setCurrentStep('summary');
  };

  // Step 3 -> Workspace confirmation
  const handleConfirmPlan = () => {
    if (!interpretedPlan) return;

    const goal: LearningGoal = {
      id: `custom-${Date.now()}`,
      title: interpretedPlan.title,
      description: interpretedPlan.summary,
      estimatedMinutes: interpretedPlan.estimatedMinutes,
      personalizedContext: {
        rawGoalText: interpretedPlan.rawGoalText,
        experienceLevel: interpretedPlan.experienceLevel,
        timePerSessionMinutes: interpretedPlan.timePerSession,
        deadline: interpretedPlan.deadline,
        focusTopics: interpretedPlan.strugglingTopics,
        startingNodeId: interpretedPlan.recommendedStartingNodeId,
        rationale: interpretedPlan.startingLevel
      }
    };

    onConfirmGoal(goal);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentStep === 'input' && (
        <GoalInputStep
          initialGoalText={rawGoalText}
          onContinue={handleGoalInputContinue}
        />
      )}

      {currentStep === 'context' && (
        <ContextStep
          initialData={contextData}
          onBack={() => setCurrentStep('input')}
          onContinue={handleContextContinue}
        />
      )}

      {currentStep === 'summary' && interpretedPlan && (
        <PlanSummaryStep
          plan={interpretedPlan}
          onBack={() => setCurrentStep('context')}
          onEdit={() => setCurrentStep('input')}
          onConfirm={handleConfirmPlan}
        />
      )}
    </div>
  );
};
