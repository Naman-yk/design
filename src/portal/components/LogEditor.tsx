import React from 'react';
import { AutosaveStatus } from '../hooks/useAutosaveLog';
import { BookOpen, Check, Cloud, CloudOff, Loader2, Save } from 'lucide-react';

interface LogEditorProps {
  sections: string[];
  values: Record<string, string>;
  onChange: (sectionKey: string, value: string) => void;
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  onManualSave?: () => void;
  disabled?: boolean;
}

export const LogEditor: React.FC<LogEditorProps> = ({
  sections,
  values,
  onChange,
  status,
  lastSavedAt,
  onManualSave,
  disabled = false
}) => {
  const renderStatus = () => {
    switch (status) {
      case 'saving':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
            <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" />
            <span>Autosaving draft...</span>
          </span>
        );
      case 'saved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--byte-accent)' }}>
            <Check style={{ width: '13px', height: '13px' }} />
            <span>
              All changes saved{' '}
              {lastSavedAt ? `(${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
            </span>
          </span>
        );
      case 'error':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b' }}>
            <CloudOff style={{ width: '13px', height: '13px' }} />
            <span>Cloud sync delayed • Local backup active</span>
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <Cloud style={{ width: '13px', height: '13px' }} />
            <span>Local autosave active</span>
          </span>
        );
    }
  };

  return (
    <div
      className="byte-card"
      style={{
        padding: '1.75rem',
        marginBottom: '2rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Investigation & Reasoning Log
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Document your hypothesis, evidence, and architectural changes for reviewer evaluation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
          {renderStatus()}
          {onManualSave && (
            <button
              type="button"
              onClick={onManualSave}
              disabled={disabled || status === 'saving'}
              className="byte-btn byte-btn-secondary byte-btn-sm"
              style={{ padding: '0.25rem 0.6rem' }}
              title="Force save draft immediately"
            >
              <Save style={{ width: '12px', height: '12px' }} />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Sections inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {sections.map((section, idx) => {
          const val = values[section] || '';
          return (
            <div key={section}>
              <label
                htmlFor={`log-section-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.4rem'
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--byte-accent-bright)',
                    background: 'var(--byte-accent-tint)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}
                >
                  0{idx + 1}
                </span>
                <span>{section}</span>
              </label>

              <textarea
                id={`log-section-${idx}`}
                value={val}
                onChange={(e) => onChange(section, e.target.value)}
                disabled={disabled}
                placeholder={`Describe ${section.toLowerCase()}...`}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--byte-accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
