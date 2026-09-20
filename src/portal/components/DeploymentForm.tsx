import React from 'react';
import { Globe, GitBranch, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DeploymentFormProps {
  deployedUrl: string;
  repoUrl: string;
  readmeUrl: string;
  onDeployedUrlChange: (url: string) => void;
  onRepoUrlChange: (url: string) => void;
  onReadmeUrlChange: (url: string) => void;
  disabled?: boolean;
}

export const DeploymentForm: React.FC<DeploymentFormProps> = ({
  deployedUrl,
  repoUrl,
  readmeUrl,
  onDeployedUrlChange,
  onRepoUrlChange,
  onReadmeUrlChange,
  disabled = false
}) => {
  const isHttpWarning = deployedUrl.startsWith('http://');
  const isLocalhostWarning =
    deployedUrl.includes('localhost') ||
    deployedUrl.includes('127.0.0.1') ||
    deployedUrl.includes('192.168.') ||
    deployedUrl.includes('10.');

  return (
    <div
      className="byte-card"
      style={{
        padding: 'clamp(1.15rem, 2.5vw, 1.75rem)',
        marginBottom: '2rem'
      }}
    >
      <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
          Live Deployment & Repository Details
        </h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          External services are checked via black-box HTTP automated suites. Never run candidate code on the BYTE host.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Deployed Service URL */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.4rem'
            }}
          >
            <Globe style={{ width: '15px', height: '15px', color: 'var(--byte-accent)' }} />
            <span>Deployed Public HTTPS Endpoint *</span>
          </label>
          <input
            type="url"
            required
            value={deployedUrl}
            onChange={(e) => onDeployedUrlChange(e.target.value)}
            disabled={disabled}
            placeholder="https://your-service.onrender.com or https://your-app.fly.dev"
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${
                isLocalhostWarning || isHttpWarning ? 'var(--status-failed)' : 'var(--border-medium)'
              }`,
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem'
            }}
          />

          {isLocalhostWarning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', color: 'var(--status-failed)', fontSize: '0.75rem' }}>
              <AlertTriangle style={{ width: '13px', height: '13px' }} />
              <span>Localhost and private IP addresses cannot be accessed by the remote automated grader.</span>
            </div>
          )}

          {isHttpWarning && !isLocalhostWarning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', color: 'var(--status-review)', fontSize: '0.75rem' }}>
              <AlertTriangle style={{ width: '13px', height: '13px' }} />
              <span>Insecure HTTP endpoints will be rejected. Please provide a valid HTTPS URL.</span>
            </div>
          )}
        </div>

        {/* Public Repository URL */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.4rem'
            }}
          >
            <GitBranch style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
            <span>Public Git Repository URL *</span>
          </label>
          <input
            type="url"
            required
            value={repoUrl}
            onChange={(e) => onRepoUrlChange(e.target.value)}
            disabled={disabled}
            placeholder="https://github.com/your-username/byte-archive-vault"
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Readme URL (Optional) */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.4rem'
            }}
          >
            <FileText style={{ width: '15px', height: '15px', color: 'var(--text-muted)' }} />
            <span>Architecture Documentation / README URL (Optional)</span>
          </label>
          <input
            type="url"
            value={readmeUrl}
            onChange={(e) => onReadmeUrlChange(e.target.value)}
            disabled={disabled}
            placeholder="https://github.com/your-username/byte-archive-vault/blob/main/README.md"
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>
    </div>
  );
};
