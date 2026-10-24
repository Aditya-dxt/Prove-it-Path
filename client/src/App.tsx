import React, { useState } from 'react';
import { LEARNING_GOALS } from './lib/api';
import { LearningGoal, RoadmapNode } from './types/contract';

const INITIAL_ROADMAP: RoadmapNode[] = [
  { id: 'select', label: 'SELECT', status: 'not_started' },
  { id: 'where', label: 'WHERE with AND/OR', status: 'not_started' },
  { id: 'orderby', label: 'ORDER BY with LIMIT', status: 'not_started' },
  { id: 'groupby', label: 'GROUP BY with COUNT', status: 'not_started' },
  { id: 'join', label: 'JOIN', status: 'not_started' }
];

export const App: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);

  return (
    <div className="app-viewport" style={{ padding: '2rem 1.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '2rem'
      }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-subtle)',
            fontWeight: 600
          }}>
            Mastery-Driven SQL
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0 0 0', fontWeight: 600 }}>Prove-It Path</h1>
        </div>

        {selectedGoal && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--bg-surface-subtle)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Goal:</span>
            <strong style={{ fontSize: '0.85rem' }}>{selectedGoal.title}</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>~{selectedGoal.estimatedMinutes}m</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Roadmap Preview */}
        <section style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Adaptive Learning Roadmap</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>5 Core Competencies</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem'
          }}>
            {INITIAL_ROADMAP.map((node, index) => (
              <div key={node.id} style={{
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  Node 0{index + 1}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{node.label}</span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'inline-block',
                  marginTop: '0.25rem'
                }}>
                  Not started
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Goal Selection Showcase */}
        <section>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>Select your objective</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Choose a focused path. Prove-It Path will calibrate challenges and interventions to your target.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {LEARNING_GOALS.map((goal) => {
              const isSelected = selectedGoal?.id === goal.id;
              return (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  style={{
                    background: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                    border: isSelected ? '2px solid var(--border-dark)' : '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px',
                    transition: 'all 0.15s ease-in-out',
                    boxShadow: isSelected ? 'var(--shadow-card)' : 'none'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: isSelected ? 'var(--color-success)' : 'var(--text-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        ~{goal.estimatedMinutes} mins
                      </span>
                      {isSelected && (
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600
                        }}>
                          Selected
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{goal.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                      {goal.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '3rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-subtle)'
      }}>
        <span>Prove-It Path &bull; Frontend Scaffold (Milestone 1)</span>
        <span>Editorial Design System &bull; 1280&times;720 Desktop Optimized</span>
      </footer>
    </div>
  );
};

export default App;
