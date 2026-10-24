import React from 'react';
import { RoadmapNode } from '../../types/contract';
import { Badge } from '../Common/Badge';

interface RoadmapViewProps {
  nodes: RoadmapNode[];
  activeNodeId: string;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ nodes, activeNodeId }) => {
  return (
    <section
      aria-label="Learning Roadmap"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow-subtle)',
        marginBottom: '1.5rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.85rem'
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-subtle)',
            fontWeight: 600
          }}
        >
          Adaptive Roadmap
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          5 Core Competencies
        </span>
      </div>

      <nav
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))`,
          gap: '0.65rem'
        }}
      >
        {nodes.map((node, index) => {
          const isActive = node.id === activeNodeId;
          const isShowedOnce = node.status === 'showed_once';

          return (
            <div
              key={node.id}
              style={{
                position: 'relative',
                background: isActive
                  ? 'var(--bg-surface)'
                  : isShowedOnce
                  ? 'var(--color-success-bg)'
                  : 'var(--bg-surface-subtle)',
                border: isActive
                  ? '2px solid var(--border-dark)'
                  : isShowedOnce
                  ? '1px solid var(--color-success-border)'
                  : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? 'var(--shadow-card)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: isActive ? 'var(--text-main)' : 'var(--text-subtle)',
                    textTransform: 'uppercase'
                  }}
                >
                  Step 0{index + 1}
                </span>

                {isActive && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--text-main)',
                      color: 'var(--text-inverse)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}
                  >
                    Active
                  </span>
                )}
              </div>

              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  lineHeight: 1.25,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={node.label}
              >
                {node.label}
              </div>

              <div style={{ marginTop: '0.15rem' }}>
                <Badge status={node.status} size="sm" />
              </div>
            </div>
          );
        })}
      </nav>
    </section>
  );
};
