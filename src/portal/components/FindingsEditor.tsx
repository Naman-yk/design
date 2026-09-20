import React, { useState } from 'react';
import { FindingRow, RuleOption } from '../types/api';
import {
  Plus,
  Trash2,
  Copy,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Code,
  Sliders
} from 'lucide-react';

interface FindingsEditorProps {
  findings: FindingRow[];
  onChange: (findings: FindingRow[]) => void;
  ruleOptions: RuleOption[];
  minFindings?: number;
  disabled?: boolean;
}

export const FindingsEditor: React.FC<FindingsEditorProps> = ({
  findings,
  onChange,
  ruleOptions,
  minFindings = 3,
  disabled = false
}) => {
  const [showRubric, setShowRubric] = useState(false);

  const handleAddRow = () => {
    const newRow: FindingRow = {
      id: Math.random().toString(36).slice(2, 9),
      ruleId: ruleOptions[0]?.id || '',
      selector: '',
      evidence: '',
      severity: 'medium',
      why: '',
      suggestedFix: ''
    };
    onChange([...findings, newRow]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = findings[index];
    const duplicated: FindingRow = {
      ...target,
      id: Math.random().toString(36).slice(2, 9)
    };
    const next = [...findings];
    next.splice(index + 1, 0, duplicated);
    onChange(next);
  };

  const handleDeleteRow = (index: number) => {
    if (findings.length <= 1) return;
    const next = findings.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleFieldChange = (index: number, field: keyof FindingRow, value: any) => {
    const next = [...findings];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const countValid = findings.filter(
    (f) => f.ruleId && f.selector.trim() && f.evidence.trim() && f.why.trim() && f.suggestedFix.trim()
  ).length;

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header with counter and rubric trigger */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
            Specimen Inspection Findings Table
          </h3>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Document discrete defects discovered during your specimen inspection.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Completeness badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              background: countValid >= minFindings ? 'var(--status-passed-bg)' : 'rgba(234, 179, 8, 0.12)',
              border: `1px solid ${countValid >= minFindings ? 'var(--status-passed-border)' : 'var(--status-queued-border)'}`,
              color: countValid >= minFindings ? 'var(--status-passed)' : 'var(--status-queued)'
            }}
          >
            {countValid >= minFindings ? (
              <CheckCircle2 style={{ width: '13px', height: '13px' }} />
            ) : (
              <AlertTriangle style={{ width: '13px', height: '13px' }} />
            )}
            <span>
              {countValid} / {minFindings} Required Findings Complete
            </span>
          </div>

          {/* Rubric toggle button */}
          <button
            type="button"
            onClick={() => setShowRubric(!showRubric)}
            className="byte-btn byte-btn-secondary byte-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <HelpCircle style={{ width: '13px', height: '13px' }} />
            <span>Severity Rubric</span>
          </button>
        </div>
      </div>

      {/* Rubric Guide Callout */}
      {showRubric && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-accent)',
            marginBottom: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--byte-accent-bright)', marginBottom: '0.5rem' }}>
            Severity Calibration Rubric
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.8rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: '0.25rem' }}>HIGH SEVERITY</div>
              <div>Complete functionality block, keyboard trap escape failure, catastrophic layout collapse, or WCAG Level A violation.</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ color: '#f59e0b', fontWeight: 700, marginBottom: '0.25rem' }}>MEDIUM SEVERITY</div>
              <div>Sub-optimal contrast (WCAG AA), missing ARIA landmarks, unoptimized asset waterfall, or inconsistent touch target size.</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.25rem' }}>LOW SEVERITY</div>
              <div>Cosmetic misalignment, non-critical typography scaling edge cases, or redundant meta tags.</div>
            </div>
          </div>
        </div>
      )}

      {/* Finding Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {findings.map((finding, idx) => (
          <div
            key={finding.id || idx}
            className="byte-card"
            style={{
              padding: 'clamp(1rem, 2.5vw, 1.5rem)',
              border: '1px solid var(--border-medium)',
              position: 'relative'
            }}
          >
            {/* Top row: Number, Rule selector, Severity, Actions */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 220px', minWidth: 0 }}>
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'rgba(34, 197, 121, 0.15)',
                    color: 'var(--byte-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  #{idx + 1}
                </span>

                {/* Rule dropdown */}
                <select
                  value={finding.ruleId}
                  onChange={(e) => handleFieldChange(idx, 'ruleId', e.target.value)}
                  disabled={disabled}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.65rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem'
                  }}
                >
                  <option value="" disabled>
                    Select Inspection Rule Category...
                  </option>
                  {ruleOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {/* Severity pill buttons */}
                {(['high', 'medium', 'low'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => handleFieldChange(idx, 'severity', sev)}
                    disabled={disabled}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor:
                        finding.severity === sev
                          ? sev === 'high'
                            ? '#ef4444'
                            : sev === 'medium'
                            ? '#f59e0b'
                            : '#38bdf8'
                          : 'transparent',
                      background:
                        finding.severity === sev
                          ? sev === 'high'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : sev === 'medium'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(56, 189, 248, 0.2)'
                          : 'rgba(255, 255, 255, 0.04)',
                      color:
                        finding.severity === sev
                          ? sev === 'high'
                            ? '#fca5a5'
                            : sev === 'medium'
                            ? '#fde68a'
                            : '#bae6fd'
                          : 'var(--text-muted)'
                    }}
                  >
                    {sev}
                  </button>
                ))}

                {/* Duplicate / Delete actions */}
                <button
                  type="button"
                  onClick={() => handleDuplicateRow(idx)}
                  disabled={disabled}
                  className="byte-btn byte-btn-secondary byte-btn-sm"
                  style={{ padding: '0.3rem', minWidth: 'auto' }}
                  title="Duplicate finding row"
                >
                  <Copy style={{ width: '13px', height: '13px' }} />
                </button>

                {findings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(idx)}
                    disabled={disabled}
                    className="byte-btn byte-btn-secondary byte-btn-sm"
                    style={{ padding: '0.3rem', minWidth: 'auto', color: '#ef4444' }}
                    title="Delete finding row"
                  >
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Selector and Evidence */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Offending DOM Selector
                </label>
                <input
                  type="text"
                  value={finding.selector}
                  onChange={(e) => handleFieldChange(idx, 'selector', e.target.value)}
                  disabled={disabled}
                  placeholder="e.g. .site-nav .brand or button#burgerBtn"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Observed Evidence / Measurable Value
                </label>
                <input
                  type="text"
                  value={finding.evidence}
                  onChange={(e) => handleFieldChange(idx, 'evidence', e.target.value)}
                  disabled={disabled}
                  placeholder="e.g. Contrast ratio 2.3:1; missing aria-label"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>
            </div>

            {/* Why and Suggested Fix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Why this violates engineering rules
                </label>
                <textarea
                  rows={2}
                  value={finding.why}
                  onChange={(e) => handleFieldChange(idx, 'why', e.target.value)}
                  disabled={disabled}
                  placeholder="Explain the UX, accessibility, or security consequence..."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Suggested Code Fix or Remediation
                </label>
                <textarea
                  rows={2}
                  value={finding.suggestedFix}
                  onChange={(e) => handleFieldChange(idx, 'suggestedFix', e.target.value)}
                  disabled={disabled}
                  placeholder="e.g. color: #9ca3af; aria-label=&quot;Toggle navigation menu&quot;"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Finding Button */}
      <button
        type="button"
        onClick={handleAddRow}
        disabled={disabled}
        className="byte-btn byte-btn-secondary"
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.75rem',
          borderStyle: 'dashed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        <Plus style={{ width: '16px', height: '16px', color: 'var(--byte-accent)' }} />
        <span>Add Another Finding Entry</span>
      </button>
    </div>
  );
};
