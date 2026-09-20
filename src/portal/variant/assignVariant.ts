/**
 * BYTE Archive 047 — Variant Assignment Server Module (WP10)
 * Handoff module for Backend Engineering (Vaibhav).
 * 
 * CRITICAL RULE: This module runs ONLY on the server / backend runtime.
 * It must NEVER be imported by portal client-side UI code.
 * VARIANT_SECRET must NEVER reach the candidate's browser bundle.
 */

import crypto from 'node:crypto';

export interface VariantPools {
  version: number;
  exhibits: unknown[];
  breakpoints: unknown[];
  dateFormats: unknown[];
  poisonedIds: unknown[];
  s3Bugs: unknown[];
  specimenSets: unknown[];
}

export interface CandidateVariant {
  poolVersion: number;
  exhibits: number;
  breakpoint: number;
  dateFormats: number;
  poisonedId: number;
  s3Bug: number;
  specimen: number;
}

/**
 * Deterministic pseudo-random draw using HMAC-SHA256 over candidateId + slot name.
 */
export function drawSlot(
  candidateId: string,
  slot: string,
  poolLength: number,
  secret: string
): number {
  if (!secret) {
    throw new Error('VARIANT_SECRET is required to draw variant slot');
  }
  if (poolLength <= 0) {
    throw new Error(`Invalid poolLength for slot "${slot}": ${poolLength}`);
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${candidateId}:${slot}`);
  const digest = hmac.digest();

  // Read unsigned 32-bit big-endian integer
  const num = digest.readUInt32BE(0);
  return num % poolLength;
}

/**
 * Assigns a deterministic variant draw for a candidate across all 6 slots.
 */
export function assignVariant(
  candidateId: string,
  pools: VariantPools,
  secretOverride?: string
): CandidateVariant {
  const secret = secretOverride || process.env.VARIANT_SECRET;
  if (!secret) {
    throw new Error('VARIANT_SECRET is required for assignVariant');
  }

  return {
    poolVersion: pools.version,
    exhibits: drawSlot(candidateId, 'exhibits', pools.exhibits.length, secret),
    breakpoint: drawSlot(candidateId, 'breakpoint', pools.breakpoints.length, secret),
    dateFormats: drawSlot(candidateId, 'dateFormats', pools.dateFormats.length, secret),
    poisonedId: drawSlot(candidateId, 'poisonedId', pools.poisonedIds.length, secret),
    s3Bug: drawSlot(candidateId, 's3Bug', pools.s3Bugs.length, secret),
    specimen: drawSlot(candidateId, 'specimen', pools.specimenSets.length, secret)
  };
}

/**
 * Generates canonical variant key identifying the starter and API data for this variant.
 * Example: "v-3-1-2-4-0"
 */
export function variantKey(v: CandidateVariant): string {
  return ['v', v.exhibits, v.breakpoint, v.dateFormats, v.poisonedId, v.s3Bug].join('-');
}
