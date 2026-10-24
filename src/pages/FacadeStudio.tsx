import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera, Download, FileSpreadsheet, Pause, Play, Save, Sun, Moon, Trash2, Users, RotateCw, Copy, Check,
  AlertTriangle, Info, CheckCircle2, Gauge,
} from 'lucide-react';
import { toast } from 'sonner';
import TopNav from '@/components/TopNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  useGenomeStore, PRESETS, SLOT_LABELS, SLOT_ORDER, FINISH_LABELS, type Finish, type SlotKey,
} from '@/store/genomeStore';
import { BASE_COLORS, ringColor } from '@/hooks/useColorWheel';
import { analyzeFacade, download, genomeCode, specCss, specCsv, specRows, type Severity } from '@/lib/genome';
import { lrv } from '@/lib/color';
import { MONTH_NAMES, compassLabel, sunPosition } from '@/lib/sun';
import type { CameraPreset, SceneSettings } from '@/components/three/BuildingScene';
import GenomeStrip from '@/components/GenomeStrip';

const BuildingScene = lazy(() => import('@/components/three/BuildingScene'));

const PRESET_LABELS: Record<CameraPreset, string> = {
  street: 'הולך רגל', corner: 'פינת רחוב', aerial: 'אווירי', elevation: 'חזית',
};

const SWATCHES = [
  '#f6f5f1', '#f2ede3', '#e6dfd2', '#dcc9a3', '#c9b083', '#b9a07a', '#a3a29d', '#6e6d69', '#3b4a55', '#26292c',
  ...BASE_COLORS.map(c => ringColor(c, 1)), ...BASE_COLORS.map(c => ringColor(c, 3)),
];

const severityIcon: Record<Severity, JSX.Element> = {
  ok: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
  info: <Info className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />,
  warn: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
};

function SceneLoader() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-newton-muted">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#a7c5ff] animate-spin" />
        <span className="text-sm">טוען סצנה תלת־ממדית…</span>
      </div>
    </div>
  );
}

