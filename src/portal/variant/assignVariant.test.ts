import { describe, it, expect } from 'vitest';
import { assignVariant, variantKey, drawSlot, VariantPools } from './assignVariant';

const samplePools: VariantPools = {
  version: 1,
  exhibits: ['Sphinx', 'Amber', 'Rosetta', 'Obsidian', 'Horizon'],
  breakpoints: ['768px', '820px', '640px'],
  dateFormats: ['ISO-8601', 'RFC-2822', 'Unix-Timestamp', 'Custom-Archival'],
  poisonedIds: ['REC-001', 'REC-042', 'REC-089', 'REC-128', 'REC-256'],
  s3Bugs: ['RaceConditionPromiseRace', 'ListenerLeakOnResize', 'StaleStateOverwrite'],
  specimenSets: ['SetA', 'SetB', 'SetC', 'SetD']
};

const TEST_SECRET = 'test_variant_hmac_secret_key_byte_2026';

describe('assignVariant (WP10)', () => {
  it('throws an error if VARIANT_SECRET is missing', () => {
    const originalSecret = process.env.VARIANT_SECRET;
    delete process.env.VARIANT_SECRET;

    expect(() => {
      assignVariant('cand_123', samplePools);
    }).toThrow(/VARIANT_SECRET is required/);

    process.env.VARIANT_SECRET = originalSecret;
  });

  it('is deterministic for the same candidateId and secret', () => {
    const draw1 = assignVariant('BYTE-7F3K', samplePools, TEST_SECRET);
    const draw2 = assignVariant('BYTE-7F3K', samplePools, TEST_SECRET);

    expect(draw1).toEqual(draw2);
    expect(variantKey(draw1)).toEqual(variantKey(draw2));
  });

  it('produces indices strictly bounded within respective pool lengths', () => {
    const candidateIds = ['CAND_1', 'CAND_2', 'CAND_3', 'CAND_4', 'CAND_5'];

    for (const cid of candidateIds) {
      const v = assignVariant(cid, samplePools, TEST_SECRET);

      expect(v.poolVersion).toBe(samplePools.version);
      expect(v.exhibits).toBeGreaterThanOrEqual(0);
      expect(v.exhibits).toBeLessThan(samplePools.exhibits.length);

      expect(v.breakpoint).toBeGreaterThanOrEqual(0);
      expect(v.breakpoint).toBeLessThan(samplePools.breakpoints.length);

      expect(v.dateFormats).toBeGreaterThanOrEqual(0);
      expect(v.dateFormats).toBeLessThan(samplePools.dateFormats.length);

      expect(v.poisonedId).toBeGreaterThanOrEqual(0);
      expect(v.poisonedId).toBeLessThan(samplePools.poisonedIds.length);

      expect(v.s3Bug).toBeGreaterThanOrEqual(0);
      expect(v.s3Bug).toBeLessThan(samplePools.s3Bugs.length);

      expect(v.specimen).toBeGreaterThanOrEqual(0);
      expect(v.specimen).toBeLessThan(samplePools.specimenSets.length);
    }
  });

  it('generates the expected canonical variantKey format', () => {
    const v = assignVariant('BYTE-7F3K', samplePools, TEST_SECRET);
    const key = variantKey(v);

    expect(key).toMatch(/^v-\d+-\d+-\d+-\d+-\d+$/);
  });

  it('preserves slot independence across different candidates', () => {
    const draws = Array.from({ length: 20 }, (_, i) =>
      assignVariant(`candidate_test_${i}`, samplePools, TEST_SECRET)
    );

    // Ensure not all draws have the same exhibits slot
    const exhibitIndices = new Set(draws.map((d) => d.exhibits));
    expect(exhibitIndices.size).toBeGreaterThan(1);

    // Ensure not all draws have the same breakpoint slot
    const breakpointIndices = new Set(draws.map((d) => d.breakpoint));
    expect(breakpointIndices.size).toBeGreaterThan(1);
  });

  it('different secrets produce different distributions for the same candidate', () => {
    const drawA = assignVariant('cand_alpha', samplePools, 'secret_AAA');
    const drawB = assignVariant('cand_alpha', samplePools, 'secret_BBB');

    expect(drawA).not.toEqual(drawB);
  });
});
