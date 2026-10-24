import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import type { RevealedColor, AnalysisResult } from '@/hooks/useColorWheel';
import { useGenomeStore } from '@/store/genomeStore';
import { contrastRatio, lrv } from '@/lib/color';

interface ColorAnalysisProps {
  analysis: AnalysisResult;
  revealedColors: RevealedColor[];
  decomposition: string;
}

const ColorAnalysis: React.FC<ColorAnalysisProps> = ({ analysis, revealedColors, decomposition }) => {
  const navigate = useNavigate();
  const applyColors = useGenomeStore(s => s.applyColors);

  const sendToStudio = () => {
    applyColors(revealedColors.map(c => c.color));
    navigate('/studio');
  };

  const maxContrast = revealedColors.length > 1
    ? Math.max(...revealedColors.flatMap((a, i) => revealedColors.slice(i + 1).map(b => contrastRatio(a.color, b.color))))
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="newton-summary-card">
          <h2 className="text-lg font-semibold mb-2.5 text-newton-text">פרשנות לוגית</h2>
          <p className="leading-7 text-[#dce3ee] m-0">{analysis.logical}</p>
          <div className="flex flex-wrap gap-2.5 mt-3.5">
            <AnimatePresence>
              {revealedColors.map(item => (
                <motion.div key={`${item.ring}-${item.baseSector}`} layout
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="flex flex-col items-center gap-1">
                  <div className="w-[42px] h-[42px] rounded-full border-2 border-white/[0.24]"
                    style={{ background: item.color, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)' }}
                    title={`${item.name} | טבעת ${item.ring + 1}`} />
                  <span className="text-[10px] text-newton-muted font-mono" dir="ltr">{item.color.toUpperCase()}</span>
                  <span className="text-[10px] text-newton-muted">LRV {lrv(item.color)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="newton-summary-card">
          <h2 className="text-lg font-semibold mb-2.5 text-newton-text">פרשנות פסיכולוגית־מרחבית</h2>
          <p className="leading-7 text-[#dce3ee] m-0">{analysis.psych}</p>
          <p className="text-sm text-newton-muted leading-relaxed mt-2.5">{decomposition}</p>
          {maxContrast !== null && (
            <p className="text-sm text-newton-muted mt-2.5">ניגוד מרבי בבחירה: <b className="text-newton-text tabular-nums">{maxContrast}:1</b></p>
          )}
        </div>
      </div>

      <motion.button
        onClick={sendToStudio}
        disabled={!revealedColors.length}
        whileHover={revealedColors.length ? { scale: 1.01 } : undefined}
        whileTap={revealedColors.length ? { scale: 0.99 } : undefined}
        className="newton-action-btn primary w-full text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Building2 className="w-5 h-5 ml-1" />
        {revealedColors.length ? 'להחיל את הבחירה על מבנה בתלת־ממד' : 'חשפי צבעים בגלגל כדי להחיל אותם על מבנה'}
      </motion.button>
    </div>
  );
};

export default React.memo(ColorAnalysis);
