import React, { useState } from 'react';
import { Button } from '../components/Common/Button';
import { ArrowRightIcon } from '../components/Common/Icons';
import type { ExperienceLevel, TimeOption } from '../types/onboarding';

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to SQL or just started learning' },
  { value: 'some_experience', label: 'Some experience', description: 'Written basic queries before' },
  { value: 'comfortable', label: 'Comfortable', description: 'Use SQL regularly, want to sharpen skills' }
];

const TIME_OPTIONS: { value: TimeOption; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' }
];

const TOPIC_OPTIONS = [
  { id: 'select', label: 'SELECT basics' },
  { id: 'where', label: 'WHERE / filtering' },
  { id: 'orderby', label: 'ORDER BY / LIMIT' },
  { id: 'groupby', label: 'GROUP BY / aggregation' },
  { id: 'join', label: 'JOINs' }
];

export interface ContextStepData {
  experienceLevel: ExperienceLevel;
  timePerSession: TimeOption;
  deadline: string;
  strugglingTopics: string[];
}

interface ContextStepProps {
  initialData: ContextStepData;
  onContinue: (data: ContextStepData) => void;
  onBack: () => void;
}

export const ContextStep: React.FC<ContextStepProps> = ({
  initialData,
  onContinue,
  onBack
}) => {
  const [experience, setExperience] = useState<ExperienceLevel>(initialData.experienceLevel);
  const [time, setTime] = useState<TimeOption>(initialData.timePerSession);
  const [deadline, setDeadline] = useState(initialData.deadline);
  const [topics, setTopics] = useState<Set<string>>(new Set(initialData.strugglingTopics));
  const [showOptional, setShowOptional] = useState(
    Boolean(initialData.deadline || initialData.strugglingTopics.length)
  );

  const toggleTopic = (id: string) => {
    setTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    onContinue({
      experienceLevel: experience,
      timePerSession: time,
      deadline: deadline.trim(),
      strugglingTopics: Array.from(topics)
    });
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: '3rem 1rem 2rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
        <span
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-subtle)',
            fontWeight: 700,
            display: 'block',
            marginBottom: '0.6rem'
          }}
        >
          Step 2 of 3
        </span>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0 0 0.65rem 0',
            lineHeight: 1.15,
            letterSpacing: '-0.02em'
          }}
        >
          A bit about you
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '460px',
            margin: '0 auto',
            lineHeight: 1.55
          }}
        >
          This helps us calibrate the starting difficulty and session length.
        </p>
      </div>

      {/* Experience Level */}
      <fieldset
        style={{ border: 'none', marginBottom: '1.75rem' }}
        aria-label="Your SQL experience level"
      >
        <legend
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-main)',
            marginBottom: '0.65rem',
            display: 'block'
          }}
        >
          Current experience
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {EXPERIENCE_OPTIONS.map((opt) => {
            const isSelected = experience === opt.value;
            return (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  border: isSelected ? '2px solid var(--border-dark)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                  boxShadow: isSelected ? 'var(--shadow-card)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                <input
                  type="radio"
                  name="experience"
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => setExperience(opt.value)}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--text-main)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {opt.description}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Time Per Session */}
      <fieldset
        style={{ border: 'none', marginBottom: '1.75rem' }}
        aria-label="Time available per session"
      >
        <legend
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-main)',
            marginBottom: '0.65rem',
            display: 'block'
          }}
        >
          Time per session
        </legend>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {TIME_OPTIONS.map((opt) => {
            const isSelected = time === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTime(opt.value)}
                aria-pressed={isSelected}
                style={{
                  flex: 1,
                  padding: '0.65rem 0',
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? '2px solid var(--border-dark)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--bg-contrast)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--text-inverse)' : 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Optional Fields — Progressive Disclosure */}
      {!showOptional ? (
        <button
          type="button"
          onClick={() => setShowOptional(true)}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.65rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border-light)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            marginBottom: '2rem',
            cursor: 'pointer'
          }}
        >
          + Add deadline or specific topics (optional)
        </button>
      ) : (
        <div
          style={{
            marginBottom: '2rem',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            background: 'var(--bg-surface-subtle)'
          }}
        >
          {/* Deadline */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="deadline-input"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-main)',
                display: 'block',
                marginBottom: '0.4rem'
              }}
            >
              Deadline <span style={{ fontWeight: 400, color: 'var(--text-subtle)', textTransform: 'none' }}>optional</span>
            </label>
            <input
              id="deadline-input"
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g. 2 weeks, next Monday"
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          {/* Struggling Topics */}
          <div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-main)',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              Topics you find tricky <span style={{ fontWeight: 400, color: 'var(--text-subtle)', textTransform: 'none' }}>optional</span>
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {TOPIC_OPTIONS.map((opt) => {
                const isActive = topics.has(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleTopic(opt.id)}
                    aria-pressed={isActive}
                    style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      border: isActive ? '1.5px solid var(--border-dark)' : '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--bg-contrast)' : 'var(--bg-surface)',
                      color: isActive ? 'var(--text-inverse)' : 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="md" onClick={onBack}>
          ← Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          icon={<ArrowRightIcon size={16} />}
        >
          Build my plan
        </Button>
      </div>
    </div>
  );
};
