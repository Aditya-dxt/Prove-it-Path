import React from 'react';
import { RoadmapNode } from '../../types/contract';
import { Badge } from '../Common/Badge';
import { ClockIcon, AlertIcon } from '../Common/Icons';

interface RoadmapViewProps {
  nodes: RoadmapNode[];
  activeNodeId: string;
  onSelectNode?: (nodeId: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ nodes, activeNodeId, onSelectNode }) => {
  const hasRecheckNode = nodes.some((n) => n.isRecheck || n.status === 'recheck');

  return (
    <section
      aria-label="Adaptive Learning Roadmap"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow-subtle)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-subtle)',
              fontWeight: 700
            }}
          >
            Adaptive Roadmap
          </span>
          {hasRecheckNode && (
            <span
              style={{
                fontSize: '0.7rem',
                background: 'var(--color-slip-bg)',
                color: 'var(--color-slip)',
                border: '1px solid var(--color-slip-border)',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <AlertIcon size={11} color="var(--color-slip)" />
              Re-check inserted
            </span>
          )}
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {nodes.length} Path Steps &bull; Evaluator Synchronized
        </span>
      </div>

      {/* Roadmap Nodes Grid */}
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
          const isRepaired = node.status === 'repaired';
          const isRecheck = Boolean(node.isRecheck || node.status === 'recheck');

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode && onSelectNode(node.id)}
              style={{
                position: 'relative',
                background: isActive
                  ? 'var(--bg-surface)'
                  : isRecheck
                  ? 'var(--color-slip-bg)'
                  : isShowedOnce || isRepaired
                  ? 'var(--color-success-bg)'
                  : 'var(--bg-surface-subtle)',
                border: isActive
                  ? '2px solid var(--border-dark)'
                  : isRecheck
                  ? '2px dashed var(--color-slip)'
                  : isShowedOnce || isRepaired
                  ? '1px solid var(--color-success-border)'
                  : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                cursor: onSelectNode ? 'pointer' : 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: isRecheck ? 'var(--color-slip)' : isActive ? 'var(--text-main)' : 'var(--text-subtle)',
                    textTransform: 'uppercase'
                  }}
                >
                  {isRecheck ? 'Re-check Step' : `Step 0${index + 1}`}
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
                  color: isRecheck ? 'var(--color-slip)' : 'var(--text-main)',
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

      {/* Adaptive Roadmap Explanation Note when Re-check is inserted */}
      {hasRecheckNode && (
        <div
          style={{
            padding: '0.6rem 0.85rem',
            background: 'var(--color-slip-bg)',
            border: '1px solid var(--color-slip-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ClockIcon size={14} color="var(--color-slip)" />
          <span>
            <strong>Adaptive Re-check inserted:</strong> A targeted verification step was dynamically scheduled following a confidence/result gap (Mirage). This ensures projection mastery before advancing.
          </span>
        </div>
      )}
    </section>
  );
};
