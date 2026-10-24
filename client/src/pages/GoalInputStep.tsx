import React, { useState } from 'react';
import { Button } from '../components/Common/Button';
import { ArrowRightIcon } from '../components/Common/Icons';

const GOAL_CHIPS = [
  'Prepare for a technical interview',
  'Analyse real-world data',
  'Learn SQL for backend development',
  'Strengthen my fundamentals',
  'Practise JOINs and aggregation'
];

interface GoalInputStepProps {
  initialGoalText: string;
  onContinue: (goalText: string) => void;
}

export const GoalInputStep: React.FC<GoalInputStepProps> = ({
  initialGoalText,
  onContinue
}) => {
  const [goalText, setGoalText] = useState(initialGoalText);

  const handleChipClick = (chip: string) => {
    setGoalText((prev) => {
      if (!prev.trim()) return chip;
      if (prev.toLowerCase().includes(chip.toLowerCase())) return prev;
      return prev.trimEnd().replace(/[.,;]?$/, '') + '. ' + chip;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && goalText.trim().length > 5) {
      onContinue(goalText.trim());
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', padding: '3rem 1rem 2rem 1rem' }}>
      {/* Masthead */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-subtle)',
            fontWeight: 700,
            display: 'block',
            marginBottom: '0.6rem'
          }}
        >
          Prove-It Path
        </span>
        <h1
          style={{
            fontSize: '2.35rem',
            fontWeight: 700,
            margin: '0 0 0.75rem 0',
            lineHeight: 1.15,
            letterSpacing: '-0.02em'
          }}
        >
          What do you want to achieve?
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.55
          }}
        >
          Tell us what you're working towards. We'll help you build a learning path around it.
        </p>
      </div>

      {/* Goal Textarea */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}
      >
        <textarea
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="I have an SQL interview in two weeks. I know basic SELECT queries, but I struggle with JOINs and GROUP BY."
          rows={5}
          aria-label="Describe your learning goal"
          style={{
            width: '100%',
            padding: '1.25rem 1.5rem',
            fontFamily: 'var(--font-sans)',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            backgroundColor: 'transparent',
            color: 'var(--text-main)',
            minHeight: '130px'
          }}
        />

        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-surface-subtle)'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            {goalText.trim().length > 0
              ? `${goalText.trim().length} characters`
              : 'Describe your goal in your own words'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Cmd/Ctrl + Enter to continue
          </span>
        </div>
      </div>

      {/* Example Chips */}
      <div style={{ marginBottom: '2rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-subtle)',
            display: 'block',
            marginBottom: '0.65rem'
          }}
        >
          Or start with an idea:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {GOAL_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: goalText.toLowerCase().includes(chip.toLowerCase())
                  ? 'var(--bg-contrast)'
                  : 'var(--bg-surface)',
                color: goalText.toLowerCase().includes(chip.toLowerCase())
                  ? 'var(--text-inverse)'
                  : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.12s ease'
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Continue Action */}
      <div style={{ textAlign: 'center' }}>
        <Button
          variant="primary"
          size="lg"
          disabled={goalText.trim().length < 6}
          onClick={() => onContinue(goalText.trim())}
          icon={<ArrowRightIcon size={16} />}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
