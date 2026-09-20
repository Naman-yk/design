import { Briefing, ProgressResponse, StarterResponse, SubmissionStatus } from '../types/api';

export const mockBriefings: Record<number, Briefing> = {
  0: {
    stageId: 0,
    title: 'Orientation & Environment Setup',
    story: `### Mission Overview

Welcome to the **BYTE Archive 047 Evaluation Protocol**.

Before tackling live specimen restoration, verify your local development environment or online container workspace. You will inspect the sample directory, locate the assigned candidate identifier in \`package.json\`, adjust the visual label in the header banner, and execute the pre-flight verification script.

> **Archival Note:** Ensure your node runtime is v20+ and your archive packaging tools preserve root file paths.`,
    goal: 'Establish environment readiness, verify local tooling, and successfully submit your signed baseline orientation package.',
    deliverables: [
      'Locate and verify your assigned candidate code in config',
      'Correct the header branding text to "BYTE / Archive 047"',
      'Run the local advisory test suite: npm run test:advisory',
      'Export a clean ZIP archive directly from project root'
    ],
    constraints: [
      'Do not include node_modules or .git directories in the archive',
      'Ensure manifest.json signature is unmodified'
    ],
    allowedResources: [
      'Standard MDN Web Docs',
      'Node.js v20+ and npm / pnpm documentation'
    ],
    checksSummary: [
      'Candidate code reconciliation',
      'Branding DOM text match',
      'Archive structure & signature validation'
    ],
    estimatedMinutes: '10–15 minutes',
    acceptedFormats: ['zip'],
    workspace: {
      hostedAvailable: true,
      hostedUrl: 'https://stackblitz.com/edit/byte-archive-047-stage0?embed=1',
      zipAvailable: true,
      localSteps: [
        'Download your assigned starter ZIP archive using the button below.',
        'Extract to your workspace: unzip byte-stage0-starter.zip -d stage0',
        'Install dependencies: npm install',
        'Start dev preview: npm run dev',
        'When finished, package your edits: zip -r submission.zip . -x "node_modules/*" ".git/*"'
      ]
    },
    logSections: [
      'What I observed during setup',
      'What I suspected & verified',
      'What I changed in config or DOM',
      'Unresolved questions'
    ]
  },
  1: {
    stageId: 1,
    title: 'Broken Exhibit',
    story: `### Mission Overview

The archival display system for **Exhibit Set: Sphinx, Amber, Rosetta** was recently migrated to a new rendering pipeline, but several visual and functional regressions were introduced:

1. **Broken Responsive Layout**: At tablet and mobile breakpoints (< 768px), the main cards collide and text overflows the viewport.
2. **Accessible Dialog Trap**: The detail inspector modal fails to trap focus when opened, and pressing \`Esc\` does not dismiss the backdrop.
3. **Z-Index Layering Conflict**: Tooltips and popover badges render beneath adjacent section headers.
4. **Semantics & Landmarks**: Primary navigation lacks proper ARIA landmark roles and buttons lack accessible names.`,
    goal: 'Repair all CSS layout, responsive breakpoints, focus management, and semantic accessibility defects in the exhibit viewer.',
    deliverables: [
      'Responsive flex/grid layout functioning seamlessly down to 375px',
      'Accessible modal with trapped keyboard focus and Escape key handling',
      'Proper stacking context ordering for all tooltips and overlays',
      'Lighthouse accessibility score >= 95'
    ],
    constraints: [
      'Only modify CSS and semantic HTML; do not introduce external CSS frameworks',
      'Preserve all existing data attributes ([data-exhibit-id], [data-part-id])'
    ],
    allowedResources: [
      'MDN CSS Flexbox, Grid, and Stacking Context guides',
      'W3C WAI-ARIA Authoring Practices Guide (APG) for Modal Dialogs'
    ],
    checksSummary: [
      '375px mobile viewport visual layout',
      'Modal focus trap and keyboard dismissal',
      'Tooltip layering and z-index ordering',
      'Color contrast & ARIA landmark verification'
    ],
    estimatedMinutes: '35–45 minutes',
    acceptedFormats: ['zip'],
    workspace: {
      hostedAvailable: true,
      hostedUrl: 'https://stackblitz.com/edit/byte-archive-047-stage1?embed=1',
      zipAvailable: true,
      localSteps: [
        'Download the Stage 1 assigned starter ZIP.',
        'Extract and run: npm install && npm run dev',
        'Test accessibility with keyboard tab navigation and devtools.',
        'Run local test runner: npm test',
        'Export archive: zip -r stage1-solution.zip . -x "node_modules/*" ".git/*"'
      ]
    },
    logSections: [
      'What I observed on initial inspection',
      'What I suspected was causing layout/stacking breakage',
      'Evidence gathered (DOM / computed styles)',
      'What I changed in CSS and HTML',
      'What I am still unsure about or edge cases noted'
    ]
  },
  2: {
    stageId: 2,
    title: 'Investigate the Data Feed',
    story: `### Mission Overview

The archival telemetry feed emitted from the specimen station has grown unstable.

Our downstream catalog expects a consistent feed of artifact entries, but the server occasionally emits corrupted JSON fragments, missing required fields, and unexpected null values. Furthermore, during periodic sync bursts, the client application completely crashes rather than handling the failure gracefully.

Your mission is to harden the client-side ingestion logic so that **all valid records are displayed**, corrupt records display an **isolated, non-blocking error badge**, and the user can safely trigger a refresh when network drops occur.`,
    goal: 'Implement robust data ingestion, graceful error boundaries for malformed records, and accurate loading/empty UI states.',
    deliverables: [
      'Defensive JSON parsing that never crashes the parent exhibit viewer',
      'Error cards for corrupted records that clearly identify the invalid record ID',
      'Skeleton loading placeholders during network latency',
      'Manual retry mechanism triggering incremental sync'
    ],
    constraints: [
      'Never render raw "undefined" or "null" strings on the UI',
      'Must handle malformed date timestamps without throwing Uncaught RangeError'
    ],
    allowedResources: [
      'MDN Fetch API and Error Handling',
      'JSON Schema specification'
    ],
    checksSummary: [
      'Valid record count match against candidate variant',
      'Corrupted record error boundary behavior',
      'Retry handling on network failure simulation',
      'Zero uncaught exceptions in console'
    ],
    estimatedMinutes: '25–35 minutes',
    acceptedFormats: ['zip'],
    workspace: {
      hostedAvailable: true,
      hostedUrl: 'https://stackblitz.com/edit/byte-archive-047-stage2?embed=1',
      zipAvailable: true,
      localSteps: [
        'Download the Stage 2 starter package.',
        'Extract and start dev server: npm run dev',
        'Examine the mock data in /api/feed.json and simulated corruption toggles.',
        'Harden parser and error states.',
        'Package for submission: zip -r stage2-solution.zip . -x "node_modules/*" ".git/*"'
      ]
    },
    logSections: [
      'What I observed in the network payloads',
      'What I suspected about parsing failures',
      'Evidence from console logs and mock traces',
      'What I changed in the ingestion pipeline',
      'What edge cases were considered'
    ]
  },
  3: {
    stageId: 3,
    title: 'Race Condition & Event Sync',
    story: `### Mission Overview

When archival researchers quickly type search keywords or switch specimen categories in rapid succession, the gallery displays contradictory results.

Due to un-cancelled asynchronous promises and delayed server responses, older slow responses routinely overwrite newer quick responses. Additionally, navigating between views repeatedly leaks event listeners, degrading frame rates over time.

You must introduce deterministic request sequencing, cancel superseded fetch calls with \`AbortController\`, and ensure event handlers are cleanly unbound.`,
    goal: 'Eliminate all search race conditions and event listener leaks under high-frequency interaction.',
    deliverables: [
      'AbortController integration aborting stale network requests',
      'Deterministic state updates matching the latest user query',
      'Proper teardown of scroll and resize listeners in component unmount'
    ],
    constraints: [
      'Must pass synthetic 500ms network jitter stress test',
      'No memory leaks detected across 20 rapid view transitions'
    ],
    allowedResources: ['MDN AbortController and DOM Event Lifecycle'],
    checksSummary: [
      'Out-of-order response resolution',
      'AbortController signal abort verification',
      'Event listener lifecycle and cleanup'
    ],
    estimatedMinutes: '30–40 minutes',
    acceptedFormats: ['zip'],
    workspace: {
      hostedAvailable: true,
      hostedUrl: 'https://stackblitz.com/edit/byte-archive-047-stage3?embed=1',
      zipAvailable: true,
      localSteps: [
        'Download Stage 3 starter.',
        'Extract and launch: npm run dev',
        'Reproduce race condition with rapid keystrokes.',
        'Integrate AbortController and listener unbinding.',
        'Verify with npm test and submit.'
      ]
    },
    logSections: [
      'What I observed during rapid search input',
      'What I suspected regarding promise settling order',
      'Evidence from request timelines',
      'What I changed in async handlers and cleanup',
      'Unresolved or tricky race edge cases'
    ]
  },
  4: {
    stageId: 4,
    title: 'Field Inspection',
    story: `### Mission Overview

As a Senior Archive Evaluator, you are tasked with conducting a **structured engineering and accessibility inspection** of the live archival specimen site.

You must examine the specimen site, identify concrete violations of our engineering rules, and document your findings in the structured audit editor below.

> **Caution:** The rule catalog contains both **valid rules** and **decoy rules**. Decoy rules describe scenarios that do not actually occur on this specimen or apply improper standards. You will be evaluated on your judgment, exact selector identification, severity rating, and code remediation quality.`,
    goal: 'Identify and document genuine engineering and accessibility defects on the specimen site using the structured audit editor.',
    deliverables: [
      'At least 3 valid rule violation entries',
      'Exact DOM selectors matching the offending elements',
      'Direct snippets or measurable evidence',
      'Appropriate severity rating (High / Medium / Low)',
      'Actionable suggested code fix'
    ],
    constraints: [
      'Do not submit findings for decoy rules',
      'Evidence must be specific to the specimen site'
    ],
    allowedResources: ['Live Specimen Site', 'Web Content Accessibility Guidelines (WCAG) 2.2'],
    checksSummary: [
      'Rule applicability check (filtering decoys)',
      'Selector precision check',
      'Severity calibration against rubric',
      'Remediation technical feasibility'
    ],
    estimatedMinutes: '40–50 minutes',
    acceptedFormats: ['findings'],
    workspace: {
      hostedAvailable: false,
      zipAvailable: false,
      localSteps: [
        'Open the live specimen site in a separate browser tab.',
        'Use DevTools (Elements, Console, Lighthouse, Axe) to inspect the DOM and network.',
        'Document each defect using the Findings Editor below.',
        'Review severity against rubric and submit directly.'
      ]
    },
    specimenUrl: 'https://byte-dev.nyahost.in/',
    minFindings: 3,
    ruleIds: [
      { id: 'a11y-focus-visible', label: 'ACC-01: Interactive elements must have visible keyboard focus indicators' },
      { id: 'a11y-contrast', label: 'ACC-02: Text must meet minimum 4.5:1 contrast ratio against background' },
      { id: 'a11y-aria-name', label: 'ACC-03: Icon buttons and interactive controls must have accessible names' },
      { id: 'perf-lcp-image', label: 'PERF-01: Largest Contentful Paint image missing fetchpriority="high"' },
      { id: 'sec-target-blank', label: 'SEC-01: Target="_blank" links missing rel="noopener noreferrer"' },
      { id: 'decoy-canvas-gl', label: 'DEC-01: WebGL 3D canvas must implement software WebGPU fallback (DECOY)', isDecoy: true },
      { id: 'decoy-xml-schema', label: 'DEC-02: HTML document must validate against XHTML 1.1 DTD (DECOY)', isDecoy: true }
    ],
    logSections: [
      'Inspection methodology and tools utilized',
      'Summary of primary risk areas',
      'Evaluator notes'
    ]
  },
  5: {
    stageId: 5,
    title: 'Rebuild the Vault',
    subtitle: 'Deploy authentication & role-based access control service',
    story: `### Mission Overview

The central Archive Vault requires an independently hosted authorization microservice.

You will construct and deploy an external service adhering to our OpenAPI vault specification, featuring secure session cookies, password hashing with bcrypt/argon2, role permissions, and token revocation.`,
    goal: 'Deploy a compliant authentication service on your cloud provider of choice and submit the live HTTPS endpoint.',
    deliverables: [
      'Live deployed HTTPS URL reachable by our automated testing agent',
      'Public GitHub repository containing complete source code',
      'Architectural summary in repository README'
    ],
    constraints: [
      'Must support HTTPS (no HTTP or self-signed certificates)',
      'Service must respond within 3000ms per endpoint'
    ],
    allowedResources: ['Node.js, Go, Python, or Rust frameworks of your choice', 'Cloud host (Render, Fly.io, Railway, Vercel, AWS, etc.)'],
    checksSummary: [
      'POST /auth/register and /auth/login functionality',
      'JWT / httpOnly session cookie security attributes',
      'Role-based authorization boundary enforcement',
      'Brute-force rate limiting'
    ],
    estimatedMinutes: '60–90 minutes',
    acceptedFormats: ['deployment'],
    workspace: {
      hostedAvailable: false,
      zipAvailable: false,
      localSteps: [
        'Clone starter template or build from scratch following the Vault API spec.',
        'Deploy service to your preferred cloud hosting provider.',
        'Verify public HTTPS availability with curl.',
        'Submit deployed URL and GitHub repository link in the form.'
      ]
    },
    logSections: [
      'Architecture & tech stack choices',
      'Security decisions & password hashing implementation',
      'Deployment infrastructure details'
    ]
  },
  6: {
    stageId: 6,
    title: 'Conservation Scanner',
    subtitle: 'Deploy high-throughput archival inspection & sanitization worker',
    story: `### Mission Overview

Deploy a sandboxed scanner worker that inspects untrusted external URLs and archival documents for data exfiltration, SSRF vulnerabilities, and malicious script injection.`,
    goal: 'Deploy the scanner microservice to cloud hosting and verify resilience against black-box automated attack payloads.',
    deliverables: [
      'Live deployed HTTPS scanner endpoint',
      'Public GitHub repository with scanner codebase',
      'SSRF defense architecture documentation'
    ],
    constraints: [
      'Zero exposure to internal link-local IP ranges (169.254.169.254, 127.0.0.1, 10.0.0.0/8)',
      'Strict memory capping and execution timeout per scan'
    ],
    allowedResources: ['Any modern language runtime', 'Docker / Container isolation'],
    checksSummary: [
      'Safe URL ingestion and HTML parsing',
      'SSRF protection against metadata services',
      'Malformed payload handling without worker crash'
    ],
    estimatedMinutes: '60–90 minutes',
    acceptedFormats: ['deployment'],
    workspace: {
      hostedAvailable: false,
      zipAvailable: false,
      localSteps: [
        'Develop scanner worker implementing the conservation scanner API.',
        'Deploy to public cloud host with HTTPS support.',
        'Submit URL and repository for black-box compliance testing.'
      ]
    },
    logSections: [
      'SSRF filtering mechanism and IP resolution defenses',
      'Resource limit configuration',
      'Final candidate reflections'
    ]
  }
};

