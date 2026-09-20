import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ByteCubeLogo } from './ByteCubeLogo';
import NodeMesh from './NodeMesh';
import { DevScenarioSwitcher } from './DevScenarioSwitcher';
import { Menu, X, ExternalLink, ArrowRight } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
          background: 'rgba(9, 12, 9, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem clamp(1rem, 3vw, 2rem)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Brand: 3D Isometric Cube + "Byte" */}
          <Link
            to="/tasks"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none'
            }}
          >
            <ByteCubeLogo size={32} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span
                  style={{
                    fontFamily: "var(--font-brand), 'Baloo 2', sans-serif",
                    fontSize: '1.45rem',
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
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--byte-accent)',
                    letterSpacing: '0.08em'
                  }}
                >
                  / ARCHIVE
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav links matching byte-dev.nyahost.in */}
          <nav
            className="desktop-only"
            style={{
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

          {/* Desktop Right Action: Candidate Pill + Join Us button */}
          <div className="desktop-only" style={{ alignItems: 'center', gap: '1rem' }}>
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

          {/* Mobile Right Action Bar: Compact Badge + Hamburger button */}
          <div className="mobile-only" style={{ alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '9999px',
                fontSize: '0.75rem'
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--byte-accent)',
                  boxShadow: '0 0 6px var(--byte-accent)'
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff' }}>
                {candidateCode}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: mobileMenuOpen ? 'var(--byte-accent)' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${mobileMenuOpen ? 'var(--byte-accent)' : 'var(--border-medium)'}`,
                color: mobileMenuOpen ? '#060807' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              {mobileMenuOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="animate-fade-in"
            style={{
              paddingTop: '1rem',
              paddingBottom: '0.5rem',
              marginTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(34, 197, 121, 0.12)',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--byte-accent-bright)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <span>Tasks Dashboard</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>

              <a
                href="https://byte-dev.nyahost.in/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.65rem 0.9rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Home</span>
                <ExternalLink style={{ width: '14px', height: '14px', opacity: 0.6 }} />
              </a>

              <a
                href="https://byte-dev.nyahost.in/#about"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.65rem 0.9rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>About BYTE</span>
                <ExternalLink style={{ width: '14px', height: '14px', opacity: 0.6 }} />
              </a>

              <a
                href="https://byte-dev.nyahost.in/events"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.65rem 0.9rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Events</span>
                <ExternalLink style={{ width: '14px', height: '14px', opacity: 0.6 }} />
              </a>

              <a
                href="https://byte-dev.nyahost.in/members"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.65rem 0.9rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Members Directory</span>
                <ExternalLink style={{ width: '14px', height: '14px', opacity: 0.6 }} />
              </a>

              <a
                href="https://byte-dev.nyahost.in/#achievements"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.65rem 0.9rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Projects</span>
                <ExternalLink style={{ width: '14px', height: '14px', opacity: 0.6 }} />
              </a>
            </nav>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Candidate ID: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{candidateCode}</strong></span>
                <span style={{ textTransform: 'uppercase', color: 'var(--byte-accent-bright)', fontWeight: 700 }}>Track: {track}</span>
              </div>

              <a
                href="https://byte-dev.nyahost.in/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="byte-btn byte-btn-primary byte-mobile-w-full"
                style={{
                  borderRadius: '6px',
                  padding: '0.65rem',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Join Us
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(1.25rem, 3.5vw, 2.5rem) clamp(1rem, 3vw, 2rem) 5rem clamp(1rem, 3vw, 2rem)',
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
