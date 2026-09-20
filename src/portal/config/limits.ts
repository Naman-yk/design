/**
 * BYTE Archive 047 — Application limits and configuration
 */

export const LIMITS = {
  /** Maximum file upload size for candidate ZIPs (25 MB) */
  MAX_ZIP_SIZE_BYTES: 25 * 1024 * 1024,
  MAX_ZIP_SIZE_MB: 25,

  /** Debounce delay for autosaving log entries (1500 ms) */
  AUTOSAVE_DEBOUNCE_MS: 1500,

  /** Polling schedule for submission verification */
  POLLING: {
    FAST_INTERVAL_MS: 3000,
    FAST_DURATION_MS: 30000,
    MEDIUM_INTERVAL_MS: 5000,
    MEDIUM_DURATION_MS: 120000,
    SLOW_INTERVAL_MS: 10000,
    MAX_TOTAL_MS: 15 * 60 * 1000, // 15 min hard stop
    JITTER_RATIO: 0.2, // +/- 20% jitter
  },

  /** Minimum required findings for Stage 4 */
  STAGE_4_MIN_FINDINGS: 3,

  /** Local storage keys */
  STORAGE_KEYS: {
    LOG_BACKUP_PREFIX: 'byte_log_backup_stage_',
    FINDINGS_BACKUP: 'byte_findings_backup_stage_4',
    ACTIVE_SCENARIO: 'byte_active_scenario',
  }
};
