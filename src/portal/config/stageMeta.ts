/**
 * BYTE Archive 047 — Stage Metadata & Descriptive Catalog
 */

export interface StageMeta {
  id: number;
  title: string;
  subtitle: string;
  track: 'webdev' | 'all';
  type: 'zip' | 'findings' | 'deployment';
  timeEstimate: string;
  description: string;
  deliverables: string[];
  constraints: string[];
}

export const STAGE_CATALOG: Record<number, StageMeta> = {
  0: {
    id: 0,
    title: 'Orientation & Environment Verification',
    subtitle: 'System readiness check and baseline smoke test',
    track: 'all',
    type: 'zip',
    timeEstimate: '10–15 mins',
    description: 'Verify your local development environment or cloud workspace, locate the designated build identifier, apply the requested branding adjustment, and run the advisory verification suite.',
    deliverables: [
      'Configured workspace with passing smoke test',
      'Exported verification package with matching manifest'
    ],
    constraints: [
      'Do not modify files outside designated orientation directories',
      'Ensure package preserves top-level archive structure'
    ]
  },
  1: {
    id: 1,
    title: 'Broken Exhibit',
    subtitle: 'Interface restoration, responsive styling, and accessibility repair',
    track: 'webdev',
    type: 'zip',
    timeEstimate: '35–45 mins',
    description: 'The BYTE Archive exhibit interface has rendering regressions, broken mobile viewport layouts, missing focus traps in dialogs, and z-index layering conflicts.',
    deliverables: [
      'Repaired CSS grid and flexbox layout across 375px–1440px viewports',
      'Accessible modal dialog with Esc dismiss and keyboard trap',
      'Correct tooltip layering and color contrast standards'
    ],
    constraints: [
      'Vanilla CSS / semantic HTML only (no external frameworks)',
      'All interactive elements must pass keyboard navigation checks'
    ]
  },
  2: {
    id: 2,
    title: 'Unreliable Archive',
    subtitle: 'Data parsing, corrupted feed reconciliation, and graceful error states',
    track: 'webdev',
    type: 'zip',
    timeEstimate: '25–35 mins',
    description: 'The remote archival data feed emits inconsistent records, intermittent malformed JSON, and delayed responses. Build resilient parsing that displays all valid items and gracefully flags corrupt anomalies without crashing.',
    deliverables: [
      'Hardened fetch & parsing logic supporting all valid archive records',
      'Non-crashing error boundary / fallback card for corrupted entries',
      'Live loading skeleton and retry trigger on network timeout'
    ],
    constraints: [
      'Never render raw undefined/null strings in exhibit cards',
      'Validate payloads prior to DOM injection'
    ]
  },
  3: {
    id: 3,
    title: 'Race Condition & Event Sync',
    subtitle: 'Asynchronous state management and event listener teardown',
    track: 'webdev',
    type: 'zip',
    timeEstimate: '30–40 mins',
    description: 'Archive search queries suffer from out-of-order responses, memory leaks from duplicated listeners, and stale state overwrite when rapid input changes occur.',
    deliverables: [
      'AbortController integration cancelling superseded network requests',
      'Deterministic state settlement with debounced search input',
      'Clean listener cleanup on unmount/route change'
    ],
    constraints: [
      'No race conditions under synthetic 500ms network jitter',
      'Document suspected bug and fix in the Investigation Log'
    ]
  },
  4: {
    id: 4,
    title: 'Field Inspection',
    subtitle: 'Structured accessibility, performance, and security audit',
    track: 'webdev',
    type: 'findings',
    timeEstimate: '40–50 mins',
    description: 'Audit the target specimen site against established engineering rules. Document concrete violations with exact CSS selectors, severity ratings, evidence, root-cause explanations, and recommended code remediations.',
    deliverables: [
      'Structured audit table with at least 3 genuine rule violations',
      'Reproducible DOM selector and screenshot / snippet evidence',
      'Actionable remediation proposals matching standard web guidelines'
    ],
    constraints: [
      'Beware of decoy rules that do not genuinely apply to the specimen',
      'All severity ratings must adhere to the provided engineering rubric'
    ]
  },
  5: {
    id: 5,
    title: 'Rebuild the Vault',
    subtitle: 'Full-stack authentication, RBAC, and secure token issuance',
    track: 'webdev',
    type: 'deployment',
    timeEstimate: '60–90 mins',
    description: 'Deploy a live service implementing role-based access control, cryptographic session handling, and rate-limiting against brute force vectors.',
    deliverables: [
      'Public HTTPS deployment URL reachable by automated test suite',
      'Public source code repository containing implementation and test scripts',
      'Comprehensive README detailing environment variables and architecture'
    ],
    constraints: [
      'Deployment must respond over valid HTTPS (no self-signed certs)',
      'Do not submit localhost or non-routable private IP addresses'
    ]
  },
  6: {
    id: 6,
    title: 'Conservation Scanner',
    subtitle: 'High-throughput archival safety and ingestion pipeline',
    track: 'webdev',
    type: 'deployment',
    timeEstimate: '60–90 mins',
    description: 'Deploy an automated scanner service capable of validating batch artifact inputs with rigorous SSRF protection and memory boundary limits.',
    deliverables: [
      'Live scanner endpoint accepting test payloads',
      'Public GitHub repository with scanner source code',
      'Documentation of memory bounds and security safeguards'
    ],
    constraints: [
      'Strict external network isolation for untrusted URLs',
      'Zero SSRF exposure to cloud metadata endpoints (169.254.169.254)'
    ]
  }
};