const FacadeStudio = () => {
  const { palette, presetId, saved, setSlotColor, setSlotFinish, applyPreset, saveCurrent, loadSaved, removeSaved } = useGenomeStore();
  const [activeSlot, setActiveSlot] = useState<SlotKey>('body');
  const [settings, setSettings] = useState<SceneSettings>({
    month: 6, hour: 15.5,
    quality: typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 'eco' : 'high', preset: 'corner', autoRotate: false, showPeople: true,
  });
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<(() => string) | null>(null);

  const update = useCallback(<K extends keyof SceneSettings>(k: K, v: SceneSettings[K]) => setSettings(s => ({ ...s, [k]: v })), []);

  // Day-cycle animation: ~1 simulated hour per second
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now(), acc = 0;
    const tick = (now: number) => {
      acc += (now - last) / 1000;
      last = now;
      if (acc > 1 / 24) {
        const step = acc;
        acc = 0;
        setSettings(s => ({ ...s, hour: s.hour + step > 20.5 ? 5 : s.hour + step }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const sun = useMemo(() => sunPosition(settings.month, settings.hour), [settings.month, settings.hour]);
  const findings = useMemo(() => analyzeFacade(palette), [palette]);
  const rows = useMemo(() => specRows(palette), [palette]);
  const code = useMemo(() => genomeCode(palette), [palette]);
  const score = useMemo(() => {
    const w = { ok: 1, info: 0.6, warn: 0.1 };
    return Math.round((findings.reduce((a, f) => a + w[f.severity], 0) / findings.length) * 100);
  }, [findings]);

  const hh = Math.floor(settings.hour);
  const mm = Math.round((settings.hour - hh) * 60);
  const timeLabel = `${String(hh).padStart(2, '0')}:${String(mm === 60 ? 0 : mm).padStart(2, '0')}`;

  const onCapture = useCallback((fn: () => string) => { captureRef.current = fn; }, []);

  const exportPng = () => {
    if (!captureRef.current) return;
    download(`archi-genome-${code}.png`, captureRef.current());
    toast.success('הדמיה נשמרה כ־PNG');
  };

  const copySpec = async () => {
    const text = rows.map(r => `${r.name}: ${r.hex} · LRV ${r.lrv} · ${r.finish} · ${r.share}%`).join('\n');
    await navigator.clipboard.writeText(`${code}\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div dir="rtl" className="newton-app min-h-screen" style={{ background: 'radial-gradient(circle at top, #1d2230 0%, #0f1115 45%, #0b0d11 100%)' }}>
      <TopNav />
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pt-20 pb-8">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-xs tracking-[0.3em] text-newton-accent font-semibold">FACADE STUDIO · 3D</p>
            <h1 className="ag-display text-3xl md:text-4xl font-bold mt-1">סטודיו חזיתות</h1>
            <p className="text-sm text-newton-muted mt-1 max-w-[640px]">
              מחילים פלטה על מבנה אמיתי, בשמש אמיתית של אשדוד, ובודקים מה קורה לצבע בחומר, באור ובזמן.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GenomeStrip palette={palette} compact />
            <code className="hidden sm:block text-[11px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-newton-muted ltr" dir="ltr">{code}</code>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
          {/* Viewport */}
          <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="relative rounded-[28px] overflow-hidden border border-white/10 bg-black/40 h-[62vh] xl:h-[calc(100vh-170px)] min-h-[420px]">
            <Suspense fallback={<SceneLoader />}>
              <BuildingScene palette={palette} settings={settings} onCaptureReady={onCapture} />
            </Suspense>

            {/* HUD: camera presets */}
            <div className="absolute top-3 right-3 left-3 flex flex-wrap gap-2 justify-between pointer-events-none">
              <div className="flex flex-wrap gap-1.5 pointer-events-auto bg-black/45 backdrop-blur-md rounded-2xl p-1.5 border border-white/10">
                {(Object.keys(PRESET_LABELS) as CameraPreset[]).map(p => (
                  <button key={p} onClick={() => update('preset', p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${settings.preset === p ? 'bg-[#a7c5ff] text-[#0d1320]' : 'text-white/80 hover:bg-white/10'}`}>
                    {PRESET_LABELS[p]}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 pointer-events-auto">
                <button onClick={exportPng} title="שמירת הדמיה" className="ag-hud-btn"><Camera className="w-4 h-4" /></button>
                <button onClick={() => update('autoRotate', !settings.autoRotate)} title="סיבוב אוטומטי"
                  className={`ag-hud-btn ${settings.autoRotate ? 'bg-[#a7c5ff] text-[#0d1320]' : ''}`}><RotateCw className="w-4 h-4" /></button>
              </div>
            </div>

            {/* HUD: sun readout + time scrubber */}
            <div className="absolute bottom-3 right-3 left-3 pointer-events-auto bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setPlaying(p => !p)} className="ag-hud-btn shrink-0" title={playing ? 'עצירה' : 'הפעלת מחזור יום'}>
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                {sun.altitude > 0 ? <Sun className="w-4 h-4 text-amber-300 shrink-0" /> : <Moon className="w-4 h-4 text-sky-200 shrink-0" />}
                <span className="font-bold tabular-nums w-12 text-sm" dir="ltr">{timeLabel}</span>
                <Slider dir="ltr" min={5} max={20.5} step={0.05} value={[settings.hour]}
                  onValueChange={([v]) => { setPlaying(false); update('hour', v); }} className="flex-1" />
                <span className="hidden md:block text-[11px] text-white/70 whitespace-nowrap">
                  גובה {Math.round(sun.altitude)}° · {compassLabel(sun.azimuth)} · {MONTH_NAMES[settings.month - 1]}
                </span>
              </div>
            </div>
          </motion.section>

          {/* Control panel */}
          <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="newton-panel p-4 xl:h-[calc(100vh-170px)] xl:overflow-y-auto ag-scroll">
            <Tabs defaultValue="palette" dir="rtl">
              <TabsList className="grid grid-cols-4 bg-white/5 rounded-2xl p-1 h-auto">
                {[['palette', 'פלטה'], ['light', 'אור'], ['genome', 'גנום'], ['export', 'ייצוא']].map(([v, l]) => (
                  <TabsTrigger key={v} value={v} className="rounded-xl py-2 text-sm text-white/70 data-[state=active]:bg-[#a7c5ff] data-[state=active]:text-[#0d1320]">{l}</TabsTrigger>
                ))}
              </TabsList>

              {/* Palette */}
              <TabsContent value="palette" className="space-y-4 mt-4">
                <div>
                  <h3 className="ag-label">תבניות מוכנות</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map(pr => (
                      <button key={pr.id} onClick={() => applyPreset(pr.id)} title={pr.story}
                        className={`group text-right rounded-2xl p-2.5 border transition ${presetId === pr.id ? 'border-[#a7c5ff] bg-[#a7c5ff]/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}>
                        <div className="flex h-5 rounded-lg overflow-hidden mb-2">
                          {SLOT_ORDER.map(k => <span key={k} style={{ background: pr.palette[k].color, flex: SLOT_LABELS[k].share }} />)}
                        </div>
                        <span className="text-xs font-semibold">{pr.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="ag-label">תפקידי צבע בחזית</h3>
                  <div className="space-y-1.5">
                    {SLOT_ORDER.map(k => (
                      <button key={k} onClick={() => setActiveSlot(k)}
                        className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2 border transition text-right ${activeSlot === k ? 'border-[#a7c5ff] bg-white/[0.06]' : 'border-transparent hover:bg-white/[0.04]'}`}>
                        <motion.span layout className="w-9 h-9 rounded-xl border border-white/20 shrink-0 shadow-inner" style={{ background: palette[k].color }} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold">{SLOT_LABELS[k].name}</span>
                          <span className="block text-[11px] text-newton-muted truncate">{SLOT_LABELS[k].role}</span>
                        </span>
                        <span className="text-[11px] text-newton-muted tabular-nums" dir="ltr">LRV {lrv(palette[k].color)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeSlot} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/20 cursor-pointer shrink-0" style={{ background: palette[activeSlot].color }}>
                        <input type="color" value={palette[activeSlot].color} onChange={e => setSlotColor(activeSlot, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer" aria-label="בחירת צבע" />
                      </label>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{SLOT_LABELS[activeSlot].name}</p>
                        <input dir="ltr" value={palette[activeSlot].color}
                          onChange={e => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setSlotColor(activeSlot, e.target.value)}
                          className="mt-1 w-28 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {SWATCHES.map(c => (
                        <button key={c} onClick={() => setSlotColor(activeSlot, c)} title={c}
                          className="aspect-square rounded-md border border-white/10 hover:scale-110 transition" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(FINISH_LABELS) as Finish[]).map(f => (
                        <button key={f} onClick={() => setSlotFinish(activeSlot, f)}
                          className={`px-3 py-1.5 rounded-xl text-xs border transition ${palette[activeSlot].finish === f ? 'bg-[#a7c5ff] text-[#0d1320] border-transparent font-bold' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                          {FINISH_LABELS[f]}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* Light */}
              <TabsContent value="light" className="space-y-5 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="ag-label !mb-0">חודש</span><span className="text-newton-muted">{MONTH_NAMES[settings.month - 1]}</span></div>
                  <Slider dir="ltr" min={1} max={12} step={1} value={[settings.month]} onValueChange={([v]) => update('month', v)} />
                  <div className="flex gap-1.5 pt-1">
                    {[[12, 'היפוך חורף'], [3, 'שוויון'], [6, 'היפוך קיץ']].map(([m, l]) => (
                      <button key={m} onClick={() => update('month', m as number)} className="flex-1 text-[11px] py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">{l}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="ag-label !mb-0">שעה (זמן שמש)</span><span className="text-newton-muted" dir="ltr">{timeLabel}</span></div>
                  <Slider dir="ltr" min={5} max={20.5} step={0.05} value={[settings.hour]} onValueChange={([v]) => { setPlaying(false); update('hour', v); }} />
                  <div className="flex gap-1.5 pt-1">
                    {[[7, 'בוקר'], [12, 'צהריים'], [17.5, 'שעת זהב'], [19.8, 'לילה']].map(([h, l]) => (
                      <button key={h} onClick={() => { setPlaying(false); update('hour', h as number); }} className="flex-1 text-[11px] py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">{l}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="newton-status-card"><p className="text-[11px] text-newton-muted">גובה שמש</p><p className="text-xl font-bold tabular-nums">{Math.round(sun.altitude)}°</p></div>
                  <div className="newton-status-card"><p className="text-[11px] text-newton-muted">אזימוט</p><p className="text-xl font-bold tabular-nums">{Math.round(sun.azimuth)}°</p><p className="text-[11px] text-newton-muted">{compassLabel(sun.azimuth)}</p></div>
                </div>
                <p className="text-xs text-newton-muted leading-relaxed">
                  מיקום השמש מחושב לקו רוחב {31.8}° (אשדוד). החזית הראשית פונה לדרום. בקיץ השמש גבוהה והצללה אופקית (מרפסות) יעילה; בחורף היא נמוכה וחודרת עמוק — זה הרגע לבדוק סינוור ובוהק.
                </p>
                <div className="space-y-3 pt-1">
                  <label className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><Users className="w-4 h-4" />דמויות אדם לקנה מידה</span>
                    <Switch checked={settings.showPeople} onCheckedChange={v => update('showPeople', v)} /></label>
                  <label className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><RotateCw className="w-4 h-4" />סיבוב אוטומטי</span>
                    <Switch checked={settings.autoRotate} onCheckedChange={v => update('autoRotate', v)} /></label>
                  <label className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><Gauge className="w-4 h-4" />איכות גבוהה (AO, Bloom)</span>
                    <Switch checked={settings.quality === 'high'} onCheckedChange={v => update('quality', v ? 'high' : 'eco')} /></label>
                </div>
              </TabsContent>

              {/* Genome analysis */}
              <TabsContent value="genome" className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                      <motion.circle cx="18" cy="18" r="15.9" fill="none" stroke="#a7c5ff" strokeWidth="3" strokeLinecap="round"
                        initial={{ strokeDasharray: '0 100' }} animate={{ strokeDasharray: `${score} 100` }} transition={{ duration: 0.8 }} />
                    </svg>
                    <span className="absolute inset-0 grid place-items-center text-xl font-bold tabular-nums">{score}</span>
                  </div>
                  <div>
                    <p className="font-bold">ציון חוסן צבעוני</p>
                    <p className="text-xs text-newton-muted leading-relaxed">שקלול ביצועים תרמיים, קריאוּת, נגישות והרמוניה. אינו מחליף בדיקה מול הנחיות מרחביות מקומיות.</p>
                  </div>
                </div>
                <GenomeStrip palette={palette} />
                <div className="space-y-2">
                  {findings.map((f, i) => (
                    <motion.div key={f.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex gap-2.5 rounded-2xl bg-white/[0.03] border border-white/10 p-3">
                      {severityIcon[f.severity]}
                      <div><p className="text-sm font-semibold">{f.title}</p><p className="text-xs text-newton-muted leading-relaxed mt-0.5">{f.detail}</p></div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Export */}
              <TabsContent value="export" className="space-y-4 mt-4">
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-xs">
                    <thead className="bg-white/5 text-newton-muted">
                      <tr><th className="p-2 text-right">תפקיד</th><th className="p-2">HEX</th><th className="p-2">LRV</th><th className="p-2">גימור</th><th className="p-2">%</th></tr>
                    </thead>
                    <tbody>
                      {rows.map(r => (
                        <tr key={r.slot} className="border-t border-white/5">
                          <td className="p-2"><span className="inline-block w-3 h-3 rounded align-middle ml-1.5" style={{ background: r.hex }} />{r.name}</td>
                          <td className="p-2 font-mono text-center" dir="ltr">{r.hex}</td>
                          <td className="p-2 text-center tabular-nums">{r.lrv}</td>
                          <td className="p-2 text-center">{r.finish}</td>
                          <td className="p-2 text-center tabular-nums">{r.share}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={exportPng} className="newton-action-btn primary text-sm"><Camera className="w-4 h-4 ml-1" />הדמיה PNG</button>
                  <button onClick={() => download(`archi-genome-${code}.csv`, specCsv(palette), 'text/csv')} className="newton-action-btn text-sm"><FileSpreadsheet className="w-4 h-4 ml-1" />מפרט CSV</button>
                  <button onClick={() => download('facade-palette.css', specCss(palette), 'text/css')} className="newton-action-btn text-sm"><Download className="w-4 h-4 ml-1" />משתני CSS</button>
                  <button onClick={copySpec} className="newton-action-btn text-sm">{copied ? <Check className="w-4 h-4 ml-1" /> : <Copy className="w-4 h-4 ml-1" />}העתקת מפרט</button>
                </div>
                <div className="pt-2">
                  <h3 className="ag-label">גנומים שמורים</h3>
                  <button onClick={() => { saveCurrent(`גנום ${saved.length + 1}`); toast.success('הפלטה נשמרה'); }}
                    className="newton-action-btn w-full text-sm mb-2"><Save className="w-4 h-4 ml-1" />שמירת הפלטה הנוכחית</button>
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {saved.map(g => (
                        <motion.div key={g.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 rounded-2xl bg-white/[0.03] border border-white/10 p-2">
                          <button onClick={() => loadSaved(g.id)} className="flex-1 flex items-center gap-2 text-right">
                            <span className="flex h-6 w-24 rounded-md overflow-hidden shrink-0">
                              {SLOT_ORDER.map(k => <span key={k} style={{ background: g.palette[k].color, flex: SLOT_LABELS[k].share }} />)}
                            </span>
                            <span className="text-xs">{g.name}</span>
                          </button>
                          <button onClick={() => removeSaved(g.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-newton-muted" title="מחיקה"><Trash2 className="w-3.5 h-3.5" /></button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {!saved.length && <p className="text-xs text-newton-muted">עדיין אין גנומים שמורים. הם נשמרים בדפדפן שלך.</p>}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default FacadeStudio;