/** The canonical screenshot case: Stage 1 passed, Stage 2 current, Stage 3 locked */
export const fixtureProgressScreenshotCase: ProgressResponse = {
  serverNow: new Date().toISOString(),
  candidate: {
    code: 'BYTE-7F3K',
    track: 'webdev',
    variantLabel: 'Exhibit set: Sphinx, Amber, Rosetta'
  },
  percentComplete: 33,
  currentStageId: 2,
  stages: [
    {
      id: 1,
      title: 'Broken Exhibit',
      subtitle: 'Interface restoration, responsive styling, and accessibility repair',
      status: 'passed',
      workspaceLabel: 'Assigned project',
      latestSubmissionId: 'sub_01H1PASS1'
    },
    {
      id: 2,
      title: 'Investigate the Data Feed',
      subtitle: 'Data parsing, corrupted feed reconciliation, and graceful error states',
      status: 'unlocked',
      estimatedMinutes: '25-35 minutes',
      workspaceLabel: 'Assigned project',
      retry: {
        allowed: true,
        attemptsUsed: 0,
        attemptLimit: 8,
        cooldownEndsAt: null
      }
    },
    {
      id: 3,
      title: 'Race Condition & Event Sync',
      subtitle: 'Asynchronous state management and event listener teardown',
      status: 'locked',
      estimatedMinutes: '30-40 minutes'
    },
    {
      id: 4,
      title: 'Field Inspection',
      subtitle: 'Structured accessibility, performance, and security audit',
      status: 'locked',
      estimatedMinutes: '40-50 minutes'
    },
    {
      id: 5,
      title: 'Rebuild the Vault',
      subtitle: 'Full-stack authentication, RBAC, and secure token issuance',
      status: 'locked',
      estimatedMinutes: '60-90 minutes'
    },
    {
      id: 6,
      title: 'Conservation Scanner',
      subtitle: 'High-throughput archival safety and ingestion pipeline',
      status: 'locked',
      estimatedMinutes: '60-90 minutes'
    }
  ]
};

