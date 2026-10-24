import React from 'react';
import { Task } from '../../types/contract';

interface TaskHeaderProps {
  task: Task;
  nodeLabel: string;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ task, nodeLabel }) => {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-subtle)'
            }}
          >
            Topic: {nodeLabel}
          </span>
          <span style={{ color: 'var(--border-light)' }}>&bull;</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Task ID: <code>{task.id}</code>
          </span>
        </div>

        <div
          style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-sm)',
            background: task.orderMatters ? 'var(--color-slip-bg)' : 'var(--bg-surface-subtle)',
            color: task.orderMatters ? 'var(--color-slip)' : 'var(--text-muted)',
            border: `1px solid ${task.orderMatters ? 'var(--color-slip-border)' : 'var(--border-light)'}`,
            fontWeight: 500
          }}
        >
          {task.orderMatters ? 'Result row order matters' : 'Result row order does not matter'}
        </div>
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0, lineHeight: 1.25 }}>
        {task.title}
      </h2>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
        {task.description}
      </p>
    </div>
  );
};
