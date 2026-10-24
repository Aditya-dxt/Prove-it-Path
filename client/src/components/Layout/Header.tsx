import React from 'react';
import { LearningGoal } from '../../types/contract';
import { ClockIcon, RefreshIcon } from '../Common/Icons';
import { Button } from '../Common/Button';

interface HeaderProps {
  goal: LearningGoal | null;
  remainingMinutes?: number;
  onRestartGoal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ goal, remainingMinutes, onRestartGoal }) => {
  const displayMinutes = remainingMinutes ?? (goal ? goal.estimatedMinutes : 45);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 0',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
        <div>
          <span
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-subtle)',
              fontWeight: 600,
              display: 'block',
              lineHeight: 1
            }}
          >
            Mastery-Driven SQL
          </span>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: '0.2rem 0 0 0',
              lineHeight: 1.2
            }}
          >
            Prove-It Path
          </h1>
        </div>
      </div>

      {goal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Active Goal Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-surface-subtle)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Goal:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{goal.title}</span>
          </div>

          {/* Remaining Time Estimate */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)'
            }}
            title="Estimated time based on initial goal and current progress"
          >
            <ClockIcon size={14} color="var(--text-subtle)" />
            <span>~{displayMinutes} mins remaining</span>
          </div>

          {/* Change Goal / Restart Action */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestartGoal}
            icon={<RefreshIcon size={13} />}
            title="Return to goal selection to change objective"
          >
            Change Goal
          </Button>
        </div>
      )}
    </header>
  );
};
