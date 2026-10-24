import React, { useState } from 'react';
import { LearningGoal } from '../types/contract';
import { LEARNING_GOALS } from '../data/goals';
import { Button } from '../components/Common/Button';
import { ArrowRightIcon, CheckIcon, ClockIcon } from '../components/Common/Icons';

interface GoalSelectionPageProps {
  initialSelectedGoal?: LearningGoal | null;
  onConfirmGoal: (goal: LearningGoal) => void;
}

export const GoalSelectionPage: React.FC<GoalSelectionPageProps> = ({
  initialSelectedGoal = null,
  onConfirmGoal
}) => {
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(initialSelectedGoal);

  const handleKeyDown = (e: React.KeyboardEvent, goal: LearningGoal) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedGoal(goal);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', padding: '2rem 1rem' }}>
      {/* Editorial Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-subtle)',
            fontWeight: 700
          }}
        >
          Adaptive Learning Pathway
        </span>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            margin: '0.5rem 0 0.75rem 0',
            lineHeight: 1.2
          }}
        >
          Select your learning objective
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: 1.5
          }}
        >
          Prove-It Path calibrates task complexity, diagnostic evaluations, and adaptive interventions to your goal.
        </p>
      </div>

      {/* Goal Cards Grid */}
      <div
        role="radiogroup"
        aria-label="Learning Objectives"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        {LEARNING_GOALS.map((goal) => {
          const isSelected = selectedGoal?.id === goal.id;

          return (
            <div
              key={goal.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => setSelectedGoal(goal)}
              onKeyDown={(e) => handleKeyDown(e, goal)}
              style={{
                background: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                border: isSelected ? '2px solid var(--border-dark)' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px',
                transition: 'all 0.15s ease-in-out',
                boxShadow: isSelected ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
                position: 'relative'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      color: isSelected ? 'var(--text-main)' : 'var(--text-subtle)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    <ClockIcon size={13} />
                    <span>~{goal.estimatedMinutes} mins estimate</span>
                  </div>

                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid var(--border-dark)' : '2px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'var(--border-dark)' : 'transparent',
                      color: '#ffffff',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected && <CheckIcon size={12} color="#ffffff" />}
                  </div>
                </div>

                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                  {goal.title}
                </h2>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {goal.description}
                </p>
              </div>

              {isSelected && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <CheckIcon size={13} color="var(--color-success)" />
                  <span>Selected objective</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start Learning Action */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <Button
          variant="primary"
          size="lg"
          disabled={!selectedGoal}
          onClick={() => selectedGoal && onConfirmGoal(selectedGoal)}
          icon={<ArrowRightIcon size={16} />}
        >
          Start learning
        </Button>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          {selectedGoal
            ? `Ready to begin with ${selectedGoal.title}.`
            : 'Select a learning goal to enter the workspace.'}
        </span>
      </div>
    </div>
  );
};
