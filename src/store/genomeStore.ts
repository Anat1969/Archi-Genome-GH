import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { lrv, hexToHsl } from '@/lib/color';

export type SlotKey = 'body' | 'secondary' | 'frames' | 'accent' | 'base' | 'roof';
export type Finish = 'plaster' | 'stone' | 'concrete' | 'metal' | 'wood';

export interface Slot {
  color: string;
  finish: Finish;
}

export type Palette = Record<SlotKey, Slot>;

export const SLOT_LABELS: Record<SlotKey, { name: string; role: string; share: number }> = {
  body: { name: 'גוף המבנה', role: 'הצבע הדומיננטי של המעטפת', share: 60 },
  secondary: { name: 'מסה משנית', role: 'נפחים, מרפסות וקורות', share: 20 },
  base: { name: 'קומת קרקע', role: 'בסיס, חזית מסחרית', share: 10 },
  frames: { name: 'מסגרות ומעקות', role: 'חלונות, מעקות, פרגולות', share: 5 },
  accent: { name: 'הדגשה', role: 'כניסה, שילוט, רפפות', share: 3 },
  roof: { name: 'גג וקופינג', role: 'מעקה גג וקצה עליון', share: 2 },
};

export const SLOT_ORDER: SlotKey[] = ['body', 'secondary', 'base', 'frames', 'accent', 'roof'];

export const FINISH_LABELS: Record<Finish, string> = {
  plaster: 'טיח', stone: 'אבן', concrete: 'בטון חשוף', metal: 'מתכת', wood: 'עץ',
};

export interface Preset {
  id: string;
  name: string;
  story: string;
  palette: Palette;
}

const p = (color: string, finish: Finish): Slot => ({ color, finish });

export const PRESETS: Preset[] = [
  {
    id: 'mediterranean',
    name: 'ים־תיכוני אשדודי',
    story: 'לבן חמים שמחזיר אור, חול ים בבסיס, תכלת ים בהדגשה. מותאם לשמש חזקה ולמליחות.',
    palette: {
      body: p('#f2ede3', 'plaster'), secondary: p('#d9c7a7', 'stone'), base: p('#b9a07a', 'stone'),
      frames: p('#3b4a55', 'metal'), accent: p('#1f4e79', 'metal'), roof: p('#e6dfd2', 'plaster'),
    },
  },
  {
    id: 'bauhaus',
    name: 'העיר הלבנה',
    story: 'באוהאוס תל־אביבי: לבן נקי, מרפסות סרט, מסגרות כהות ונגיעת אוקר.',
    palette: {
      body: p('#f6f5f1', 'plaster'), secondary: p('#ebe7de', 'plaster'), base: p('#cfc8bb', 'plaster'),
      frames: p('#26292c', 'metal'), accent: p('#d9a42b', 'metal'), roof: p('#f6f5f1', 'plaster'),
    },
  },
  {
    id: 'jerusalem',
    name: 'אבן ירושלמית',
    story: 'אבן גיר זהובה, מסגרות ברונזה ועץ חם. חומריות כבדה וזמן ארוך.',
    palette: {
      body: p('#dcc9a3', 'stone'), secondary: p('#c9b083', 'stone'), base: p('#a88f66', 'stone'),
      frames: p('#5a4630', 'metal'), accent: p('#8a5a2b', 'wood'), roof: p('#cdb88f', 'stone'),
    },
  },
  {
    id: 'brutalist',
    name: 'ברוטליזם רך',
    story: 'בטון חשוף אפור, עץ אלון בהדגשה ושחור עמוק במסגרות.',
    palette: {
      body: p('#a3a29d', 'concrete'), secondary: p('#8e8d88', 'concrete'), base: p('#6e6d69', 'concrete'),
      frames: p('#1d1f21', 'metal'), accent: p('#b07a45', 'wood'), roof: p('#9a9994', 'concrete'),
    },
  },
  {
    id: 'nordic',
    name: 'נורדי',
    story: 'אפור־כחלחל שקט, עץ בהיר ולבן. רוגע, מינימליזם ואור רך.',
    palette: {
      body: p('#e9ecee', 'plaster'), secondary: p('#9fb1bc', 'plaster'), base: p('#596b78', 'plaster'),
      frames: p('#2c3338', 'metal'), accent: p('#c79a63', 'wood'), roof: p('#3d474e', 'metal'),
    },
  },
  {
    id: 'terracotta',
    name: 'טרקוטה וירוק',
    story: 'אדמה חמה ושיחי זית. פלטה ביופילית שמחברת בין המבנה לגינה.',
    palette: {
      body: p('#e8d6c3', 'plaster'), secondary: p('#c0683f', 'plaster'), base: p('#8f4a2d', 'stone'),
      frames: p('#3f4a36', 'metal'), accent: p('#6f8f4e', 'metal'), roof: p('#b55d38', 'plaster'),
    },
  },
];

