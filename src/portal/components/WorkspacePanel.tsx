import React, { useState } from 'react';
import { Briefing, StarterResponse } from '../types/api';
import {
  ExternalLink,
  Download,
  Terminal,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface WorkspacePanelProps {
  stageId: number;
  workspace: Briefing['workspace'];
  starter?: StarterResponse | null;
  onDownloadZip?: () => void;
  isLoadingStarter?: boolean;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  stageId,
  workspace,
  starter,
  onDownloadZip,
  isLoadingStarter
}) => {
  const [showLocalSteps, setShowLocalSteps] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  const handleDownload = () => {
    setDownloadTriggered(true);
    if (onDownloadZip) {
      onDownloadZip();
    } else if (starter?.url) {
      window.open(starter.url, '_blank');
    }
    setTimeout(() => setDownloadTriggered(false), 3000);
  };

  return (
    <div
      className="byte-card-elevated"
      style={{
        padding: 'clamp(1.15rem, 2.5vw, 1.75rem)',
        marginBottom: '2rem',
        border: '1px solid var(--border-medium)',
        background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--byte-accent-tint)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Layers style={{ width: '16px', height: '16px', color: 'var(--byte-accent-bright)' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              Development Workspace & Starter
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Assigned starter package configured with your variant assets
            </div>
          </div>
        </div>

        {starter?.version && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.04)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            Suite {starter.version}
          </span>
        )}
      </div>

      {/* Advisory callout */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          background: 'rgba(56, 189, 248, 0.06)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          color: 'var(--text-secondary)',
          fontSize: '0.8125rem',
          lineHeight: 1.45,
          marginBottom: '1.25rem'
        }}
      >
        <Info style={{ width: '18px', height: '18px', color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#bae6fd' }}>Bring-Your-Own-Workspace:</strong> You can edit locally in VS Code or in the cloud via StackBlitz. Remember that external workspaces do not auto-grade; when your solution is ready, export your archive and submit it for verification.
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}
      >
        {workspace.hostedAvailable && (
          <a
            href={workspace.hostedUrl || 'https://stackblitz.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="byte-btn byte-btn-primary byte-mobile-w-full"
            style={{ textDecoration: 'none' }}
          >
            <Sparkles style={{ width: '16px', height: '16px' }} />
            <span>Open StackBlitz Starter</span>
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </a>
        )}

        {workspace.zipAvailable && (
          <button
            onClick={handleDownload}
            disabled={isLoadingStarter}
            className="byte-btn byte-btn-secondary byte-mobile-w-full"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {downloadTriggered ? (
              <>
                <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--byte-accent)' }} />
                <span>Downloading Starter...</span>
              </>
            ) : (
              <>
                <Download style={{ width: '16px', height: '16px' }} />
                <span>Download Starter ZIP</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={() => setShowLocalSteps(!showLocalSteps)}
          className="byte-btn byte-btn-secondary byte-mobile-w-full"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)'
          }}
        >
          <Terminal style={{ width: '14px', height: '14px' }} />
          <span>Local Setup Guide</span>
          {showLocalSteps ? (
            <ChevronUp style={{ width: '14px', height: '14px' }} />
          ) : (
            <ChevronDown style={{ width: '14px', height: '14px' }} />
          )}
        </button>
      </div>

      {/* Expandable Local Steps */}
      {showLocalSteps && (
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            marginTop: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--byte-accent-bright)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Terminal style={{ width: '14px', height: '14px' }} />
            <span>Local Environment Instructions</span>
          </div>

          <ol
            style={{
              margin: 0,
              paddingLeft: '1.25rem',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            {workspace.localSteps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
