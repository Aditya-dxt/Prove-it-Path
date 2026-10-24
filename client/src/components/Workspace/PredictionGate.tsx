import React from 'react';
import { Prediction } from '../../types/contract';
import { CheckIcon, AlertIcon } from '../Common/Icons';

interface PredictionGateProps {
  prediction: Prediction | null;
  onSelectPrediction: (prediction: Prediction) => void;
  isLocked: boolean; // Locked after query submission to prevent changing hindsight
  onResetPrediction?: () => void;
}

export const PredictionGate: React.FC<PredictionGateProps> = ({
  prediction,
  onSelectPrediction,
  isLocked,
  onResetPrediction
}) => {
  return (
    <div
      role="group"
      aria-labelledby="prediction-gate-title"
      style={{
        background: 'var(--bg-surface)',
        border: isLocked
          ? '1px solid var(--border-light)'
          : prediction
          ? '1px solid var(--border-dark)'
          : '1px solid var(--color-slip-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        backgroundColor: !prediction && !isLocked ? 'var(--color-slip-bg)' : 'var(--bg-surface)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span
            id="prediction-gate-title"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              display: 'block'
            }}
          >
            Step 1 of 2: Record confidence prediction
          </span>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            How confident are you that you can solve this task correctly?
          </p>
        </div>

        {isLocked && onResetPrediction && (
          <button
            type="button"
            onClick={onResetPrediction}
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Reset prediction
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* Option 1: I can do this */}
        <button
          type="button"
          onClick={() => !isLocked && onSelectPrediction('can_do')}
          disabled={isLocked}
          aria-pressed={prediction === 'can_do'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: prediction === 'can_do' ? 'var(--color-success-bg)' : 'var(--bg-surface-subtle)',
            border: prediction === 'can_do' ? '2px solid var(--color-success)' : '1px solid var(--border-light)',
            cursor: isLocked ? 'default' : 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: prediction === 'can_do' ? '2px solid var(--color-success)' : '2px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: prediction === 'can_do' ? 'var(--color-success)' : 'transparent',
              color: '#ffffff',
              flexShrink: 0
            }}
          >
            {prediction === 'can_do' && <CheckIcon size={12} color="#ffffff" />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
              I can do this
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Confident in the SQL pattern and syntax
            </div>
          </div>
        </button>

        {/* Option 2: Not sure yet */}
        <button
          type="button"
          onClick={() => !isLocked && onSelectPrediction('not_sure')}
          disabled={isLocked}
          aria-pressed={prediction === 'not_sure'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: prediction === 'not_sure' ? 'var(--color-slip-bg)' : 'var(--bg-surface-subtle)',
            border: prediction === 'not_sure' ? '2px solid var(--color-slip)' : '1px solid var(--border-light)',
            cursor: isLocked ? 'default' : 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: prediction === 'not_sure' ? '2px solid var(--color-slip)' : '2px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: prediction === 'not_sure' ? 'var(--color-slip)' : 'transparent',
              color: '#ffffff',
              flexShrink: 0
            }}
          >
            {prediction === 'not_sure' && <CheckIcon size={12} color="#ffffff" />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
              Not sure yet
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Testing an idea or exploring column names
            </div>
          </div>
        </button>
      </div>

      {!prediction && !isLocked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-slip)' }}>
          <AlertIcon size={13} color="var(--color-slip)" />
          <span>A confidence prediction is required before executing the query.</span>
        </div>
      )}

      {isLocked && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Prediction recorded as: <strong>{prediction === 'can_do' ? 'I can do this' : 'Not sure yet'}</strong> (locked for this attempt)
        </div>
      )}
    </div>
  );
};
