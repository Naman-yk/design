import React from 'react';
import { ProgressResponse } from '../types/api';
import { CheckCircle2, Copy, Layers, Sparkles } from 'lucide-react';

interface ProgressHeaderProps {
  progress: ProgressResponse;
  onContinueCurrent?: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ progress }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(progress.candidate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStage = progress.stages.find((s) => s.id === progress.currentStageId);
  const passedCount = progress.stages.filter((s) => s.status === 'passed').length;
  const totalStages = progress.stages.filter((s) => s.id > 0).length || 6;

  return (
    <div
      className="byte-card-elevated"
      style={{
        padding: 'clamp(1.25rem, 3vw, 2.25rem) clamp(1rem, 3vw, 2.5rem)',
        marginBottom: '2rem',
        border: '1px solid rgba(34, 197, 121, 0.25)',
        background: 'linear-gradient(135deg, rgba(16, 21, 18, 0.95) 0%, rgba(8, 10, 9, 0.98) 100%)'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}
      >
        {/* Left column: titles & coordinates */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap'
            }}
          >
            <span className="byte-coord-tag">
              00 ARCHIVE DOSSIER
            </span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <div
              onClick={handleCopyCode}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                padding: '0.2rem 0.65rem',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-medium)'
              }}
              title="Click to copy candidate code"
            >
              <span>{progress.candidate.code}</span>
              {copied ? (
                <CheckCircle2 style={{ width: '13px', height: '13px', color: 'var(--byte-accent)' }} />
              ) : (
                <Copy style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
              )}
            </div>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 5.5vw, 2.6rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              margin: '0 0 0.75rem 0',
              letterSpacing: '-0.03em'
            }}
          >
            BYTE <span style={{ color: 'var(--byte-accent)' }}>/</span> ARCHIVE 047
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}
          >
            <Layers style={{ width: '16px', height: '16px', color: 'var(--byte-accent)' }} />
            <span>{progress.candidate.variantLabel}</span>
          </div>
        </div>

        {/* Right column: Progress meter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(1rem, 2.5vw, 1.75rem)',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: 'clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 2.5vw, 1.75rem)',
            borderRadius: '12px',
            border: '1px solid var(--border-accent)',
            flex: '1 1 280px',
            minWidth: 0
          }}
        >
          {/* Circular progress visual */}
          <div style={{ position: 'relative', width: '74px', height: '74px', flexShrink: 0 }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--byte-accent)"
                strokeDasharray={`${progress.percentComplete}, 100`}
                strokeLinecap="round"
                strokeWidth="3.2"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: '#ffffff'
              }}
            >
              {progress.percentComplete}%
            </div>
          </div>

          {/* Progress details & linear bar */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.4rem'
              }}
            >
              <span className="byte-coord-tag" style={{ fontSize: '0.68rem' }}>
                OVERALL VERIFIED
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>
                {passedCount} / {totalStages} Stages
              </span>
            </div>

            {/* Accessibility Progress Bar */}
            <div
              role="progressbar"
              aria-valuenow={progress.percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Evaluation completion percentage"
              style={{
                height: '7px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '0.6rem'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress.percentComplete}%`,
                  background: 'linear-gradient(90deg, #159c60, #22c579, #59e0ab)',
                  borderRadius: '9999px',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 0 10px rgba(34, 197, 121, 0.5)'
                }}
              />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {progress.percentComplete === 100 ? (
                <span style={{ color: 'var(--byte-accent-bright)', fontWeight: 700 }}>
                  ★ All 6 Stages Complete & Verified
                </span>
              ) : currentStage ? (
                <span>
                  Active: <strong style={{ color: '#ffffff' }}>Stage 0{currentStage.id}</strong>
                </span>
              ) : (
                <span>Ready to start Stage 01</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
