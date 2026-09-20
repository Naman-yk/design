#!/usr/bin/env node

/**
 * BYTE Archive 047 — Prebuilt Starter Package Generator (WP11)
 * 
 * Enumerates variant combinations for release time, applies variant substitutions,
 * computes cryptographic manifest HMAC signatures, and outputs starter packages.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SECRET = process.env.MANIFEST_SECRET || 'byte_archive_047_manifest_signing_secret';
const SUITE_VERSION = process.env.SUITE_VERSION || '2026.09.1';
const OUTPUT_DIR = process.env.STARTER_OUTPUT_DIR || './dist/starters';

// Starter slot pools
const POOLS = {
  exhibits: [0, 1, 2],
  breakpoints: [0, 1],
  dateFormats: [0, 1],
  poisonedIds: [0, 1, 2],
  s3Bugs: [0, 1]
};

function signManifest(manifestPayload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(manifestPayload));
  return hmac.digest('hex');
}

export function generateAllCombinations() {
  const combinations = [];

  for (const exhibits of POOLS.exhibits) {
    for (const breakpoint of POOLS.breakpoints) {
      for (const dateFormats of POOLS.dateFormats) {
        for (const poisonedId of POOLS.poisonedIds) {
          for (const s3Bug of POOLS.s3Bugs) {
            const variant = {
              exhibits,
              breakpoint,
              dateFormats,
              poisonedId,
              s3Bug
            };
            const variantKey = `v-${exhibits}-${breakpoint}-${dateFormats}-${poisonedId}-${s3Bug}`;
            combinations.push({ variant, variantKey });
          }
        }
      }
    }
  }

  return combinations;
}

export function buildStarterPackage(combo, outputBaseDir) {
  const starterDir = path.join(outputBaseDir, combo.variantKey);
  fs.mkdirSync(starterDir, { recursive: true });

  const manifestPayload = {
    variantKey: combo.variantKey,
    suiteVersion: SUITE_VERSION,
    slots: combo.variant,
    createdAt: new Date().toISOString()
  };

  const signature = signManifest(manifestPayload, SECRET);
  const signedManifest = {
    ...manifestPayload,
    signature
  };

  // Write manifest.json
  fs.writeFileSync(
    path.join(starterDir, 'manifest.json'),
    JSON.stringify(signedManifest, null, 2),
    'utf-8'
  );

  // Write sample package.json with candidate config
  const packageJson = {
    name: `byte-archive-${combo.variantKey}`,
    version: '1.0.0',
    private: true,
    byteVariant: combo.variantKey,
    scripts: {
      dev: 'vite',
      build: 'vite build',
      test: 'vitest run',
      'test:advisory': 'node ./scripts/advisory-test.js'
    }
  };

  fs.writeFileSync(
    path.join(starterDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8'
  );

  // Write README.md with variant instructions
  const readmeContent = `# BYTE Archive 047 — Assigned Starter Kit

Variant Identifier: \`${combo.variantKey}\`
Suite Version: \`${SUITE_VERSION}\`

## Quick Start
1. Install dependencies:
   \`npm install\`

2. Launch development environment:
   \`npm run dev\`

3. Run advisory local checks:
   \`npm run test:advisory\`

## Submission Guidelines
When finished, preserve the \`manifest.json\` file at the archive root and export your project:
\`zip -r submission-${combo.variantKey}.zip . -x "node_modules/*" ".git/*"\`
`;

  fs.writeFileSync(path.join(starterDir, 'README.md'), readmeContent, 'utf-8');

  return { variantKey: combo.variantKey, starterDir };
}

function run() {
  console.log('--- BYTE Archive 047 Starter Builder (WP11) ---');
  const combinations = generateAllCombinations();
  console.log(`Generated ${combinations.length} discrete variant combinations.`);

  // Build sample batch (or all if configured)
  const isSampleRun = process.env.FULL_BUILD !== 'true';
  const targetCombos = isSampleRun ? combinations.slice(0, 5) : combinations;

  console.log(`Building packages to: ${OUTPUT_DIR} (count: ${targetCombos.length})...`);
  for (const combo of targetCombos) {
    const res = buildStarterPackage(combo, OUTPUT_DIR);
    console.log(`  ✓ Built starter: ${res.variantKey}`);
  }

  console.log('Starter build process completed successfully.');
}

// If run directly from CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
