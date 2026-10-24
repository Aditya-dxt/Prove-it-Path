import React, { useState } from 'react';
import { LearningGoal } from './types/contract';
import { OnboardingPage } from './pages/OnboardingPage';
import { LearningWorkspacePage } from './pages/LearningWorkspacePage';

export const App: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [activeScreen, setActiveScreen] = useState<'onboarding' | 'workspace'>('onboarding');

  const handleConfirmGoal = (goal: LearningGoal) => {
    setSelectedGoal(goal);
    setActiveScreen('workspace');
  };

  const handleRestartGoal = () => {
    setActiveScreen('onboarding');
  };

  return (
    <div className="app-viewport">
      {activeScreen === 'onboarding' ? (
        <OnboardingPage
          initialGoal={selectedGoal}
          onConfirmGoal={handleConfirmGoal}
        />
      ) : selectedGoal ? (
        <LearningWorkspacePage
          goal={selectedGoal}
          onRestartGoal={handleRestartGoal}
        />
      ) : (
        <OnboardingPage onConfirmGoal={handleConfirmGoal} />
      )}
    </div>
  );
};

export default App;
