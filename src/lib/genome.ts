import type { Palette, SlotKey } from '@/store/genomeStore';
import { SLOT_LABELS, SLOT_ORDER, FINISH_LABELS } from '@/store/genomeStore';
import {
  colorFamily, contrastRatio, hexToHsl, hexToRgb, lrv, solarAbsorptance, temperatureOf, TEMPERATURE_LABEL,
} from '@/lib/color';

export type Severity = 'ok' | 'info' | 'warn';

export interface Finding {
  severity: Severity;
  title: string;
  detail: string;
}

const HUE_LETTERS = ['R', 'O', 'Y', 'L', 'G', 'T', 'C', 'B', 'I', 'V', 'M', 'P'];

/** Short, readable code that fingerprints a palette: hue letter + LRV per slot. */
export function genomeCode(p: Palette): string {
  return 'AG-' + SLOT_ORDER.map(k => {
    const { h, s } = hexToHsl(p[k].color);
    const letter = s < 12 ? 'N' : HUE_LETTERS[Math.floor(((h + 15) % 360) / 30)];
    return `${letter}${Math.round(lrv(p[k].color))}`;
  }).join('·');
}

export function analyzeFacade(p: Palette): Finding[] {
  const out: Finding[] = [];
  const body = p.body.color;
  const bodyLrv = lrv(body);
  const bodyHsl = hexToHsl(body);

  if (bodyLrv < 35) {
    out.push({ severity: 'warn', title: 'עומס תרמי גבוה', detail: `גוף המבנה סופג כ־${Math.round(solarAbsorptance(body) * 100)}% מקרינת השמש (LRV ${bodyLrv}). באקלים חופי־חם מומלץ LRV ≥ 50 בחזיתות דרום ומערב — מפחית אי־חום עירוני ועומס מיזוג.` });
  } else if (bodyLrv < 50) {
    out.push({ severity: 'info', title: 'ספיגת חום בינונית', detail: `LRV ${bodyLrv}. סביר, אך שקלי גוון בהיר יותר או צבע "קר" (Cool Pigment) מחזיר אינפרא־אדום.` });
  } else {
    out.push({ severity: 'ok', title: 'ביצועים תרמיים טובים', detail: `גוף המבנה מחזיר ${Math.round(bodyLrv)}% מהאור הנראה — תורם להפחתת אי־חום עירוני.` });
  }

  if (bodyLrv > 88) {
    out.push({ severity: 'warn', title: 'סינוור', detail: 'לבן טהור (LRV > 88) עלול לסנוור הולכי רגל ושכנים בשעות הצהריים. גוון שבור (Off‑white) עם LRV של 75–85 נעים יותר.' });
  }

  if (bodyHsl.s > 45 && bodyHsl.l > 20 && bodyHsl.l < 85) {
    out.push({ severity: 'warn', title: 'רוויה גבוהה בגוף המבנה', detail: 'צבע רווי כצבע דומיננטי חורג בדרך כלל מהנחיות מרחביות עירוניות. מומלץ להעביר את הרוויה לתפקיד ההדגשה (3–5% מהחזית).' });
  }

  const frameDiff = Math.abs(lrv(p.frames.color) - bodyLrv);
  out.push(frameDiff >= 30
    ? { severity: 'ok', title: 'הגדרת פתחים ברורה', detail: `הפרש LRV של ${Math.round(frameDiff)} בין מסגרות לגוף — הפתחים נקראים היטב מהרחוב.` }
    : { severity: 'info', title: 'פתחים מתמזגים', detail: `הפרש LRV של ${Math.round(frameDiff)} בלבד. מתאים לשפה מונוליתית; לקריאות גבוהה יותר העמיקי את המסגרות.` });

  const entranceDiff = Math.abs(lrv(p.accent.color) - lrv(p.base.color));
  out.push(entranceDiff >= 30
    ? { severity: 'ok', title: 'נגישות — זיהוי כניסה', detail: `הגגון והכניסה בולטים מהבסיס (הפרש LRV ${Math.round(entranceDiff)} ≥ 30), בהתאם להנחיות נגישות לכבדי ראייה.` }
    : { severity: 'warn', title: 'נגישות — כניסה לא מובחנת', detail: `הפרש LRV בין ההדגשה לקומת הקרקע הוא ${Math.round(entranceDiff)}. להתמצאות של כבדי ראייה נדרש הפרש של 30 לפחות.` });

  const accentContrast = contrastRatio(p.accent.color, body);
  if (accentContrast < 1.4) {
    out.push({ severity: 'info', title: 'הדגשה חלשה', detail: `יחס ניגוד ${accentContrast}:1 בין ההדגשה לגוף. ההדגשה כמעט לא נקראת — אפשר להעמיק גוון או רוויה.` });
  }

  const temps = SLOT_ORDER.map(k => temperatureOf(p[k].color));
  const warm = temps.filter(t => t === 'warm').length;
  const cool = temps.filter(t => t === 'cool').length;
  if (warm && cool) {
    out.push({ severity: 'ok', title: 'מתח טמפרטורה', detail: `${warm} תפקידים חמים ו־${cool} קרים — ניגוד טמפרטורה יוצר עומק ותנועה בחזית.` });
  } else {
    out.push({ severity: 'info', title: 'טמפרטורה אחידה', detail: `הפלטה ${warm ? 'חמה' : cool ? 'קרה' : 'ניטרלית'} כולה — אחידה ושקטה. נקודת צבע מנוגדת אחת תחדד מוקד.` });
  }

  return out;
}

export interface SpecRow {
  slot: SlotKey;
  name: string;
  hex: string;
  rgb: string;
  lrv: number;
  family: string;
  temperature: string;
  finish: string;
  share: number;
  absorptance: number;
}

export function specRows(p: Palette): SpecRow[] {
  return SLOT_ORDER.map(k => {
    const { r, g, b } = hexToRgb(p[k].color);
    return {
      slot: k,
      name: SLOT_LABELS[k].name,
      hex: p[k].color.toUpperCase(),
      rgb: `${r},${g},${b}`,
      lrv: lrv(p[k].color),
      family: colorFamily(p[k].color),
      temperature: TEMPERATURE_LABEL[temperatureOf(p[k].color)],
      finish: FINISH_LABELS[p[k].finish],
      share: SLOT_LABELS[k].share,
      absorptance: solarAbsorptance(p[k].color),
    };
  });
}

export function specCsv(p: Palette): string {
  const head = ['תפקיד', 'HEX', 'RGB', 'LRV', 'משפחה', 'טמפרטורה', 'גימור', 'שטח %', 'ספיגות סולארית'];
  const rows = specRows(p).map(r => [r.name, r.hex, `"${r.rgb}"`, r.lrv, r.family, r.temperature, r.finish, r.share, r.absorptance]);
  return '﻿' + [head, ...rows].map(r => r.join(',')).join('\n');
}

export function specCss(p: Palette): string {
  return `:root {\n${SLOT_ORDER.map(k => `  --facade-${k}: ${p[k].color}; /* ${SLOT_LABELS[k].name} · LRV ${lrv(p[k].color)} */`).join('\n')}\n}\n`;
}

export function download(filename: string, data: string, type = 'text/plain') {
  const url = data.startsWith('data:') ? data : URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  if (!data.startsWith('data:')) setTimeout(() => URL.revokeObjectURL(url), 1000);
}
