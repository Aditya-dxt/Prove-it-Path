import React from 'react';
import { EvaluationOutcome, Prediction, ContrastExample } from '../../types/contract';
import { ContrastRunner } from './ContrastRunner';
import { AiStatusBadge } from './AiStatusBadge';
import { Button } from '../Common/Button';
import { ArrowRightIcon, RefreshIcon, AlertIcon, CheckIcon } from '../Common/Icons';

interface InterventionPanelProps {
  outcome: EvaluationOutcome;
  prediction: Prediction | null;
  contrastExample?: ContrastExample;
  hasVariantTask: boolean;
  onRetryTask: () => void;
  onLaunchVariantTask?: () => void;
  onApplyContrastSql?: (sql: string) => void;
  aiExplanation?: {
    text: string;
    source: 'ai' | 'template';
    fallbackUsed: boolean;
  } | null;
}

export const InterventionPanel: React.FC<InterventionPanelProps> = ({
  outcome,
  prediction,
  contrastExample,
  hasVariantTask,
  onRetryTask,
  onLaunchVariantTask,
  onApplyContrastSql,
  aiExplanation
}) => {
  const { state, diagnosis, nextAction } = outcome;

  // 1. Slip State: Minor typo or syntax issue (not a conceptual misconception)
  if (state === 'slip') {
    return (
      <div
        style={{
          background: 'var(--color-slip-bg)',
          border: '1px solid var(--color-slip-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertIcon size={18} color="var(--color-slip)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-slip)', fontWeight: 600 }}>
            Query Slip: Syntax or Keyword Placement
          </h3>
        </div>

        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          {diagnosis}
        </p>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Correction Hint:</strong> {nextAction}
        </div>

        <div>
          <Button variant="primary" size="sm" onClick={onRetryTask} icon={<RefreshIcon size={13} />}>
            Edit and Fix Syntax
          </Button>
        </div>
      </div>
    );
  }

  // 2. Proven State: High confidence & correct
  if (state === 'proven') {
    return (
      <div
        style={{
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckIcon size={18} color="var(--color-success)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-success)', fontWeight: 600 }}>
              Demonstrated Accurately &bull; Showed it once
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)' }}>
            High confidence verified
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          {diagnosis}
        </p>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Next Action:</strong> {nextAction}
        </div>
      </div>
    );
  }

  // 3. Hidden Strength State: Low confidence & correct
  if (state === 'hidden_strength') {
    return (
      <div
        style={{
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckIcon size={18} color="var(--color-success)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-success)', fontWeight: 600 }}>
              Hidden Strength &bull; You showed you could solve this one
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)' }}>
            Exceeded prediction
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          You predicted uncertainty beforehand, but your query produced the exact expected output. Trust your reasoning as you advance.
        </p>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Next Action:</strong> {nextAction}
        </div>
      </div>
    );
  }

  // 4. Mirage State: High confidence & incorrect (Overconfidence gap)
  if (state === 'mirage') {
    return (
      <div
        style={{
          background: 'var(--color-gap-bg)',
          border: '1px solid var(--color-gap-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Banner Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertIcon size={18} color="var(--color-gap)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-gap)', fontWeight: 600 }}>
              Calibration Gap: Result Mismatch (Mirage)
            </h3>
          </div>

          {aiExplanation && (
            <AiStatusBadge
              source={aiExplanation.source}
              fallbackUsed={aiExplanation.fallbackUsed}
            />
          )}
        </div>

        {/* Narrative */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
            You predicted {prediction === 'can_do' ? 'high confidence ("I can do this")' : 'uncertainty ("Not sure yet")'}, but your submitted query produced extra or mismatched data. This is a common pattern when transitioning from full table inspection to strict schema projections.
          </p>

          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}
          >
            <strong>Grounded Diagnosis:</strong> {diagnosis}
          </div>
        </div>

        {/* Adaptive Roadmap Notice */}
        <div
          style={{
            background: 'var(--color-slip-bg)',
            border: '1px solid var(--color-slip-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slip)', textTransform: 'uppercase' }}>
            Adaptive Roadmap Update:
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
            A <strong>Re-check</strong> step was added to your roadmap to verify this concept before moving past SELECT. Estimated time adjusted to {outcome.remainingMinutes}m.
          </span>
        </div>

        {/* Contrast Example */}
        {contrastExample && (
          <ContrastRunner
            contrast={contrastExample}
            onApplySqlToEditor={onApplyContrastSql}
          />
        )}

        {/* Primary Next Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.5rem' }}>
          {hasVariantTask && onLaunchVariantTask && (
            <Button
              variant="primary"
              size="md"
              onClick={onLaunchVariantTask}
              icon={<ArrowRightIcon size={14} />}
            >
              Try a similar question (Variant Task)
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={onRetryTask}
            icon={<RefreshIcon size={13} />}
          >
            Return to Editor &amp; Retry Current Task
          </Button>
        </div>
      </div>
    );
  }

  // 5. Honest Gap State: Low confidence & incorrect
  return (
    <div
      style={{
        background: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertIcon size={18} color="var(--text-muted)" />
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Conceptual Gap (Honest Gap)
          </h3>
        </div>

        {aiExplanation && (
          <AiStatusBadge
            source={aiExplanation.source}
            fallbackUsed={aiExplanation.fallbackUsed}
          />
        )}
      </div>

      <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Good instinct to indicate uncertainty (<em>"Not sure yet"</em>). This lets the system provide focused guidance without punitive tracking.
      </p>

      <div
        style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          fontSize: '0.875rem'
        }}
      >
        <strong>Diagnosis:</strong> {diagnosis}
      </div>

      {contrastExample && (
        <ContrastRunner
          contrast={contrastExample}
          onApplySqlToEditor={onApplyContrastSql}
        />
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {hasVariantTask && onLaunchVariantTask && (
          <Button
            variant="primary"
            size="md"
            onClick={onLaunchVariantTask}
            icon={<ArrowRightIcon size={14} />}
          >
            Try a similar question
          </Button>
        )}

        <Button
          variant="secondary"
          size="md"
          onClick={onRetryTask}
          icon={<RefreshIcon size={13} />}
        >
          Edit &amp; Retry
        </Button>
      </div>
    </div>
  );
};
