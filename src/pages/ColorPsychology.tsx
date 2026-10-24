import { useState, useMemo, useCallback } from 'react';
import {
  colorPsychologySpectrumData,
  SPECTRUM_MIN_THZ,
  SPECTRUM_MAX_THZ,
  VISIBLE_MIN_THZ,
  VISIBLE_MAX_THZ,
  SNAP_THRESHOLD_THZ,
  type ColorPsychologyStop,
} from '@/data/colorPsychologyData';
import { colorPsychologySpectrumLabels as L } from '@/data/colorPsychologyLabels';
import TopNav from '@/components/TopNav';

const { stops, spectrumZones } = colorPsychologySpectrumData;

function thzToColor(thz: number): string {
  if (thz < VISIBLE_MIN_THZ || thz > VISIBLE_MAX_THZ) return 'transparent';
  const t = (thz - VISIBLE_MIN_THZ) / (VISIBLE_MAX_THZ - VISIBLE_MIN_THZ);
  return `hsl(${t * 270}, 90%, 50%)`;
}

function findSnappedStop(thz: number): ColorPsychologyStop | null {
  for (const entry of stops) {
    if (Math.abs(thz - entry.frequencyTHz) <= SNAP_THRESHOLD_THZ) return entry;
  }
  return null;
}

const ColorPsychology = () => {
  const [rawValue, setRawValue] = useState(SPECTRUM_MIN_THZ);

  const snappedEntry = useMemo(() => findSnappedStop(rawValue), [rawValue]);
  const currentColor = useMemo(() => snappedEntry ? snappedEntry.hex : thzToColor(rawValue), [rawValue, snappedEntry]);
  const isInVisible = rawValue >= VISIBLE_MIN_THZ && rawValue <= VISIBLE_MAX_THZ;

  const irEndPct = ((VISIBLE_MIN_THZ - SPECTRUM_MIN_THZ) / (SPECTRUM_MAX_THZ - SPECTRUM_MIN_THZ)) * 100;
  const uvStartPct = ((VISIBLE_MAX_THZ - SPECTRUM_MIN_THZ) / (SPECTRUM_MAX_THZ - SPECTRUM_MIN_THZ)) * 100;
  const handlePct = ((rawValue - SPECTRUM_MIN_THZ) / (SPECTRUM_MAX_THZ - SPECTRUM_MIN_THZ)) * 100;

  const stopPositions = useMemo(
    () => stops.map((entry) => ({
      entry,
      pct: ((entry.frequencyTHz - SPECTRUM_MIN_THZ) / (SPECTRUM_MAX_THZ - SPECTRUM_MIN_THZ)) * 100,
    })),
    []
  );

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRawValue(Number(e.target.value));
  }, []);

  return (
    <div dir="rtl" className="newton-app min-h-screen" style={{ background: 'radial-gradient(circle at top, #1d2230 0%, #0f1115 45%, #0b0d11 100%)' }}>
      <TopNav />
      <div className="max-w-[960px] mx-auto p-6 pt-20 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--newton-text))' }}>{L.pageTitle}</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--newton-muted))' }}>{L.pageSubtitle}</p>
        </div>

        {/* Spectrum Bar */}
        <div className="newton-panel p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--newton-muted))' }}>{L.spectrumTitle}</h2>
          <p className="text-xs" style={{ color: 'hsl(var(--newton-muted))' }}>{L.spectrumHint}</p>

          {/* Visual spectrum */}
          <div className="relative h-12 rounded-xl overflow-hidden select-none" style={{ direction: 'ltr' }}>
            <div className="absolute inset-y-0 left-0 flex items-center justify-center"
              style={{ width: `${irEndPct}%`, background: 'linear-gradient(to right, #1a0a0a, #3d0000)' }}>
              <span className="text-[10px] font-medium" style={{ color: 'hsl(var(--newton-muted))' }}>{spectrumZones.infrared.label}</span>
            </div>
            <div className="absolute inset-y-0"
              style={{ left: `${irEndPct}%`, width: `${uvStartPct - irEndPct}%`, background: 'linear-gradient(to right, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #4400cc, #8800aa)' }} />
            <div className="absolute inset-y-0 right-0 flex items-center justify-center"
              style={{ width: `${100 - uvStartPct}%`, background: 'linear-gradient(to right, #1a0033, #0a0015)' }}>
              <span className="text-[10px] font-medium" style={{ color: 'hsl(var(--newton-muted))' }}>{spectrumZones.ultraviolet.label}</span>
            </div>

            {stopPositions.map(({ entry, pct }) => (
              <div key={entry.key} className="absolute top-0 bottom-0 w-0.5 opacity-60"
                style={{ left: `${pct}%`, backgroundColor: 'rgba(255,255,255,0.5)' }} />
            ))}

            <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 shadow-lg transition-shadow pointer-events-none z-10"
              style={{
                left: `${handlePct}%`, transform: 'translate(-50%, -50%)',
                backgroundColor: isInVisible ? currentColor : '#333',
                borderColor: snappedEntry ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: snappedEntry ? `0 0 12px ${currentColor}` : 'none',
              }} />

            <input type="range" min={SPECTRUM_MIN_THZ} max={SPECTRUM_MAX_THZ} step={1} value={rawValue}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              style={{ direction: 'ltr' }} />
          </div>

          {/* Stop labels */}
          <div className="relative h-6" style={{ direction: 'ltr' }}>
            {stopPositions.map(({ entry, pct }) => (
              <span key={entry.key} className="absolute text-[10px] -translate-x-1/2 transition-colors"
                style={{
                  left: `${pct}%`,
                  color: snappedEntry?.key === entry.key ? '#fff' : 'hsl(var(--newton-muted))',
                  fontWeight: snappedEntry?.key === entry.key ? 700 : 400,
                }}>
                {entry.name}
              </span>
            ))}
          </div>

          {/* Live frequency */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: isInVisible ? currentColor : '#222', borderColor: 'hsl(var(--newton-panel-2))' }} />
              <span className="text-sm" style={{ color: 'hsl(var(--newton-text))' }}>
                {L.currentFrequencyTitle}: <strong>{rawValue} {L.frequencyUnit}</strong>
              </span>
            </div>
            {!snappedEntry && (
              <span className="text-xs" style={{ color: 'hsl(var(--newton-muted))' }}>
                {isInVisible ? L.intermediateStateHint : (rawValue < VISIBLE_MIN_THZ ? spectrumZones.infrared.label : spectrumZones.ultraviolet.label)}
              </span>
            )}
            {snappedEntry && (
              <span className="text-xs font-medium" style={{ color: 'hsl(var(--newton-text))' }}>
                {L.selectedColorTitle}: {snappedEntry.name}
              </span>
            )}
          </div>
          <p className="text-[10px]" style={{ color: 'hsl(var(--newton-muted))' }}>{L.stopPointHint}</p>
        </div>

        {/* Explanation panel — only at stop points */}
        {snappedEntry && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="newton-panel p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl shadow-lg" style={{ backgroundColor: snappedEntry.hex }} />
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--newton-text))' }}>{snappedEntry.name}</h2>
                  <p className="text-sm mt-1" style={{ color: 'hsl(var(--newton-muted))' }}>
                    {snappedEntry.frequencyTHz} {L.frequencyUnit} · {snappedEntry.wavelengthNm} {L.wavelengthUnit}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="newton-panel p-6 space-y-5">
                <Section title={L.positiveMeaningTitle}><P>{snappedEntry.positiveMeaning}</P></Section>
                <Section title={L.negativeMeaningTitle}><P>{snappedEntry.negativeMeaning}</P></Section>
                <Section title={L.effectsTitle}><P>{snappedEntry.effects}</P></Section>
              </div>
              <div className="newton-panel p-6 space-y-5">
                <Section title={L.needForBalanceTitle}><P>{snappedEntry.needForBalance}</P></Section>
                <Section title={L.whyBalanceTitle}><P>{snappedEntry.whyBalanceIsNeeded}</P></Section>
                <Section title={L.balancingColorTitle}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg shadow" style={{ backgroundColor: snappedEntry.balancingColorHex }} />
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--newton-text))' }}>{snappedEntry.balancingColorName}</span>
                  </div>
                </Section>
                <Section title={L.balancingExplanationTitle}><P>{snappedEntry.balancingExplanation}</P></Section>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="newton-panel p-6">
                <Section title={L.scientificExplanationTitle}><P>{snappedEntry.scientificExplanation}</P></Section>
              </div>
              <div className="newton-panel p-6">
                <Section title={L.psychologicalExplanationTitle}><P>{snappedEntry.psychologicalExplanation}</P></Section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--newton-text))' }}>{children}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-semibold" style={{ color: 'hsl(var(--newton-accent))' }}>{title}</h3>
      {children}
    </div>
  );
}

export default ColorPsychology;
