import { motion } from 'framer-motion';
import type { Palette } from '@/store/genomeStore';
import { SLOT_LABELS, SLOT_ORDER } from '@/store/genomeStore';
import { lrv } from '@/lib/color';

/** Proportional "chromosome" of a facade palette — each band sized by its 60/30/10 share. */
const GenomeStrip = ({ palette, compact = false }: { palette: Palette; compact?: boolean }) => {
  if (compact) {
    return (
      <div className="flex h-9 w-48 rounded-xl overflow-hidden border border-white/15 shadow-lg">
        {SLOT_ORDER.map(k => (
          <motion.span key={k} layout title={SLOT_LABELS[k].name} animate={{ backgroundColor: palette[k].color }}
            transition={{ duration: 0.5 }} style={{ flex: SLOT_LABELS[k].share }} />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex h-14 rounded-2xl overflow-hidden border border-white/15">
        {SLOT_ORDER.map(k => (
          <motion.div key={k} animate={{ backgroundColor: palette[k].color }} transition={{ duration: 0.5 }}
            style={{ flex: SLOT_LABELS[k].share }} className="relative" title={SLOT_LABELS[k].name}>
            {SLOT_LABELS[k].share >= 10 && (
              <span className="absolute bottom-1 right-2 text-[10px] font-bold"
                style={{ color: lrv(palette[k].color) > 45 ? '#111' : '#fff' }}>{SLOT_LABELS[k].share}%</span>
            )}
          </motion.div>
        ))}
      </div>
      {/* LRV ladder */}
      <div className="relative h-16 rounded-2xl bg-gradient-to-l from-white/80 via-neutral-500 to-black border border-white/10">
        {SLOT_ORDER.map((k, i) => {
          const v = lrv(palette[k].color);
          return (
            <motion.div key={k} className="absolute top-2 -translate-x-1/2 flex flex-col items-center"
              animate={{ left: `${v}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              style={{ top: 4 + (i % 2) * 22 }}>
              <span className="w-5 h-5 rounded-full border-2 border-white shadow-md" style={{ background: palette[k].color }} title={`${SLOT_LABELS[k].name} · LRV ${v}`} />
            </motion.div>
          );
        })}
        <span className="absolute -bottom-5 left-0 text-[10px] text-newton-muted">LRV 0</span>
        <span className="absolute -bottom-5 right-0 text-[10px] text-newton-muted">100</span>
      </div>
      <div className="h-3" />
    </div>
  );
};

export default GenomeStrip;
