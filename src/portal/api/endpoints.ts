import {
  Briefing,
  FindingRow,
  LogDraft,
  ProgressResponse,
  StarterResponse,
  SubmissionCreated,
  SubmissionStatus
} from '../types/api';
import { apiClient } from './client';

export const api = {
  /** Fetch candidate progress and stage roster */
  getProgress: (): Promise<ProgressResponse> => {
    return apiClient<ProgressResponse>('/api/me/progress');
  },

  /** Fetch mission briefing for an authorized stage */
  getBriefing: (stageId: number): Promise<Briefing> => {
    return apiClient<Briefing>(`/api/stages/${stageId}/briefing`);
  },

  /** Fetch assigned starter artifact link */
  getStarter: (stageId: number): Promise<StarterResponse> => {
    return apiClient<StarterResponse>(`/api/stages/${stageId}/starter`);
  },

  /** Fetch current log draft for a stage */
  getLog: (stageId: number): Promise<LogDraft> => {
    return apiClient<LogDraft>(`/api/stages/${stageId}/log`);
  },

  /** Autosave or update log draft */
  putLog: (
    stageId: number,
    data: { sections: Record<string, string>; version: number }
  ): Promise<LogDraft> => {
    return apiClient<LogDraft>(`/api/stages/${stageId}/log`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  /** Submit ZIP archive for Stages 0–3 */
  postSubmissionZip: (
    stageId: number,
    formData: FormData,
    idempotencyKey: string
  ): Promise<SubmissionCreated> => {
    return apiClient<SubmissionCreated>(`/api/stages/${stageId}/submissions`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      body: formData,
      timeoutMs: 60000 // 60s for large uploads
    });
  },

  /** Submit structured audit findings for Stage 4 */
  postSubmissionFindings: (
    stageId: number,
    payload: {
      clientRequestId: string;
      logVersion: number;
      findings: FindingRow[];
    },
    idempotencyKey: string
  ): Promise<SubmissionCreated> => {
    return apiClient<SubmissionCreated>(`/api/stages/${stageId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });
  },

  /** Submit deployed service URL and repository for Stages 5–6 */
  postSubmissionDeployment: (
    stageId: number,
    payload: {
      clientRequestId: string;
      deployedUrl: string;
      repoUrl: string;
      readmeUrl?: string;
      logVersion: number;
    },
    idempotencyKey: string
  ): Promise<SubmissionCreated> => {
    return apiClient<SubmissionCreated>(`/api/stages/${stageId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });
  },

  /** Poll submission verification status */
  getSubmission: (submissionId: string): Promise<SubmissionStatus> => {
    return apiClient<SubmissionStatus>(`/api/submissions/${submissionId}`);
  },

  /** Fetch past submission attempts for a stage */
  listSubmissions: (stageId: number): Promise<SubmissionStatus[]> => {
    return apiClient<SubmissionStatus[]>(`/api/stages/${stageId}/submissions`);
  }
};