export interface SavedGenome {
  id: string;
  name: string;
  createdAt: number;
  palette: Palette;
}

interface GenomeState {
  palette: Palette;
  presetId: string | null;
  saved: SavedGenome[];
  setSlotColor: (slot: SlotKey, color: string) => void;
  setSlotFinish: (slot: SlotKey, finish: Finish) => void;
  applyPreset: (id: string) => void;
  applyColors: (colors: string[]) => void;
  saveCurrent: (name: string) => void;
  loadSaved: (id: string) => void;
  removeSaved: (id: string) => void;
}

/**
 * Distribute an arbitrary list of picked colors over the facade roles the way
 * an architect would: lightest & calmest becomes the body, the most saturated
 * becomes the accent, the darkest anchors frames.
 */
export function assignColorsToSlots(colors: string[], current: Palette): Palette {
  if (!colors.length) return current;
  const next: Palette = JSON.parse(JSON.stringify(current));
  const pool = [...new Set(colors)];
  const byLight = [...pool].sort((a, b) => lrv(b) - lrv(a));
  const bySat = [...pool].sort((a, b) => hexToHsl(b).s - hexToHsl(a).s);
  const take = (c: string | undefined) => {
    if (!c) return undefined;
    const i = pool.indexOf(c);
    if (i < 0) return undefined;
    pool.splice(i, 1);
    return c;
  };

  next.body.color = take(byLight[0]) || next.body.color;
  if (pool.length) next.accent.color = take(bySat.find(c => pool.includes(c))) || next.accent.color;
  if (pool.length) {
    const dark = [...pool].sort((a, b) => lrv(a) - lrv(b))[0];
    next.frames.color = take(dark) || next.frames.color;
  }
  if (pool.length) next.secondary.color = take(pool[0]) || next.secondary.color;
  if (pool.length) next.base.color = take(pool[0]) || next.base.color;
  if (pool.length) next.roof.color = take(pool[0]) || next.roof.color;
  return next;
}

export const useGenomeStore = create<GenomeState>()(
  persist(
    (set, get) => ({
      palette: PRESETS[0].palette,
      presetId: PRESETS[0].id,
      saved: [],
      setSlotColor: (slot, color) =>
        set(s => ({ presetId: null, palette: { ...s.palette, [slot]: { ...s.palette[slot], color } } })),
      setSlotFinish: (slot, finish) =>
        set(s => ({ presetId: null, palette: { ...s.palette, [slot]: { ...s.palette[slot], finish } } })),
      applyPreset: id => {
        const preset = PRESETS.find(pr => pr.id === id);
        if (preset) set({ palette: JSON.parse(JSON.stringify(preset.palette)), presetId: id });
      },
      applyColors: colors => set(s => ({ presetId: null, palette: assignColorsToSlots(colors, s.palette) })),
      saveCurrent: name =>
        set(s => ({
          saved: [
            { id: crypto.randomUUID(), name, createdAt: Date.now(), palette: JSON.parse(JSON.stringify(get().palette)) },
            ...s.saved,
          ].slice(0, 24),
        })),
      loadSaved: id => {
        const g = get().saved.find(x => x.id === id);
        if (g) set({ palette: JSON.parse(JSON.stringify(g.palette)), presetId: null });
      },
      removeSaved: id => set(s => ({ saved: s.saved.filter(x => x.id !== id) })),
    }),
    { name: 'archi-genome-v1' },
  ),
);
