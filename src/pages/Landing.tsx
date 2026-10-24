import { lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import TopNav from '@/components/TopNav';
import { Sparkles, Eye, Layers, Paintbrush, ArrowLeft, Building2, SunMedium, Ruler, Accessibility } from 'lucide-react';
import { NEWTON_SEVEN } from '@/hooks/useColorWheel';
import { useGenomeStore, SLOT_ORDER } from '@/store/genomeStore';

const GenomeHelix = lazy(() => import('@/components/three/GenomeHelix'));

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

const Reveal = ({ children, i = 0, className = '' }: { children: React.ReactNode; i?: number; className?: string }) => (
  <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={i} className={className}>
    {children}
  </motion.div>
);

const Landing = () => {
  const navigate = useNavigate();
  const palette = useGenomeStore(s => s.palette);
  const helixColors = useMemo(
    () => [...NEWTON_SEVEN.map(c => c.color), ...SLOT_ORDER.map(k => palette[k].color)],
    [palette],
  );
  const { scrollY } = useScroll();
  const helixY = useTransform(scrollY, [0, 600], [0, 140]);
  const helixOpacity = useTransform(scrollY, [0, 500], [1, 0.2]);

  return (
    <div dir="rtl" className="newton-app min-h-screen overflow-x-hidden"
      style={{ background: 'radial-gradient(1200px 700px at 20% -10%, #1f2840 0%, #0f1115 50%, #0b0d11 100%)' }}>
      <TopNav />

      {/* Hero */}
      <section className="relative max-w-[1280px] mx-auto px-6 pt-24 md:pt-28 min-h-[92vh] grid lg:grid-cols-[1.05fr_1fr] items-center gap-6">
        <div className="relative z-10 space-y-7 order-2 lg:order-1">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-newton-accent">
            <span className="w-8 h-px bg-newton-accent" /> ARCHI‑GENOME
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="ag-display text-4xl md:text-6xl font-bold leading-[1.08]">
            הגנום הצבעוני
            <br />
            <span className="ag-gradient-text">של האדריכלות</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
            className="text-base md:text-lg max-w-[560px] leading-relaxed text-newton-muted">
            מתורת הצבע של ניוטון ועד חזית אמיתית בשמש של אשדוד. חוקרים יחסים בין צבעים, מבינים מה הם עושים לאדם ולחלל, ובודקים אותם בתלת־ממד על חומר, אור וזמן — עם נתונים שאפשר להגיש.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex gap-3 flex-wrap">
            <button onClick={() => navigate('/studio')} className="newton-action-btn primary px-7 py-3 text-base">
              <Building2 className="w-5 h-5 ml-1" /> כניסה לסטודיו התלת־ממדי
            </button>
            <button onClick={() => navigate('/wheel')} className="newton-action-btn px-7 py-3 text-base">
              גלגל הצבעים
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="flex gap-1.5 pt-2">
            {NEWTON_SEVEN.map((c, i) => (
              <motion.span key={c.name} title={c.name} className="h-1.5 rounded-full"
                initial={{ width: 0 }} animate={{ width: 36 }} transition={{ delay: 0.6 + i * 0.07, duration: 0.5 }}
                style={{ background: c.color }} />
            ))}
          </motion.div>
        </div>

        <motion.div style={{ y: helixY, opacity: helixOpacity }} className="relative h-[46vh] lg:h-[80vh] order-1 lg:order-2">
          <div className="absolute inset-0 rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(119,165,255,0.35), transparent 60%)' }} />
          <Suspense fallback={null}>
            <GenomeHelix colors={helixColors} />
          </Suspense>
        </motion.div>
      </section>

      <div className="max-w-[1080px] mx-auto px-6 pb-20 space-y-24">

        {/* Studio feature */}
        <section className="grid md:grid-cols-[1fr_1.1fr] gap-6 items-stretch">
          <Reveal className="newton-panel p-8 space-y-4 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-[0.25em] text-newton-accent">חדש · סטודיו חזיתות</p>
            <h2 className="ag-display text-2xl md:text-3xl font-bold">צבע נבחן על בניין, לא על מסך</h2>
            <p className="text-sm md:text-base leading-relaxed text-newton-muted">
              מבנה מגורים בן שש קומות עם מרפסות, קומת מסחר, רפפות וגג פעיל. מחילים פלטה על שישה תפקידי צבע, מחליפים חומר — טיח, אבן, בטון, מתכת ועץ — ומריצים יום שלם של שמש לפי החודש.
            </p>
            <button onClick={() => navigate('/studio')} className="newton-action-btn primary self-start px-6">
              לפתוח את הסטודיו <ArrowLeft className="w-4 h-4 mr-1" />
            </button>
          </Reveal>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <SunMedium className="w-5 h-5" />, t: 'שמש אמיתית', d: 'מסלול שמש לקו רוחב 31.8°, צללים רכים, שעת זהב ולילה עם חלונות מוארים.' },
              { icon: <Ruler className="w-5 h-5" />, t: 'LRV ותרמיקה', d: 'מקדם החזר אור וספיגות סולארית לכל צבע — כלים לצמצום אי־חום עירוני.' },
              { icon: <Accessibility className="w-5 h-5" />, t: 'נגישות', d: 'בדיקת הפרש LRV ≥ 30 בין כניסה לבסיס לטובת כבדי ראייה.' },
              { icon: <Layers className="w-5 h-5" />, t: 'מפרט להגשה', d: 'הדמיה PNG, טבלת CSV, משתני CSS וקוד גנום ייחודי לכל פלטה.' },
            ].map((f, i) => (
              <Reveal key={f.t} i={i} className="newton-panel p-5 space-y-2 hover:-translate-y-1 transition-transform duration-300">
                <span className="text-newton-accent">{f.icon}</span>
                <h3 className="font-bold">{f.t}</h3>
                <p className="text-xs leading-relaxed text-newton-muted">{f.d}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Value */}
        <Reveal>
          <section className="newton-panel p-8 md:p-10 space-y-6 relative overflow-hidden">
            <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full opacity-25 blur-2xl"
              style={{ background: 'conic-gradient(from 0deg, #d90429, #f77f00, #f7df00, #38b000, #1d6fd6, #3949ab, #7b2cbf, #d90429)' }} />
            <h2 className="ag-display text-2xl md:text-3xl font-bold relative">לא עוד צבע כתחושה בלבד</h2>
            <p className="text-sm md:text-base leading-relaxed text-newton-muted max-w-[720px] relative">
              הכלי נבנה עבור מעצבים ואדריכלים שצריכים יותר מהשראה. הוא מאפשר לעבור מאינטואיציה להבנה: לראות יחסים בין צבעים, להבין השפעה, לקרוא משמעות, וליישם נכון במותג, בממשק, בחלל ובחומר.
            </p>
            <div className="flex gap-3 flex-wrap relative">
              {['מידע', 'הבנה', 'יישום', 'הדמיה', 'הגשה'].map((item, i) => (
                <motion.span key={item} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }} className="newton-chip px-6 py-2.5 text-sm">{item}</motion.span>
              ))}
            </div>
          </section>
        </Reveal>

        {/* How it works */}
        <section id="how-it-works" className="space-y-8">
          <Reveal>
            <h2 className="ag-display text-2xl md:text-3xl font-bold">איך זה עובד</h2>
            <p className="text-sm md:text-base max-w-[700px] leading-relaxed text-newton-muted mt-2">
              המערכת מציגה את תורת הצבע לא רק כחוק חזותי, אלא כשפה של תפיסה, חומר, הקשר ומשמעות.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Eye className="w-5 h-5" />, title: 'לחקור', text: 'לזהות יחסים, ניגודיות, הרמוניה, טמפרטורה ועומק בגלגל הצבעים.', to: '/wheel' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'להבין', text: 'לראות איך צבע פועל על העין, על הקשב ועל התחושה — לאורך הספקטרום.', to: '/color-psychology' },
              { icon: <Layers className="w-5 h-5" />, title: 'לפרש', text: 'להבין מה צבע מסמן בטבע, במוזיקה ובפיזיקה — ומה זה אומר לעיצוב.', to: '/how-colors-work' },
              { icon: <Paintbrush className="w-5 h-5" />, title: 'ליישם', text: 'להפוך ידע צבעוני לחזית אמיתית, עם נתונים, הדמיה ומפרט.', to: '/studio' },
            ].map((step, i) => (
              <Reveal key={step.title} i={i}>
                <button onClick={() => navigate(step.to)} className="newton-panel p-6 space-y-3 text-right w-full h-full group hover:border-[#a7c5ff]/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-newton-accent">{step.icon}</span>
                    <span className="text-[11px] text-newton-muted tabular-nums">0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-newton-muted">{step.text}</p>
                  <ArrowLeft className="w-4 h-4 text-newton-accent opacity-0 group-hover:opacity-100 -translate-x-0 group-hover:-translate-x-1 transition" />
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Color in the world */}
        <section className="space-y-8">
          <Reveal>
            <h2 className="ag-display text-2xl md:text-3xl font-bold">צבע בעולם: מהעין אל הפרשנות</h2>
            <p className="text-sm md:text-base max-w-[700px] leading-relaxed text-newton-muted mt-2">
              צבע אינו רק תכונה נראית. הוא מנגנון, אות, התאמה, חומר, סמל ושפה.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'חי', text: 'בטבע החי, צבע משמש להסוואה, אזהרה, חיזור, זיהוי והישרדות.', c: '#38b000' },
              { title: 'צומח', text: 'בצומח, צבע קשור לאור, לעונות, להבשלה, למשיכת מאביקים ולמצב החומרי של הצמח.', c: '#a9c800' },
              { title: 'דומם', text: 'בחפצים, חומרים ומשטחים, צבע נבנה דרך אור, מרקם, שקיפות, ספיגה, החזר וגימור.', c: '#b9a07a' },
              { title: 'מדע', text: 'צבע מוסבר דרך אור, אורך גל, ראייה, ניגוד, אדפטציה ותפיסה.', c: '#1d6fd6' },
              { title: 'תרבות', text: 'צבע נושא זיכרון, סמליות, היררכיה, רגש והקשר.', c: '#d90429' },
              { title: 'עיר', text: 'בעיר, צבע הוא מדיניות: הנחיות מרחביות, אקלים, זהות מקומית ורצף רחוב.', c: '#a7c5ff' },
            ].map((card, i) => (
              <Reveal key={card.title} i={i % 3}>
                <div className="newton-panel p-6 space-y-2 h-full relative overflow-hidden">
                  <span className="absolute top-0 right-0 h-1 w-16 rounded-bl-full" style={{ background: card.c }} />
                  <h3 className="text-lg font-bold" style={{ color: card.c }}>{card.title}</h3>
                  <p className="text-sm leading-relaxed text-newton-muted">{card.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Designer application */}
        <section className="grid md:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <Reveal>
            <h2 className="ag-display text-2xl md:text-3xl font-bold">מה מעצבים ואדריכלים יכולים לעשות עם זה</h2>
            <p className="text-sm text-newton-muted leading-relaxed mt-3">
              הכלי מציג צבע בשתי שכבות משלימות: איך הוא עובד, ומה הוא אומר. מצד אחד — תפיסה, מדע, מבנה ויחסים. מצד שני — תרבות, רגש, סימבוליקה והקשר.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'לבנות פלטות חזית מדויקות',
              'לבדוק צבע מול שמש, עונה ושעה',
              'להבין השפעה צבעונית בחלל',
              'לבחור חומרים וגימורים מתוך הבנת אור',
              'לצמצם עומס תרמי באמצעות LRV',
              'להפיק מפרט צבע לתיק בקשה',
            ].map((item, i) => (
              <Reveal key={item} i={i % 2}>
                <div className="newton-status-card flex items-center gap-3 px-5 py-4">
                  <ArrowLeft className="w-4 h-4 shrink-0 text-newton-accent" />
                  <span className="text-sm">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <Reveal>
          <section className="newton-panel p-10 space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 48px), repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 48px)' }} />
            <h2 className="ag-display text-2xl md:text-4xl font-bold relative">להפוך צבע מידע להחלטה תכנונית</h2>
            <p className="text-sm md:text-base leading-relaxed max-w-[600px] text-newton-muted relative">
              התחילו בגלגל, שלחו את הבחירה לסטודיו, ובדקו אותה על בניין — בין טבע, מדע, תרבות ועיר.
            </p>
            <div className="flex gap-3 flex-wrap relative">
              <button onClick={() => navigate('/studio')} className="newton-action-btn primary px-8 py-3 text-base">לסטודיו התלת־ממדי</button>
              <button onClick={() => navigate('/how-colors-work')} className="newton-action-btn px-8 py-3 text-base">גלו את תורת הצבע</button>
            </div>
          </section>
        </Reveal>

        <footer className="text-xs text-newton-muted flex justify-between border-t border-white/5 pt-6">
          <span>Archi‑Genome · תורת הצבע ככלי עבודה תכנוני</span>
          <span dir="ltr">v2.0</span>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
