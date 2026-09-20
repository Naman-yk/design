import React from 'react';
import { StageSummary } from '../types/api';
import { StageRow } from './StageRow';

interface StageListProps {
  stages: StageSummary[];
  currentStageId?: number | null;
}

export const StageList: React.FC<StageListProps> = ({ stages, currentStageId }) => {
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}
      >
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>MISSION STAGES</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}
          >
            (6 Total)
          </span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {stages.map((stage) => (
          <StageRow
            key={stage.id}
            stage={stage}
            isCurrent={stage.id === currentStageId}
          />
        ))}
      </div>
    </div>
  );
};
