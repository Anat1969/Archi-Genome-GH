export const colorExplorationFunctions = [
  { key: "emotion", label: "רגש" },
  { key: "communication", label: "תקשורת" },
  { key: "survival", label: "הישרדות" },
  { key: "physics", label: "פיזיקה" },
];

export const colorExplorationData = {
  hero: {
    title: "איך צבעים עובדים בפועל",
    intro:
      "צבעים הם לא רק משמעויות סמליות. הם פועלים גם דרך רגש, תפיסה, ביולוגיה ופיזיקה. דף זה חוקר כיצד צבע פועל במוזיקה, במערכות חיות ובעולם החומרי.",
    image: "/assets/hero_graphic_color_exploration.png",
  },

  domains: [
    {
      key: "music",
      title: "מוזיקה וצבע",
      intro:
        "אנשים רבים מקשרים צליל לצבע דרך איכויות רגשיות משותפות כמו בהירות, רוגע, מתח, חום או אנרגיה. אלו דפוסים מבוססי תפיסה, לא כללים אוניברסליים.",
      examples: [
        {
          id: "music-1",
          domain: "music",
          title: "מוזיקה מהירה ובהירה מרגישה חמה",
          subtitle: "תפיסה דרך עוצמה רגשית",
          description:
            "מוזיקה אנרגטית ותוססת מקושרת לעיתים קרובות לצבעים חמים ובהירים כמו צהוב, כתום או אדום, כי שניהם נחווים כפעילים וחיים.",
          image: "/assets/examples/music_warm_energy.png",
          colors: ["#FDD835", "#FB8C00", "#E53935"],
          functionTag: "emotion",
        },
        {
          id: "music-2",
          domain: "music",
          title: "מוזיקה איטית ורגועה מרגישה כחולה",
          subtitle: "תפיסה דרך רוגע ועומק",
          description:
            "מוזיקה עדינה, מרחבית או רפלקטיבית מקושרת לכחול ולגוונים קרירים כי שניהם נתפסים כרגועים, רחוקים ועמוקים רגשית.",
          image: "/assets/examples/music_cool_calm.png",
          colors: ["#1E88E5", "#3949AB", "#8E24AA"],
          functionTag: "emotion",
        },
        {
          id: "music-3",
          domain: "music",
          title: "קשרי מלחין-צבע הם רמיזה, לא עובדה",
          subtitle: "מוצרט ובאך כדוגמאות לפרשנות",
          description:
            "חלק מהמאזינים עשויים לתאר את מוצרט כבהיר וחם יותר ואת באך כמובנה וקריר יותר, אבל אלו אסוציאציות פרשניות ולא מיפויים מדעיים אוניברסליים.",
          image: "/assets/examples/music_composer_interpretation.png",
          colors: ["#FB8C00", "#E53935", "#1E88E5"],
          functionTag: "emotion",
        },
      ],
    },

    {
      key: "living",
      title: "בעלי חיים וצמחים",
      intro:
        "במערכות חיות, צבע יכול להזהיר, למשוך, להסתיר, לאותת מוכנות או לתמוך בהתאמה לסביבה.",
      examples: [
        {
          id: "living-1",
          domain: "living",
          title: "צפרדעי חץ רעילות משתמשות בצבעי אזהרה",
          subtitle: "צבע כאות הישרדות",
          description:
            "צבעים בולטים ומנוגדים יכולים להזהיר טורפים שבעל חיים עשוי להיות רעיל או מסוכן. כאן הצבע מתפקד כמסר הישרדות.",
          image: "/assets/examples/frog_warning_colors.png",
          colors: ["#1976D2", "#FDD835", "#0D0D0D"],
          functionTag: "survival",
        },
        {
          id: "living-2",
          domain: "living",
          title: "פרחים משתמשים בצבע למשיכת מאביקים",
          subtitle: "צבע כתקשורת",
          description:
            "צבעי פרחים עוזרים לתקשר עם מאביקים על ידי בליטה בסביבה והכוונת חרקים או ציפורים לצוף ולאבקה.",
          image: "/assets/examples/flower_pollinator_signal.png",
          colors: ["#E53935", "#FB8C00", "#43A047"],
          functionTag: "communication",
        },
        {
          id: "living-3",
          domain: "living",
          title: "צבע פרי מסמן בשלות",
          subtitle: "צבע כרמז מוכנות",
          description:
            "ככל שפירות מבשילים, צבעיהם משתנים והופכים לאותות לבעלי חיים ולבני אדם שהפרי מוכן לאכילה ולהפצה.",
          image: "/assets/examples/fruit_ripeness_signal.png",
          colors: ["#43A047", "#FDD835", "#E53935"],
          functionTag: "communication",
        },
        {
          id: "living-4",
          domain: "living",
          title: "הסוואה עוזרת לבעלי חיים להיעלם",
          subtitle: "צבע כהסתרה",
          description:
            "חלק מבעלי החיים משתמשים בצבע ובדפוס כדי להשתלב בעלים, חול, קליפת עץ או צללים. כאן הצבע מפחית נראות במקום למשוך תשומת לב.",
          image: "/assets/examples/camouflage_animal.png",
          colors: ["#556B2F", "#8D6E63", "#2E7D32"],
          functionTag: "survival",
        },
      ],
    },

    {
      key: "physics",
      title: "פיזיקה של צבע",
      intro:
        "בעולם הדומם, צבע יכול לנבוע מפיזור אור, מבנה גבישי, הרכב חומרי והתנהגות משטחים.",
      examples: [
        {
          id: "physics-1",
          domain: "physics",
          title: "השמיים נראים כחולים בגלל פיזור אור",
          subtitle: "אורכי גל קצרים מתפזרים חזק יותר",
          description:
            "אור כחול מתפזר באופן רחב יותר באטמוספירה, ולכן השמיים נראים כחולים לעין האנושית.",
          image: "/assets/examples/sky_scattering_blue.png",
          colors: ["#90CAF9", "#42A5F5", "#1E88E5"],
          functionTag: "physics",
        },
        {
          id: "physics-2",
          domain: "physics",
          title: "גבישים ומינרלים יכולים ליצור צבע עז",
          subtitle: "צבע ממבנה חומרי והרכב",
          description:
            "חומר עשוי להיראות צבעוני בגלל האופן שבו המבנה הפנימי שלו מתקשר עם אור או בגלל יסודות עקבה בתוכו.",
          image: "/assets/examples/crystal_material_color.png",
          colors: ["#8E24AA", "#29B6F6", "#FDD835"],
          functionTag: "physics",
        },
        {
          id: "physics-3",
          domain: "physics",
          title: "חלק מהצבעים נובעים ממבנה, לא מפיגמנט",
          subtitle: "מבנה מיקרוסקופי מעצב צבע נראה",
          description:
            "בחלק מהמשטחים, צבע נוצר ממבנה פיזי מיקרוסקופי שמכופף, מחזיר או מפריע לאור במקום להסתמך בעיקר על פיגמנט.",
          image: "/assets/examples/structural_color_surface.png",
          colors: ["#00BCD4", "#3949AB", "#81D4FA"],
          functionTag: "physics",
        },
      ],
    },
  ],
};
