import React from 'react';
import type { RevealedColor, AnalysisResult } from '@/hooks/useColorWheel';

interface ColorAnalysisProps {
  analysis: AnalysisResult;
  revealedColors: RevealedColor[];
  decomposition: string;
}

const ColorAnalysis: React.FC<ColorAnalysisProps> = ({ analysis, revealedColors, decomposition }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="newton-summary-card">
        <h2 className="text-lg font-semibold mb-2.5 text-newton-text">פרשנות לוגית</h2>
        <p className="leading-7 text-[#dce3ee] m-0">{analysis.logical}</p>
        {revealedColors.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mt-3.5">
            {revealedColors.map((item, i) => (
              <div key={i} className="w-[42px] h-[42px] rounded-full border-2 border-white/[0.24]"
                style={{ background: item.color, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)' }}
                title={`${item.name} | טבעת ${item.ring + 1}`} />
            ))}
          </div>
        )}
      </div>

      <div className="newton-summary-card">
        <h2 className="text-lg font-semibold mb-2.5 text-newton-text">פרשנות פסיכולוגית־מרחבית</h2>
        <p className="leading-7 text-[#dce3ee] m-0">{analysis.psych}</p>
        <p className="text-sm text-newton-muted leading-relaxed mt-2.5">{decomposition}</p>
      </div>
    </div>
  );
};

export default React.memo(ColorAnalysis);
