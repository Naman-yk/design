import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, RefreshCw, Check, Sparkles, X, ChevronDown } from 'lucide-react';
import {
  getActiveScenarioId,
  SCENARIO_CATALOG,
  ScenarioId,
  setActiveScenarioId
} from '../mocks/scenarios';

interface DevScenarioSwitcherProps {
  onScenarioChange?: () => void;
}

export const DevScenarioSwitcher: React.FC<DevScenarioSwitcherProps> = ({ onScenarioChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<ScenarioId>(getActiveScenarioId);
  const navigate = useNavigate();

  const getTargetRouteForScenario = (id: ScenarioId): string => {
    switch (id) {
      case 'pass_all':
      case 'brand_new_candidate':
      case 'stage1_passed_stage2_current':
      case 'duplicate_409':
        return '/tasks';
      case 'slow_queue':
        return '/tasks/submissions/sub_slow_queue';
      case 'fail_some_checks':
        return '/tasks/submissions/sub_failed_checks';
      case 'needs_review':
        return '/tasks/submissions/sub_needs_review';
      case 'infra_error':
        return '/tasks/submissions/sub_infra_error';
      case 'cooldown_active':
        return '/tasks/submissions/sub_cooldown';
      case 'attempt_limit':
        return '/tasks/submissions/sub_attempt_limit';
      case 'locked_403':
        return '/tasks/stages/3';
      case 'manifest_mismatch_422':
      case 'invalid_zip_422':
      case 'file_too_large_413':
        return '/tasks/stages/2/submit';
      default:
        return '/tasks';
    }
  };

  const handleSelect = (id: ScenarioId) => {
    setActiveId(id);
    setActiveScenarioId(id);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('byte-scenario-changed', { detail: id }));
    const target = getTargetRouteForScenario(id);
    navigate(target);
    if (onScenarioChange) {
      onScenarioChange();
    }
  };

  const handleResetProgress = () => {
    localStorage.removeItem('byte_mock_passed_stage_2');
    localStorage.removeItem('byte_log_backup_stage_1');
    localStorage.removeItem('byte_log_backup_stage_2');
    localStorage.removeItem('byte_log_backup_stage_3');
    localStorage.removeItem('byte_log_backup_stage_4');
    handleSelect('stage1_passed_stage2_current');
  };

  const activeDef = SCENARIO_CATALOG.find((s) => s.id === activeId);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'clamp(12px, 2.5vw, 20px)',
        right: 'clamp(12px, 2.5vw, 20px)',
        zIndex: 9999,
        fontFamily: 'var(--font-body)',
        maxWidth: 'calc(100vw - 24px)'
      }}
    >
      {/* Floating pill trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.85rem',
            borderRadius: '9999px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-accent)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)'
          }}
          title="Switch evaluation test scenario"
        >
          <Sparkles style={{ width: '14px', height: '14px', color: 'var(--byte-accent)' }} />
          <span>Scenario:</span>
          <span style={{ color: 'var(--byte-accent-bright)', maxWidth: 'clamp(80px, 24vw, 150px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeDef?.name || activeId}
          </span>
          <Settings style={{ width: '13px', height: '13px', color: 'var(--text-muted)' }} />
        </button>
      )}

      {/* Drawer / Modal Panel */}
      {isOpen && (
        <div
          style={{
            width: 'min(380px, calc(100vw - 24px))',
            maxHeight: 'calc(100dvh - 36px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings style={{ width: '18px', height: '18px', color: 'var(--byte-accent)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Dev Scenario Switcher</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex'
              }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          {/* Description */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              background: 'var(--byte-accent-tint)',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            Select a test scenario to simulate candidate progress, API errors, or verification outcomes.
          </div>

          {/* Scenario List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.75rem'
            }}
          >
            {SCENARIO_CATALOG.map((scenario) => {
              const isSelected = scenario.id === activeId;
              return (
                <div
                  key={scenario.id}
                  onClick={() => handleSelect(scenario.id)}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? 'var(--byte-accent)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(34, 197, 121, 0.1)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem'
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: isSelected ? 'var(--byte-accent-bright)' : 'var(--text-primary)'
                      }}
                    >
                      {scenario.name}
                    </span>
                    {isSelected && <Check style={{ width: '15px', height: '15px', color: 'var(--byte-accent)' }} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                    {scenario.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0,0,0,0.2)'
            }}
          >
            <button
              onClick={handleResetProgress}
              className="byte-btn byte-btn-secondary byte-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} />
              <span>Reset State</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="byte-btn byte-btn-primary byte-btn-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
