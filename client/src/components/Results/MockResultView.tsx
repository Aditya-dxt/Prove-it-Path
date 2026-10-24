import React from 'react';
import { EvaluationOutcome, Prediction } from '../../types/contract';
import { Badge } from '../Common/Badge';
import { Button } from '../Common/Button';
import { RefreshIcon, AlertIcon, CheckIcon } from '../Common/Icons';

interface MockResultViewProps {
  outcome: EvaluationOutcome;
  submittedSql: string;
  prediction: Prediction | null;
  onRetry: () => void;
}

export const MockResultView: React.FC<MockResultViewProps> = ({
  outcome,
  submittedSql,
  prediction,
  onRetry
}) => {
  const isError = Boolean(outcome.errorMessage);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      {/* Result Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: outcome.correct
                ? 'var(--color-success-bg)'
                : isError
                ? 'var(--color-slip-bg)'
                : 'var(--color-gap-bg)',
              color: outcome.correct
                ? 'var(--color-success)'
                : isError
                ? 'var(--color-slip)'
                : 'var(--color-gap)'
            }}
          >
            {outcome.correct ? (
              <CheckIcon size={18} />
            ) : (
              <AlertIcon size={18} />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                {outcome.correct ? 'Query Succeeded' : isError ? 'Execution Error' : 'Query Result Mismatch'}
              </span>
              <Badge state={outcome.state} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Confidence was recorded as: <strong>{prediction === 'can_do' ? 'I can do this' : 'Not sure yet'}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Development Mock Indicator */}
          <span
            style={{
              fontSize: '0.7rem',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-light)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-subtle)'
            }}
            title="Results provided by development mock adapter for presentation testing"
          >
            Development Mock
          </span>

          <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshIcon size={13} />}>
            Edit & Retry
          </Button>
        </div>
      </div>

      {/* Error Message if present */}
      {isError && outcome.errorMessage && (
        <div
          style={{
            background: 'var(--color-gap-bg)',
            border: '1px solid var(--color-gap-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--color-gap)',
            lineHeight: 1.5
          }}
        >
          {outcome.errorMessage}
        </div>
      )}

      {/* Diagnosis & Next Action */}
      <div
        style={{
          background: outcome.correct ? 'var(--color-success-bg)' : 'var(--bg-surface-subtle)',
          border: `1px solid ${outcome.correct ? 'var(--color-success-border)' : 'var(--border-light)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Diagnosis:</span>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
          {outcome.diagnosis}
        </p>
        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong>Next Action:</strong> {outcome.nextAction}
        </div>
      </div>

      {/* Submitted SQL Preview */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
          Submitted Query
        </span>
        <pre
          style={{
            margin: '0.35rem 0 0 0',
            padding: '0.75rem 1rem',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
            color: 'var(--text-main)'
          }}
        >
          <code>{submittedSql}</code>
        </pre>
      </div>

      {/* Result Grid: Actual Result vs Expected Result */}
      {!isError && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Actual Result Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Actual Output ({outcome.actualRows.length} rows)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {outcome.actualColumns.join(', ')}
              </span>
            </div>

            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-surface)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                    {outcome.actualColumns.map((col) => (
                      <th key={col} style={{ padding: '0.45rem 0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {outcome.actualRows.length === 0 ? (
                    <tr>
                      <td colSpan={Math.max(outcome.actualColumns.length, 1)} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
                        (Empty result set)
                      </td>
                    </tr>
                  ) : (
                    outcome.actualRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: rIdx < outcome.actualRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          background: rIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)'
                        }}
                      >
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                            {String(cell ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expected Result Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Expected Output ({outcome.expectedRows.length} rows)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {outcome.expectedColumns.join(', ')}
              </span>
            </div>

            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-surface)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                    {outcome.expectedColumns.map((col) => (
                      <th key={col} style={{ padding: '0.45rem 0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {outcome.expectedRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: rIdx < outcome.expectedRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        background: rIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)'
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                          {String(cell ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
