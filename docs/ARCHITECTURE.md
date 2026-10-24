# מבנה האפליקציה

[חזרה לתוכן העניינים](../README.md)

## שכבות

```text
דפדפן: React + React Router
  ├─ תמונות → אחסון Lovable Cloud
  ├─ ניתוחים → genome_analyses
  ├─ אירועי Realtime → חוברת הקתדרלה
  └─ קריאות פונקציה → analyze-genome / inspire-genome
                        └─ Lovable AI
```

האפליקציה היא SPA עם Vite, לא שרת Node.js מתמשך. פונקציות Deno מטפלות בקריאות AI. התוצאות נשמרות על ידי הדפדפן לאחר שהניתוח חוזר, ולא על ידי פונקציית הניתוח עצמה.

## מסכים ונתיבים

| נתיב | קובץ | תפקיד |
| --- | --- | --- |
| `/` | `src/pages/Index.tsx` | חזון וכניסה לניתוח |
| `/analyze` | `src/pages/Analyze.tsx` | בחירת תמונה, העלאה, ניתוח ושמירה |
| `/genome/:id` | `src/pages/GenomePage.tsx` | פרופיל יחיד, חידוד פרומפט ויצירת מבנה |
| `/archive` | `src/pages/Archive.tsx` | דפדוף בחוברת משותפת |
| נתיב אחר | `src/pages/NotFound.tsx` | מסך לא נמצא |

`Auth.tsx` קיים אך אינו רשום בנתיבי `App.tsx`; `/auth` אינו דף כניסה פעיל. אין חסימת ניתוח לפי מצב התחברות.

## קבצים מרכזיים

- `App.tsx`: נתיבים, QueryClientProvider, כלי הודעות ו-TooltipProvider.
- `components/layout/AppShell.tsx`: ניווט, מעטפת וכותרת תחתונה.
- `components/analysis/ImageUploader.tsx`: גרירה, בחירת קובץ ותצוגה מקדימה.
- `components/analysis/DNARadarChart.tsx`: גרף ארבעת המדדים עם Recharts.
- `components/genome/ParameterGauge.tsx`: ציון ותיאור למדד.
- `src/index.css`, `tailwind.config.ts`: צבעים סמנטיים, טיפוגרפיה ואנימציות; עיצוב כהה עם זהב, Playfair Display ו-Inter.
- `src/integrations/supabase`: לקוח וסוגים שנוצרים עבור Lovable Cloud; אין לערוך קבצים מנוהלים ידנית.
- `supabase/functions`: שירותי הניתוח והיצירה.
- `supabase/migrations`: היסטוריית הסכימה, ההרשאות ו-Realtime.

## מסלול השמירה

1. `Analyze` מחזיק קובץ נבחר.
2. העלאה ל-`genome-images` בנתיב `public/<timestamp>-<filename>`.
3. קבלת כתובת תמונה ציבורית ושליחתה ל-`analyze-genome`.
4. הכנסת רשומה עם `user_id: null`, כתובת, ציונים, נרטיב ותיאורים.
5. מעבר לפרופיל באמצעות מזהה הרשומה.

השלבים אינם עסקה אטומית: כישלון ניתוח או שמירה אחרי העלאה עלול להשאיר תמונה ללא רשומת ניתוח. אין בקוד ניקוי אוטומטי למקרה זה.

## החוברת

שליפה ראשונית מחזירה את הניתוחים מהחדש לישן, ללא דפדוף שרת או מגבלת רשומות. ההצגה מציגה רשומה אחת בכל פעם ומחליפה פריסה לפי אינדקס העמוד. אירוע `INSERT` מוסיף בתחילת הרשימה ומחזיר לעמוד הראשון; `DELETE` מסיר רשומה. אין האזנה ל-`UPDATE`.

## מודלי AI לפי הקוד

| פעולה | מודל |
| --- | --- |
| ניתוח תמונה | `google/gemini-2.5-flash` |
| חידוד פרומפט | `google/gemini-2.5-flash` |
| תמונה חדשה | `google/gemini-2.5-flash-image-preview` |
| פרשנות | `google/gemini-2.5-flash` |

תכניות מוקדמות שהזכירו Gemini Pro אינן מתארות את המימוש הנוכחי. זמינות המודלים בפועל לא נבדקה במשימת התיעוד.
