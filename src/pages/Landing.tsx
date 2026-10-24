import { useNavigate } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import { Sparkles, Eye, Layers, Paintbrush, ArrowLeft } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="newton-app min-h-screen"
      style={{ background: 'radial-gradient(circle at top, #1d2230 0%, #0f1115 45%, #0b0d11 100%)' }}>
      <TopNav />

      <div className="max-w-[960px] mx-auto px-6 pt-24 pb-16 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-6 pt-8">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: 'hsl(var(--newton-text))' }}>
            תורת הצבע, ככלי עבודה למעצבים
          </h1>
          <p className="text-base md:text-lg max-w-[700px] mx-auto leading-relaxed" style={{ color: 'hsl(var(--newton-muted))' }}>
            להבין איך צבע פועל, איך הוא נתפס, איך הוא מופיע בטבע, במדע ובתרבות — ואיך מתרגמים את כל זה להחלטות עיצוב מדויקות.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/wheel')} className="newton-action-btn primary px-8 py-3 text-base">
              להתחיל לחקור
            </button>
            <button onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="newton-action-btn px-8 py-3 text-base">
              איך זה עובד
            </button>
          </div>
        </section>

        {/* Value section */}
        <section className="newton-panel p-8 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'hsl(var(--newton-text))' }}>
            לא עוד צבע כתחושה בלבד
          </h2>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: 'hsl(var(--newton-muted))' }}>
            הכלי נבנה עבור מעצבים שצריכים יותר מהשראה. הוא מאפשר לעבור מאינטואיציה להבנה: לראות יחסים בין צבעים, להבין השפעה, לקרוא משמעות, וליישם נכון במותג, בממשק, בחלל ובחומר.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {['מידע', 'הבנה', 'יישום'].map((item) => (
              <span key={item} className="newton-chip px-6 py-3 text-sm">{item}</span>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-center" style={{ color: 'hsl(var(--newton-text))' }}>
            איך זה עובד
          </h2>
          <p className="text-sm md:text-base text-center max-w-[700px] mx-auto leading-relaxed" style={{ color: 'hsl(var(--newton-muted))' }}>
            המערכת מציגה את תורת הצבע לא רק כחוק חזותי, אלא כשפה של תפיסה, חומר, הקשר ומשמעות.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Eye className="w-5 h-5" />, title: 'לחקור', text: 'לזהות יחסים, ניגודיות, הרמוניה, טמפרטורה ועומק.' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'להבין', text: 'לראות איך צבע פועל על העין, על הקשב, על התחושה ועל הקריאה של צורה.' },
              { icon: <Layers className="w-5 h-5" />, title: 'לפרש', text: 'להבין מה צבע מסמן, רומז, מדגיש או מסתיר בהקשר תרבותי, רגשי וסימבולי.' },
              { icon: <Paintbrush className="w-5 h-5" />, title: 'ליישם', text: 'להפוך ידע צבעוני להחלטות עיצוביות מדויקות.' },
            ].map((step) => (
              <div key={step.title} className="newton-panel p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span style={{ color: 'hsl(var(--newton-accent))' }}>{step.icon}</span>
                  <h3 className="text-base font-bold" style={{ color: 'hsl(var(--newton-text))' }}>{step.title}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--newton-muted))' }}>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Color in the world */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-center" style={{ color: 'hsl(var(--newton-text))' }}>
            צבע בעולם: מהעין אל הפרשנות
          </h2>
          <p className="text-sm md:text-base text-center max-w-[700px] mx-auto leading-relaxed" style={{ color: 'hsl(var(--newton-muted))' }}>
            צבע אינו רק תכונה נראית. הוא מנגנון, אות, התאמה, חומר, סמל ושפה.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'חי', text: 'בטבע החי, צבע משמש להסוואה, אזהרה, חיזור, זיהוי והישרדות.' },
              { title: 'צומח', text: 'בצומח, צבע קשור לאור, לעונות, להבשלה, למשיכת מאביקים ולמצב החומרי של הצמח.' },
              { title: 'דומם', text: 'בחפצים, חומרים ומשטחים, צבע נבנה דרך אור, מרקם, שקיפות, ספיגה, החזר וגימור.' },
              { title: 'מדע', text: 'צבע מוסבר דרך אור, אורך גל, ראייה, ניגוד, אדפטציה ותפיסה.' },
              { title: 'תרבות', text: 'צבע נושא זיכרון, סמליות, היררכיה, רגש והקשר.' },
            ].map((card) => (
              <div key={card.title} className="newton-panel p-6 space-y-2">
                <h3 className="text-base font-bold" style={{ color: 'hsl(var(--newton-accent))' }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--newton-muted))' }}>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interpretation */}
        <section className="newton-panel p-8 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'hsl(var(--newton-text))' }}>
            לא רק הסבר. גם פרשנות.
          </h2>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: 'hsl(var(--newton-muted))' }}>
            הכלי מציג צבע בשתי שכבות משלימות: איך הוא עובד, ומה הוא אומר. מצד אחד — תפיסה, מדע, מבנה ויחסים. מצד שני — תרבות, רגש, סימבוליקה והקשר.
          </p>
        </section>

        {/* Designer application */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-center" style={{ color: 'hsl(var(--newton-text))' }}>
            מה מעצבים יכולים לעשות עם זה
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'לבנות פלטות צבע מדויקות יותר',
              'לחדד זהות מותגית',
              'לשפר היררכיה וקריאות בממשקים',
              'להבין השפעה צבעונית בחלל',
              'לבחור חומרים וגימורים מתוך הבנת אור ותפיסה',
              'לספר סיפור חזותי עקבי דרך צבע',
            ].map((item) => (
              <div key={item} className="newton-status-card flex items-center gap-3 px-5 py-4">
                <ArrowLeft className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--newton-accent))' }} />
                <span className="text-sm" style={{ color: 'hsl(var(--newton-text))' }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="newton-panel p-8 text-center space-y-5">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'hsl(var(--newton-text))' }}>
            להפוך צבע מידע להחלטה עיצובית
          </h2>
          <p className="text-sm md:text-base leading-relaxed max-w-[600px] mx-auto" style={{ color: 'hsl(var(--newton-muted))' }}>
            התחילו לחקור את תורת הצבע ככלי של הבנה, הבחנה ויישום — בין טבע, מדע, תרבות ועיצוב.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/wheel')} className="newton-action-btn primary px-8 py-3 text-base">
              פתחו את הכלי
            </button>
            <button onClick={() => navigate('/how-colors-work')} className="newton-action-btn px-8 py-3 text-base">
              גלו את תורת הצבע
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Landing;
