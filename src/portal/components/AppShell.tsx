import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ByteCubeLogo } from './ByteCubeLogo';
import NodeMesh from './NodeMesh';
import { DevScenarioSwitcher } from './DevScenarioSwitcher';

interface AppShellProps {
  children: React.ReactNode;
  candidateCode?: string;
  track?: string;
  onScenarioChange?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  candidateCode = 'BYTE-7F3K',
  track = 'webdev',
  onScenarioChange
}) => {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Authentic BYTE Stellium NodeMesh with Hover Waves */}
      <div className="global-mesh-layer" aria-hidden="true">
        <NodeMesh />
      </div>

      {/* A11y Skip Link */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-50px',
          left: '16px',
          padding: '8px 16px',
          background: 'var(--byte-accent)',
          color: '#060807',
          fontWeight: 800,
          borderRadius: '4px',
          zIndex: 9999,
          transition: 'top 0.2s ease'
        }}
        onFocus={(e) => (e.currentTarget.style.top = '16px')}
        onBlur={(e) => (e.currentTarget.style.top = '-50px')}
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar matching byte-dev.nyahost.in */}
      <header
        className="site-nav"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(9, 12, 9, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 2rem'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          {/* Brand: 3D Isometric Cube + "Byte" */}
          <Link
            to="/tasks"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textDecoration: 'none'
            }}
          >
            <ByteCubeLogo size={36} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                <span
                  style={{
                    fontFamily: "var(--font-brand), 'Baloo 2', sans-serif",
                    fontSize: '1.55rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: '#ffffff'
                  }}
                >
                  Byte
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--byte-accent)',
                    letterSpacing: '0.08em'
                  }}
                >
                  / ARCHIVE 047
                </span>
              </div>
            </div>
          </Link>

          {/* Nav links matching byte-dev.nyahost.in */}
          <nav
            style={{
              display: 'flex',
              gap: '1.85rem',
              alignItems: 'center'
            }}
          >
            <a
              href="https://byte-dev.nyahost.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)'
              }}
            >
              Home
            </a>
            <a
              href="https://byte-dev.nyahost.in/#about"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)'
              }}
            >
              About
            </a>
            <a
              href="https://byte-dev.nyahost.in/events"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)'
              }}
            >
              Events
            </a>
            <a
              href="https://byte-dev.nyahost.in/members"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)'
              }}
            >
              Members
            </a>
            <a
              href="https://byte-dev.nyahost.in/#achievements"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)'
              }}
            >
              Projects
            </a>
            <Link
              to="/tasks"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--byte-accent)',
                borderBottom: '2px solid var(--byte-accent)',
                paddingBottom: '0.2rem'
              }}
            >
              Tasks
            </Link>
          </nav>

          {/* Right Action: Candidate Pill + Join Us button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '9999px',
                fontSize: '0.8125rem'
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--byte-accent)',
                  boxShadow: '0 0 8px var(--byte-accent)'
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff' }}>
                {candidateCode}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  background: 'rgba(34, 197, 121, 0.16)',
                  color: 'var(--byte-accent-bright)',
                  fontWeight: 800
                }}
              >
                {track}
              </span>
            </div>

            <a
              href="https://byte-dev.nyahost.in/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="byte-btn byte-btn-primary"
              style={{
                borderRadius: '6px',
                padding: '0.5rem 1.15rem',
                fontSize: '0.8125rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Join Us
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '2.5rem 2rem 5rem 2rem',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(6, 8, 7, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ByteCubeLogo size={18} />
            <span>BYTE Archive 047 • Student Innovation & Technical Society</span>
          </div>
          <div>All submissions verified through deterministic sandboxed runners.</div>
        </div>
      </footer>

      {/* Dev Scenario Switcher Floating Control */}
      <DevScenarioSwitcher onScenarioChange={onScenarioChange} />
    </div>
  );
};
