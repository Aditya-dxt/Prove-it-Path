import React, { useState } from 'react';
import { ContrastExample } from '../../types/contract';
import { Button } from '../Common/Button';
import { PlayIcon, CheckIcon } from '../Common/Icons';

interface ContrastRunnerProps {
  contrast: ContrastExample;
  onApplySqlToEditor?: (sql: string) => void;
}

export const ContrastRunner: React.FC<ContrastRunnerProps> = ({ contrast, onApplySqlToEditor }) => {
  const [hasExecuted, setHasExecuted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setHasExecuted(true);
    }, 350);
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}
    >
      {/* Contrast Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          background: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
            Contrast Example
          </span>
          {contrast.title && (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              &bull; {contrast.title}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!hasExecuted ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExecute}
              isLoading={isExecuting}
              icon={<PlayIcon size={12} />}
            >
              Run Contrast Query
            </Button>
          ) : (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-success)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <CheckIcon size={12} color="var(--color-success)" />
              Executed
            </span>
          )}

          {onApplySqlToEditor && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApplySqlToEditor(contrast.sql)}
              title="Copy this query into the SQL editor"
            >
              Copy to Editor
            </Button>
          )}
        </div>
      </div>

      {/* Description & Explanation */}
      <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {contrast.description}
        </p>

        {/* Contrast SQL block */}
        <div
          style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.85rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            overflowX: 'auto'
          }}
        >
          <code>{contrast.sql}</code>
        </div>

        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
          <strong>Takeaway:</strong> {contrast.explanation}
        </p>

        {/* Executed Result Table Preview */}
        {hasExecuted && (
          <div
            style={{
              marginTop: '0.5rem',
              border: '1px solid var(--color-success-border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: 'var(--bg-surface)'
            }}
          >
            <div
              style={{
                padding: '0.35rem 0.65rem',
                background: 'var(--color-success-bg)',
                borderBottom: '1px solid var(--color-success-border)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-success)',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Contrast Output (Filtered to requested columns)</span>
              <span>2 columns &bull; 5 rows</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)' }}>name</th>
                  <th style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)' }}>department</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.35rem 0.5rem', fontFamily: 'var(--font-mono)' }}>Alice Chen</td>
                  <td style={{ padding: '0.35rem 0.5rem', fontFamily: 'var(--font-mono)' }}>Engineering</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '0.35rem 0.5rem', fontFamily: 'var(--font-mono)' }}>Bob Smith</td>
                  <td style={{ padding: '0.35rem 0.5rem', fontFamily: 'var(--font-mono)' }}>Analytics</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ padding: '0.35rem 0.5rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                    + 3 additional rows
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
