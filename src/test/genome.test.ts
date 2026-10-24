import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToHsl, hslToHex, lrv } from '@/lib/color';
import { sunPosition } from '@/lib/sun';
import { analyzeFacade, genomeCode, specCsv } from '@/lib/genome';
import { assignColorsToSlots, PRESETS } from '@/store/genomeStore';

describe('color science', () => {
  it('computes LRV at the extremes', () => {
    expect(lrv('#ffffff')).toBe(100);
    expect(lrv('#000000')).toBe(0);
  });

  it('computes WCAG contrast', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBe(21);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });

  it('round-trips HSL', () => {
    const hex = '#3a7bd5';
    expect(hslToHex(hexToHsl(hex))).toBe(hex);
  });
});

describe('sun geometry (Ashdod, 31.8°N)', () => {
  it('puts the summer solstice noon sun near 81.6°', () => {
    const s = sunPosition(6, 12);
    expect(s.altitude).toBeGreaterThan(80);
    expect(s.altitude).toBeLessThan(83);
    expect(Math.round(s.azimuth)).toBe(180);
  });

  it('puts the winter solstice noon sun near 34.8°', () => {
    const s = sunPosition(12, 12);
    expect(s.altitude).toBeGreaterThan(33.5);
    expect(s.altitude).toBeLessThan(36);
  });

  it('rises in the east and sets in the west', () => {
    expect(sunPosition(3, 8).azimuth).toBeLessThan(180);
    expect(sunPosition(3, 16).azimuth).toBeGreaterThan(180);
  });
});

describe('facade genome', () => {
  const base = PRESETS[0].palette;

  it('assigns the lightest picked color to the body and darkest to frames', () => {
    const next = assignColorsToSlots(['#222222', '#f5f0e6', '#e2001a'], base);
    expect(next.body.color).toBe('#f5f0e6');
    expect(next.accent.color).toBe('#e2001a');
    expect(next.frames.color).toBe('#222222');
  });

  it('does not mutate the input palette', () => {
    const before = JSON.stringify(base);
    assignColorsToSlots(['#123456'], base);
    expect(JSON.stringify(base)).toBe(before);
  });

  it('flags a dark body as a thermal risk', () => {
    const dark = { ...base, body: { ...base.body, color: '#2b2b2b' } };
    expect(analyzeFacade(dark).some(f => f.severity === 'warn' && f.title.includes('תרמי'))).toBe(true);
  });

  it('produces a stable genome code and CSV spec', () => {
    expect(genomeCode(base)).toMatch(/^AG-([A-Z]\d+·){5}[A-Z]\d+$/);
    expect(specCsv(base).split('\n')).toHaveLength(7);
  });
});
