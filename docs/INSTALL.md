# הוראות התקנה והרצה

## דרישות מקדימות

- Node.js גרסה 18 ומעלה (מומלץ 20)
- npm (מגיע עם Node), או לחלופין bun
- Git

## התקנה

```bash
git clone https://github.com/Anat1969/PixelColorsCircle-GH.git
cd PixelColorsCircle-GH
npm install
```

## פקודות

| פקודה | מה היא עושה |
|---|---|
| `npm run dev` | הרצה בסביבת פיתוח עם רענון אוטומטי (פורט 8080) |
| `npm run build` | בניית גרסת ייצור לתיקייה `dist/` |
| `npm run preview` | הצגה מקומית של גרסת הייצור שנבנתה |
| `npm run lint` | בדיקת איכות קוד |
| `npm test` | הרצת בדיקות (Vitest) |

## פרסום (Deploy)

הפרויקט הוא אתר סטטי. אחרי `npm run build` אפשר להעלות את התיקייה `dist/` לכל שירות אחסון סטטי (Netlify, Vercel, GitHub Pages וכו').

שימו לב: האפליקציה משתמשת בניתוב בצד הלקוח, ולכן יש להגדיר בשרת שכל הכתובות יפנו ל־`index.html`.
- ב־Netlify: קובץ `public/_redirects` עם השורה `/* /index.html 200`
- ב־GitHub Pages: יש להעתיק את `index.html` ל־`404.html` ולהגדיר `base` ב־`vite.config.ts` לשם הריפו.

## שמירת תמונות

תמונות שמועלות למשבצות "תמונה להמחשה" נשמרות בדפדפן המקומי (localStorage) בלבד. הן לא נשמרות בריפו ולא עוברות בין מחשבים או דפדפנים.

## פתרון בעיות

- **הפורט תפוס** — הריצו `npm run dev -- --port 3000`.
- **שגיאות התקנה** — מחקו את `node_modules` ואת `package-lock.json` והריצו שוב `npm install`.
- **עמוד ריק אחרי פרסום** — בדקו את הגדרת ההפניה ל־`index.html` ואת `base`.
