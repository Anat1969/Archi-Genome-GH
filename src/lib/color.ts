// Color science utilities used across the app: conversions, luminance,
// light reflectance value (LRV), contrast and palette diagnostics.

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }

export function hexToRgb(hex: string): RGB {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const n = parseInt(clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: HSL): string {
  const sn = s / 100, ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex({ r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 });
}

function channelToLinear(c: number) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance, 0..1 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** Light Reflectance Value, 0 (black) .. 100 (perfect white). CIE Y scaled. */
export function lrv(hex: string): number {
  return Math.round(relativeLuminance(hex) * 1000) / 10;
}

/** WCAG contrast ratio, 1..21 */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/** Approximate solar absorptance of an opaque painted surface. */
export function solarAbsorptance(hex: string): number {
  return Math.round((1 - relativeLuminance(hex) * 0.92) * 100) / 100;
}

export type Temperature = 'warm' | 'cool' | 'neutral';

export function temperatureOf(hex: string): Temperature {
  const { h, s } = hexToHsl(hex);
  if (s < 12) return 'neutral';
  if (h < 75 || h >= 330) return 'warm';
  if (h >= 150 && h < 290) return 'cool';
  return 'neutral';
}

export const TEMPERATURE_LABEL: Record<Temperature, string> = {
  warm: 'חם', cool: 'קר', neutral: 'ניטרלי',
};

export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return rgbToHex({ r: ca.r + (cb.r - ca.r) * t, g: ca.g + (cb.g - ca.g) * t, b: ca.b + (cb.b - ca.b) * t });
}

/** Rough Hebrew color family naming by hue/lightness. */
export function colorFamily(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  if (l > 93) return 'לבן';
  if (l < 10) return 'שחור';
  if (s < 10) return l > 60 ? 'אפור בהיר' : l > 35 ? 'אפור' : 'אפור כהה';
  if (s < 30 && l > 55 && h >= 20 && h < 60) return 'חול / בז׳';
  if (h < 15 || h >= 345) return l < 35 ? 'בורדו' : 'אדום';
  if (h < 40) return l < 40 ? 'חום' : 'כתום / טרקוטה';
  if (h < 65) return l < 45 ? 'זית' : 'צהוב / אוקר';
  if (h < 160) return 'ירוק';
  if (h < 195) return 'טורקיז';
  if (h < 250) return 'כחול';
  if (h < 290) return 'אינדיגו / סגול';
  return 'מגנטה';
}

/** Two colors are distinguishable at street distance when their LRV differs by ≥ 30 (BS 8300 guidance). */
export function lrvDistinct(a: string, b: string): boolean {
  return Math.abs(lrv(a) - lrv(b)) >= 30;
}

export function harmonies(base: string) {
  const { h, s, l } = hexToHsl(base);
  const rot = (d: number) => hslToHex({ h: (h + d + 360) % 360, s, l });
  return {
    complementary: [base, rot(180)],
    analogous: [rot(-30), base, rot(30)],
    triadic: [base, rot(120), rot(240)],
    splitComplementary: [base, rot(150), rot(210)],
  };
}
