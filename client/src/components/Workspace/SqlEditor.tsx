import React, { useRef, useEffect } from 'react';
import { Prediction } from '../../types/contract';
import { Button } from '../Common/Button';
import { PlayIcon, RefreshIcon } from '../Common/Icons';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  prediction: Prediction | null;
  isRunning: boolean;
  onRunQuery: () => void;
  onResetStarter: () => void;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  prediction,
  isRunning,
  onRunQuery,
  onResetStarter
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canRun = Boolean(prediction) && !isRunning;

  // Keyboard shortcut: Cmd+Enter (Mac) or Ctrl+Enter (Win/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (canRun) {
          e.preventDefault();
          onRunQuery();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRun, onRunQuery]);

  const lineCount = Math.max(value.split('\n').length, 5);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Editor Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          background: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)'
            }}
          >
            SQL QUERY
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            (Cmd/Ctrl + Enter to run)
          </span>
        </div>

        <button
          type="button"
          onClick={onResetStarter}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          title="Restore original starter query"
        >
          <RefreshIcon size={12} />
          <span>Reset to starter</span>
        </button>
      </div>

      {/* Editor Body with Monospace & Line Numbers */}
      <div style={{ display: 'flex', position: 'relative', background: '#faf9f6' }}>
        {/* Line Numbers */}
        <div
          aria-hidden="true"
          style={{
            userSelect: 'none',
            padding: '1rem 0.65rem',
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            color: 'var(--text-subtle)',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-subtle)',
            minWidth: '40px'
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="-- Write your SQL query here"
          spellCheck={false}
          style={{
            flex: 1,
            width: '100%',
            minHeight: '150px',
            padding: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            backgroundColor: 'transparent',
            color: 'var(--text-main)',
            tabSize: 2
          }}
          aria-label="SQL Query Input"
        />
      </div>

      {/* Bottom Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'var(--bg-surface-subtle)',
          borderTop: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {!prediction ? (
            <span style={{ color: 'var(--color-slip)', fontWeight: 500 }}>
              &larr; Select your confidence above before running the query.
            </span>
          ) : (
            <span>Ready to execute against dataset.</span>
          )}
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={onRunQuery}
          disabled={!canRun}
          isLoading={isRunning}
          icon={<PlayIcon size={14} />}
          title={!prediction ? 'Select confidence prediction above first' : 'Execute query (Cmd + Enter)'}
        >
          {isRunning ? 'Executing query...' : 'Run query'}
        </Button>
      </div>
    </div>
  );
};
