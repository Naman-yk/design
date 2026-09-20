import { ApiError } from '../types/api';

export interface MappedError {
  code: string;
  title: string;
  message: string;
  isRetryable: boolean;
  consumesAttempt: boolean;
  actionHint?: string;
  actionUrl?: string;
}

export const ERROR_MAPPINGS: Record<string, MappedError> = {
  UNAUTHENTICATED: {
    code: 'UNAUTHENTICATED',
    title: 'Session Expired',
    message: 'Your session has expired. Your current draft has been safely saved locally.',
    isRetryable: true,
    consumesAttempt: false,
    actionHint: 'Sign In Again'
  },
  STAGE_LOCKED: {
    code: 'STAGE_LOCKED',
    title: 'Stage Locked',
    message: 'This stage is locked. You must complete and verify all prerequisite stages before this mission unlocks.',
    isRetryable: false,
    consumesAttempt: false,
    actionHint: 'Back to Tasks',
    actionUrl: '/tasks'
  },
  STAGE_NOT_RELEASED: {
    code: 'STAGE_NOT_RELEASED',
    title: 'Stage Scheduled',
    message: 'This stage has not yet been released. Check back at the scheduled opening time.',
    isRetryable: false,
    consumesAttempt: false,
    actionHint: 'View Schedule'
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    title: 'Not Found',
    message: 'The requested mission or submission record could not be found.',
    isRetryable: false,
    consumesAttempt: false,
    actionHint: 'Return to Tasks',
    actionUrl: '/tasks'
  },
  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    title: 'Validation Error',
    message: 'Some required fields are missing or invalid. Please review the highlighted fields below.',
    isRetryable: true,
    consumesAttempt: false
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    title: 'File Too Large',
    message: 'The uploaded file exceeds the 25 MB size limit. Remove build caches (node_modules, .git) and large video/media assets.',
    isRetryable: true,
    consumesAttempt: false,
    actionHint: 'Select Smaller ZIP'
  },
  INVALID_ARCHIVE: {
    code: 'INVALID_ARCHIVE',
    title: 'Invalid Archive Structure',
    message: 'The uploaded file is not a valid ZIP or is corrupted. Ensure source files are packaged directly at the archive root. No attempt was consumed.',
    isRetryable: true,
    consumesAttempt: false,
    actionHint: 'Verify Archive & Re-upload'
  },
  MANIFEST_MISMATCH: {
    code: 'MANIFEST_MISMATCH',
    title: 'Assigned Starter Mismatch',
    message: 'This ZIP was not built from your assigned starter kit. Please download your assigned starter again, copy your source modifications over, and re-upload. No attempt was consumed.',
    isRetryable: true,
    consumesAttempt: false,
    actionHint: 'Download Assigned Starter'
  },
  SUBMISSION_IN_PROGRESS: {
    code: 'SUBMISSION_IN_PROGRESS',
    title: 'Verification In Progress',
    message: 'A previous submission for this stage is currently queued or running checks. Please wait for it to finish before submitting another.',
    isRetryable: false,
    consumesAttempt: false,
    actionHint: 'View Active Submission'
  },
  COOLDOWN: {
    code: 'COOLDOWN',
    title: 'Cooldown Active',
    message: 'A mandatory cooling period is in effect before your next attempt can be initiated.',
    isRetryable: true,
    consumesAttempt: false,
    actionHint: 'Wait for Cooldown'
  },
  ATTEMPT_LIMIT: {
    code: 'ATTEMPT_LIMIT',
    title: 'Maximum Attempts Reached',
    message: 'You have reached the maximum allowed attempts for this stage. Reach out to the evaluation team if you experienced infrastructure issues.',
    isRetryable: false,
    consumesAttempt: false
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    title: 'Rate Limited',
    message: 'Too many requests were sent in a short window. Please wait a few seconds before trying again.',
    isRetryable: true,
    consumesAttempt: false
  },
  INTERNAL: {
    code: 'INTERNAL',
    title: 'Evaluation Service Issue',
    message: 'The verification infrastructure encountered an unexpected error. Your candidate attempt was NOT consumed. Please retry shortly.',
    isRetryable: true,
    consumesAttempt: false,
    actionHint: 'Retry Submission'
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Network Disconnected',
    message: 'Could not connect to the BYTE verification service. Check your internet connection. Your local draft has been safely saved.',
    isRetryable: true,
    consumesAttempt: false,
    actionHint: 'Check Connection & Retry'
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    title: 'Request Timed Out',
    message: 'The request took longer than expected to finish. Your progress is preserved.',
    isRetryable: true,
    consumesAttempt: false
  },
  SCHEMA_MISMATCH: {
    code: 'SCHEMA_MISMATCH',
    title: 'Unexpected Server Response',
    message: 'The verification service returned a response that did not match the expected schema. Try reloading the page.',
    isRetryable: true,
    consumesAttempt: false
  }
};

export function toUserMessage(err: unknown): MappedError {
  if (err && typeof err === 'object') {
    const errorObj = err as ApiError;
    if (errorObj.error && errorObj.error.code) {
      const code = errorObj.error.code;
      const found = ERROR_MAPPINGS[code];
      if (found) {
        // If server provided custom message or details, enhance it
        let customMessage = found.message;
        if (code === 'STAGE_NOT_RELEASED' && errorObj.error.details?.releaseAt) {
          const formatted = new Date(String(errorObj.error.details.releaseAt)).toLocaleString();
          customMessage = `This stage has not yet been released. It is scheduled to open on ${formatted}.`;
        } else if (errorObj.error.message && code === 'VALIDATION_FAILED') {
          customMessage = errorObj.error.message;
        }
        return {
          ...found,
          message: customMessage
        };
      }
      return {
        code,
        title: 'Error',
        message: errorObj.error.message || 'An unexpected error occurred.',
        isRetryable: true,
        consumesAttempt: false
      };
    }

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return ERROR_MAPPINGS.TIMEOUT;
      }
      if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        return ERROR_MAPPINGS.NETWORK_ERROR;
      }
      return {
        code: 'UNKNOWN',
        title: 'Error',
        message: err.message,
        isRetryable: true,
        consumesAttempt: false
      };
    }
  }

  return {
    code: 'UNKNOWN',
    title: 'Unexpected Error',
    message: 'An unknown error occurred. Please try again.',
    isRetryable: true,
    consumesAttempt: false
  };
}

export function isRetryable(err: unknown): boolean {
  return toUserMessage(err).isRetryable;
}

export function isAuthError(err: unknown): boolean {
  return toUserMessage(err).code === 'UNAUTHENTICATED';
}
