import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './portal/components/AppShell';
import { DashboardPage } from './portal/pages/DashboardPage';
import { StageBriefingPage } from './portal/pages/StageBriefingPage';
import { StageSubmitPage } from './portal/pages/StageSubmitPage';
import { SubmissionResultPage } from './portal/pages/SubmissionResultPage';
import { NotFoundPage } from './portal/pages/NotFoundPage';
import './portal/config/theme.css';

export function App() {
  return (
    <BrowserRouter>
      <AppShell candidateCode="BYTE-7F3K" track="webdev">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/portal" element={<Navigate to="/tasks" replace />} />
          <Route path="/portal/*" element={<Navigate to="/tasks" replace />} />
          
          <Route path="/tasks" element={<DashboardPage />} />
          <Route path="/tasks/stages/:id" element={<StageBriefingPage />} />
          <Route path="/tasks/stages/:id/submit" element={<StageSubmitPage />} />
          <Route path="/tasks/submissions/:id" element={<SubmissionResultPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
