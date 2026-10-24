import React from 'react';
import { EvaluationOutcome, Prediction } from '../../types/contract';
import { compareQueryResults, formatCellValue } from '../../lib/diffUtils';
import { Badge } from '../Common/Badge';

interface ResultComparisonViewProps {
  outcome: EvaluationOutcome;
  submittedSql: string;
  prediction: Prediction | null;
  orderMatters: boolean;
}

export const ResultComparisonView: React.FC<ResultComparisonViewProps> = ({
  outcome,
  submittedSql,
  prediction,
  orderMatters
}) => {
  const isError = Boolean(outcome.errorMessage);

  // Run row & column diff helper
  const comparison = !isError
    ? compareQueryResults(
        outcome.actualColumns,
        outcome.actualRows,
        outcome.expectedColumns,
        outcome.expectedRows,
        orderMatters
      )
    : null;

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
      {/* Header bar with Status & State Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Badge state={outcome.state} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Recorded prediction: <strong>{prediction === 'can_do' ? 'I can do this' : 'Not sure yet'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-light)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-subtle)'
            }}
          >
            Development Mock Outcome
          </span>
        </div>
      </div>

      {/* Submitted SQL */}
      <div>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-subtle)',
            display: 'block',
            marginBottom: '0.35rem'
          }}
        >
          Your Submitted Query
        </span>
        <pre
          style={{
            margin: 0,
            padding: '0.75rem 1rem',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            overflowX: 'auto'
          }}
        >
          <code>{submittedSql}</code>
        </pre>
      </div>

      {/* Execution Error Banner (if error occurred) */}
      {isError && (
        <div
          style={{
            background: 'var(--color-gap-bg)',
            border: '1px solid var(--color-gap-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            color: 'var(--color-gap)'
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
            SQL Execution Failure
          </div>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            {outcome.errorMessage}
          </code>
        </div>
      )}

      {/* Tabular Output Comparison (when no execution error) */}
      {!isError && comparison && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Column Mismatch Alert if any */}
          {(!comparison.columnsMatch || comparison.extraColumns.length > 0 || comparison.missingColumns.length > 0) && (
            <div
              style={{
                background: 'var(--color-gap-bg)',
                border: '1px solid var(--color-gap-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8rem',
                color: 'var(--color-gap)'
              }}
            >
              <strong>Column Schema Mismatch:</strong>
              {comparison.extraColumns.length > 0 && (
                <span> Extra columns returned: {comparison.extraColumns.map((c) => `"${c}"`).join(', ')}.</span>
              )}
              {comparison.missingColumns.length > 0 && (
                <span> Missing columns: {comparison.missingColumns.map((c) => `"${c}"`).join(', ')}.</span>
              )}
            </div>
          )}

          {/* Side by side Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* ACTUAL TABLE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  Actual Output ({outcome.actualRows.length} {outcome.actualRows.length === 1 ? 'row' : 'rows'})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {outcome.actualColumns.length} cols
                </span>
              </div>

              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  overflowX: 'auto',
                  background: 'var(--bg-surface)'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      {outcome.actualColumns.map((col) => {
                        const isExtra = comparison.extraColumns.includes(col);
                        return (
                          <th
                            key={col}
                            style={{
                              padding: '0.45rem 0.65rem',
                              fontWeight: 600,
                              color: isExtra ? 'var(--color-gap)' : 'var(--text-muted)',
                              backgroundColor: isExtra ? 'var(--color-gap-bg)' : 'transparent',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {col} {isExtra && <span style={{ fontSize: '0.65rem' }}>(extra)</span>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {outcome.actualRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={Math.max(outcome.actualColumns.length, 1)}
                          style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-subtle)' }}
                        >
                          (Empty result set)
                        </td>
                      </tr>
                    ) : (
                      outcome.actualRows.map((row, rIdx) => {
                        const diff = comparison.rowDiffs[rIdx];
                        const isMismatch = diff && diff.status === 'mismatch';
                        const isExtra = diff && diff.status === 'extra';

                        return (
                          <tr
                            key={rIdx}
                            style={{
                              borderBottom: rIdx < outcome.actualRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                              backgroundColor: isExtra
                                ? 'var(--color-gap-bg)'
                                : isMismatch
                                ? '#fff9f7'
                                : rIdx % 2 === 0
                                ? 'var(--bg-surface)'
                                : 'var(--bg-surface-subtle)'
                            }}
                          >
                            {row.map((cell, cIdx) => {
                              const formatted = formatCellValue(cell);
                              const cellDiff = diff?.cells?.[cIdx];
                              const cellMismatch = cellDiff?.isMismatch;

                              return (
                                <td
                                  key={cIdx}
                                  style={{
                                    padding: '0.45rem 0.65rem',
                                    fontFamily: 'var(--font-mono)',
                                    color: cellMismatch ? 'var(--color-gap)' : 'var(--text-main)',
                                    fontWeight: cellMismatch ? 600 : 400,
                                    backgroundColor: cellMismatch ? 'var(--color-gap-bg)' : 'transparent'
                                  }}
                                >
                                  {formatted.isNull ? (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        background: 'var(--bg-surface-subtle)',
                                        border: '1px solid var(--border-light)',
                                        padding: '0.05rem 0.35rem',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-subtle)'
                                      }}
                                    >
                                      NULL
                                    </span>
                                  ) : (
                                    formatted.text
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXPECTED TABLE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  Expected Output ({outcome.expectedRows.length} {outcome.expectedRows.length === 1 ? 'row' : 'rows'})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {outcome.expectedColumns.length} cols
                </span>
              </div>

              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  overflowX: 'auto',
                  background: 'var(--bg-surface)'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      {outcome.expectedColumns.map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: '0.45rem 0.65rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {outcome.expectedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={Math.max(outcome.expectedColumns.length, 1)}
                          style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-subtle)' }}
                        >
                          (Empty result set)
                        </td>
                      </tr>
                    ) : (
                      outcome.expectedRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          style={{
                            borderBottom: rIdx < outcome.expectedRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            background: rIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)'
                          }}
                        >
                          {row.map((cell, cIdx) => {
                            const formatted = formatCellValue(cell);
                            return (
                              <td
                                key={cIdx}
                                style={{
                                  padding: '0.45rem 0.65rem',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              >
                                {formatted.isNull ? (
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      background: 'var(--bg-surface-subtle)',
                                      border: '1px solid var(--border-light)',
                                      padding: '0.05rem 0.35rem',
                                      borderRadius: 'var(--radius-sm)',
                                      color: 'var(--text-subtle)'
                                    }}
                                  >
                                    NULL
                                  </span>
                                ) : (
                                  formatted.text
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
