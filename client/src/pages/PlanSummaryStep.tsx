import React from 'react';
import { Button } from '../components/Common/Button';
import { ArrowRightIcon, ClockIcon } from '../components/Common/Icons';
import type { InterpretedPlan, TopicPriority } from '../types/onboarding';

interface PlanSummaryStepProps {
  plan: InterpretedPlan;
  onConfirm: () => void;
  onBack: () => void;
  onEdit: () => void;
}

const PRIORITY_LABELS: Record<TopicPriority, { text: string; bg: string; color: string; border: string }> = {
  focus: {
    text: 'Focus',
    bg: 'var(--color-gap-bg)',
    color: 'var(--color-gap)',
    border: 'var(--color-gap-border)'
  },
  core: {
    text: 'Core',
    bg: 'var(--color-info-bg)',
    color: 'var(--color-info)',
    border: 'var(--color-info-border)'
  },
  advanced: {
    text: 'Advanced',
    bg: 'var(--color-slip-bg)',
    color: 'var(--color-slip)',
    border: 'var(--color-slip-border)'
  },
  foundation: {
    text: 'Foundation',
    bg: 'var(--bg-surface-subtle)',
    color: 'var(--text-subtle)',
    border: 'var(--border-light)'
  }
};

export const PlanSummaryStep: React.FC<PlanSummaryStepProps> = ({
  plan,
  onConfirm,
  onBack,
  onEdit
}) => {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', padding: '3rem 1rem 2rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
          Step 3 of 3
        </span>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0 0 0.65rem 0',
            lineHeight: 1.15,
            letterSpacing: '-0.02em'
          }}
        >
          Your learning plan
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.55
          }}
        >
          Review the plan below. You can go back to adjust your inputs.
        </p>
      </div>

      {/* Plan Overview Card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <h2
          style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            lineHeight: 1.25
          }}
        >
          {plan.title}
        </h2>
        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-muted)',
            margin: '0 0 1rem 0',
            lineHeight: 1.55
          }}
        >
          {plan.summary}
        </p>

        {/* Meta Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ClockIcon size={13} />
            ~{plan.estimatedMinutes} min session
          </span>
          <span>Level: <strong style={{ color: 'var(--text-main)' }}>{plan.startingLevel}</strong></span>
          {plan.deadline && (
            <span>Deadline: <strong style={{ color: 'var(--text-main)' }}>{plan.deadline}</strong></span>
          )}
        </div>
      </div>

      {/* Original Goal */}
      <div
        style={{
          background: 'var(--bg-surface-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: 1.55,
          borderLeft: '3px solid var(--border-light)'
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.3rem' }}>
          Your goal
        </span>
        "{plan.rawGoalText}"
      </div>

      {/* Topic Plan Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-main)',
            marginBottom: '0.75rem'
          }}
        >
          Topic breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {plan.topicPlans.map((topic) => {
            const priorityStyle = PRIORITY_LABELS[topic.priority];
            const isStarting = topic.isStartingNode;

            return (
              <div
                key={topic.nodeId}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '0.9rem 1rem',
                  border: isStarting ? '2px solid var(--border-dark)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  background: isStarting ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                  boxShadow: isStarting ? 'var(--shadow-card)' : 'none'
                }}
              >
                {/* Starting indicator */}
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isStarting ? 'var(--color-success)' : 'var(--border-light)',
                    marginTop: '0.45rem',
                    flexShrink: 0
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      {topic.label}
                    </span>
                    {/* Priority Badge */}
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.1rem 0.45rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: priorityStyle.bg,
                        color: priorityStyle.color,
                        border: `1px solid ${priorityStyle.border}`,
                        letterSpacing: '0.02em'
                      }}
                    >
                      {priorityStyle.text}
                    </span>
                    {isStarting && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.1rem 0.45rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                          border: '1px solid var(--color-success-border)',
                          letterSpacing: '0.02em'
                        }}
                      >
                        Start here
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {topic.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interpretation Transparency */}
      <div
        style={{
          padding: '0.7rem 0.85rem',
          marginBottom: '2rem',
          fontSize: '0.78rem',
          color: 'var(--text-subtle)',
          background: 'var(--bg-surface-subtle)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          lineHeight: 1.5
        }}
      >
        This plan was generated using keyword-based interpretation of your goal.
        The adaptive engine will further calibrate as you practise.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="md" onClick={onBack}>
            ← Back
          </Button>
          <Button variant="outline" size="md" onClick={onEdit}>
            Edit inputs
          </Button>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={onConfirm}
          icon={<ArrowRightIcon size={16} />}
        >
          Start learning
        </Button>
      </div>
    </div>
  );
};
