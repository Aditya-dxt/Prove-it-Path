import React from 'react';
import { RoadmapNodeStatus, LearnerState } from '../../types/contract';

interface BadgeProps {
  status?: RoadmapNodeStatus;
  state?: LearnerState;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, state, children, size = 'sm' }) => {
  let label = children;
  let bg = 'var(--bg-surface-subtle)';
  let color = 'var(--text-muted)';
  let border = 'var(--border-light)';

  if (status) {
    switch (status) {
      case 'showed_once':
        label = label || 'Showed it once';
        bg = 'var(--color-success-bg)';
        color = 'var(--color-success)';
        border = 'var(--color-success-border)';
        break;
      case 'repaired':
        label = label || 'Repaired';
        bg = 'var(--color-info-bg)';
        color = 'var(--color-info)';
        border = 'var(--color-info-border)';
        break;
      case 'recheck':
        label = label || 'Re-check';
        bg = 'var(--color-slip-bg)';
        color = 'var(--color-slip)';
        border = 'var(--color-slip-border)';
        break;
      case 'not_started':
      default:
        label = label || 'Not started';
        bg = 'var(--bg-surface-subtle)';
        color = 'var(--text-subtle)';
        border = 'var(--border-light)';
        break;
    }
  } else if (state) {
    switch (state) {
      case 'proven':
        label = label || 'Proven';
        bg = 'var(--color-success-bg)';
        color = 'var(--color-success)';
        border = 'var(--color-success-border)';
        break;
      case 'hidden_strength':
        label = label || 'Hidden Strength';
        bg = 'var(--color-success-bg)';
        color = 'var(--color-success)';
        border = 'var(--color-success-border)';
        break;
      case 'honest_gap':
        label = label || 'Honest Gap';
        bg = 'var(--color-gap-bg)';
        color = 'var(--color-gap)';
        border = 'var(--color-gap-border)';
        break;
      case 'mirage':
        label = label || 'Mirage';
        bg = 'var(--color-gap-bg)';
        color = 'var(--color-gap)';
        border = 'var(--color-gap-border)';
        break;
      case 'slip':
        label = label || 'Slip';
        bg = 'var(--color-slip-bg)';
        color = 'var(--color-slip)';
        border = 'var(--color-slip-border)';
        break;
    }
  }

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: isSmall ? '0.15rem 0.5rem' : '0.25rem 0.75rem',
        fontSize: isSmall ? '0.75rem' : '0.85rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.3,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </span>
  );
};