export const fixtureProgressNewCandidate: ProgressResponse = {
  serverNow: new Date().toISOString(),
  candidate: {
    code: 'BYTE-9X2L',
    track: 'webdev',
    variantLabel: 'Exhibit set: Obsidian, Horizon, Nautilus'
  },
  percentComplete: 0,
  currentStageId: 1,
  stages: [
    {
      id: 1,
      title: 'Broken Exhibit',
      subtitle: 'Interface restoration, responsive styling, and accessibility repair',
      status: 'unlocked',
      estimatedMinutes: '35-45 minutes',
      workspaceLabel: 'Assigned project',
      retry: { allowed: true, attemptsUsed: 0, attemptLimit: 8, cooldownEndsAt: null }
    },
    {
      id: 2,
      title: 'Investigate the Data Feed',
      subtitle: 'Data parsing, corrupted feed reconciliation, and graceful error states',
      status: 'locked',
      estimatedMinutes: '25-35 minutes'
    },
    {
      id: 3,
      title: 'Race Condition & Event Sync',
      subtitle: 'Asynchronous state management and event listener teardown',
      status: 'locked',
      estimatedMinutes: '30-40 minutes'
    },
    {
      id: 4,
      title: 'Field Inspection',
      subtitle: 'Structured accessibility, performance, and security audit',
      status: 'locked',
      estimatedMinutes: '40-50 minutes'
    },
    {
      id: 5,
      title: 'Rebuild the Vault',
      subtitle: 'Full-stack authentication, RBAC, and secure token issuance',
      status: 'locked',
      estimatedMinutes: '60-90 minutes'
    },
    {
      id: 6,
      title: 'Conservation Scanner',
      subtitle: 'High-throughput archival safety and ingestion pipeline',
      status: 'locked',
      estimatedMinutes: '60-90 minutes'
    }
  ]
};

