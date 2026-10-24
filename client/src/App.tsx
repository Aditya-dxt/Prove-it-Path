import React, { useState } from 'react';
import { LearningGoal } from './types/contract';
import { GoalSelectionPage } from './pages/GoalSelectionPage';
import { LearningWorkspacePage } from './pages/LearningWorkspacePage';

export const App: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [activeScreen, setActiveScreen] = useState<'goal_selection' | 'workspace'>('goal_selection');

  const handleConfirmGoal = (goal: LearningGoal) => {
    setSelectedGoal(goal);
    setActiveScreen('workspace');
  };

  const handleRestartGoal = () => {
    setActiveScreen('goal_selection');
  };

  return (
    <div className="app-viewport">
      {activeScreen === 'goal_selection' ? (
        <GoalSelectionPage
          initialSelectedGoal={selectedGoal}
          onConfirmGoal={handleConfirmGoal}
        />
      ) : selectedGoal ? (
        <LearningWorkspacePage
          goal={selectedGoal}
          onRestartGoal={handleRestartGoal}
        />
      ) : (
        <GoalSelectionPage onConfirmGoal={handleConfirmGoal} />
      )}
    </div>
  );
};

export default App;
