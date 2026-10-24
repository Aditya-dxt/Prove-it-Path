import React, { useState } from 'react';
import { TableSchema } from '../../types/contract';
import { DatabaseIcon, ChevronDownIcon, ChevronRightIcon } from '../Common/Icons';

interface SchemaViewerProps {
  schema: TableSchema[];
  isOpen: boolean;
  onToggle: () => void;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema, isOpen, onToggle }) => {
  const [showSampleData, setShowSampleData] = useState(true);

  return (
    <aside
      aria-label="Database Schema"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%'
      }}
    >
      {/* Schema Header with Toggle */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          background: 'var(--bg-surface-subtle)',
          borderBottom: isOpen ? '1px solid var(--border-light)' : 'none',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DatabaseIcon size={16} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Database Schema</span>
          <span
            style={{
              fontSize: '0.7rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)'
            }}
          >
            {schema.length} {schema.length === 1 ? 'table' : 'tables'}
          </span>
        </div>

        <button
          type="button"
          aria-label={isOpen ? 'Collapse schema' : 'Expand schema'}
          style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
        >
          {isOpen ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            maxHeight: 'calc(100vh - 350px)'
          }}
        >
          {schema.map((table) => (
            <div key={table.tableName} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Table Name */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--text-main)'
                  }}
                >
                  {table.tableName}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  ({table.columns.length} columns)
                </span>
              </div>

              {/* Column list table */}
              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.8rem',
                    textAlign: 'left'
                  }}
                >
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '0.4rem 0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>Column</th>
                      <th style={{ padding: '0.4rem 0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((col, idx) => (
                      <tr
                        key={col.name}
                        style={{
                          borderBottom: idx < table.columns.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)'
                        }}
                      >
                        <td style={{ padding: '0.35rem 0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                          {col.name}
                        </td>
                        <td style={{ padding: '0.35rem 0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {col.type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sample Rows Preview */}
              {table.sampleRows && table.sampleRows.length > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                  <div
                    onClick={() => setShowSampleData(!showSampleData)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.4rem',
                      userSelect: 'none'
                    }}
                  >
                    {showSampleData ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
                    <span>Sample records ({table.sampleRows.length} rows)</span>
                  </div>

                  {showSampleData && (
                    <div
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        overflowX: 'auto',
                        background: 'var(--bg-surface-subtle)'
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          textAlign: 'left'
                        }}
                      >
                        <thead>
                          <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-light)' }}>
                            {table.columns.map((col) => (
                              <th
                                key={col.name}
                                style={{
                                  padding: '0.35rem 0.5rem',
                                  color: 'var(--text-muted)',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {col.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.sampleRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              style={{
                                borderBottom: rIdx < table.sampleRows!.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                              }}
                            >
                              {table.columns.map((col) => (
                                <td
                                  key={col.name}
                                  style={{
                                    padding: '0.35rem 0.5rem',
                                    whiteSpace: 'nowrap',
                                    color: 'var(--text-main)'
                                  }}
                                >
                                  {String(row[col.name] ?? 'NULL')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