export const fixtureProgressAllPassed: ProgressResponse = {
  serverNow: new Date().toISOString(),
  candidate: {
    code: 'BYTE-7F3K',
    track: 'webdev',
    variantLabel: 'Exhibit set: Sphinx, Amber, Rosetta'
  },
  percentComplete: 100,
  currentStageId: null,
  stages: [
    { id: 1, title: 'Broken Exhibit', status: 'passed', latestSubmissionId: 'sub_pass_stage_1' },
    { id: 2, title: 'Investigate the Data Feed', status: 'passed', latestSubmissionId: 'sub_pass_stage_2' },
    { id: 3, title: 'Race Condition & Event Sync', status: 'passed', latestSubmissionId: 'sub_pass_stage_3' },
    { id: 4, title: 'Field Inspection', status: 'passed', latestSubmissionId: 'sub_pass_stage_4' },
    { id: 5, title: 'Rebuild the Vault', status: 'passed', latestSubmissionId: 'sub_pass_stage_5' },
    { id: 6, title: 'Conservation Scanner', status: 'passed', latestSubmissionId: 'sub_pass_stage_6' }
  ]
};

export const mockStarterResponses: Record<number, StarterResponse> = {
  0: {
    kind: 'zip',
    url: 'https://downloads.byte-eval.nyahost.in/starters/byte-stage0-BYTE7F3K.zip',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    version: '2026.09.1'
  },
  1: {
    kind: 'zip',
    url: 'https://downloads.byte-eval.nyahost.in/starters/byte-stage1-BYTE7F3K.zip',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    version: '2026.09.1'
  },
  2: {
    kind: 'zip',
    url: 'https://downloads.byte-eval.nyahost.in/starters/byte-stage2-BYTE7F3K.zip',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    version: '2026.09.1'
  },
  3: {
    kind: 'zip',
    url: 'https://downloads.byte-eval.nyahost.in/starters/byte-stage3-BYTE7F3K.zip',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    version: '2026.09.1'
  },
  4: {
    kind: 'hosted',
    url: 'https://byte-dev.nyahost.in/',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    version: '2026.09.1'
  },
  5: {
    kind: 'hosted',
    url: 'https://github.com/byte-archive-047/vault-template',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    version: '2026.09.1'
  },
  6: {
    kind: 'hosted',
    url: 'https://github.com/byte-archive-047/scanner-template',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    version: '2026.09.1'
  }
};
