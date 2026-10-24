export interface SpectrumZone {
  key: string;
  label: string;
  rangeTHz: string;
}

export interface ColorPsychologyStop {
  key: string;
  name: string;
  hex: string;
  frequencyTHz: number;
  wavelengthNm: number;
  positionPercent: number;
  positiveMeaning: string;
  negativeMeaning: string;
  effects: string;
  needForBalance: string;
  whyBalanceIsNeeded: string;
  scientificExplanation: string;
  psychologicalExplanation: string;
  balancingColorName: string;
  balancingColorHex: string;
  balancingExplanation: string;
}

export const colorPsychologySpectrumData = {
  spectrumZones: {
    infrared: {
      key: "infrared",
      label: "אינפרא אדום",
      rangeTHz: "300–400",
    },
    visible: {
      key: "visible",
      label: "האור הנראה",
      rangeTHz: "400–789",
    },
    ultraviolet: {
      key: "ultraviolet",
      label: "אולטרה סגול",
      rangeTHz: "789–1000",
    },
  },

  stops: [
    {
      key: "red",
      name: "אדום",
      hex: "#E53935",
      frequencyTHz: 400,
      wavelengthNm: 750,
      positionPercent: 0,
      positiveMeaning: "אנרגיה, נוכחות, אומץ, תשוקה ויכולת הנעה לפעולה.",
      negativeMeaning: "לחץ, תוקפנות, אימפולסיביות, עומס רגשי ותחושת הצפה.",
      effects: "מגביר עוררות, מושך תשומת לב, מחזק תחושת דחיפות ותגובה מיידית.",
      needForBalance: "יש צורך באיזון כאשר האדום יוצר עומס, מתח או פעולה ללא ויסות.",
      whyBalanceIsNeeded: "עודף אדום עלול לדחוף לתגובתיות מהירה מדי, לעייפות רגשית ולתחושת עימות.",
      scientificExplanation: "אדום נמצא בקצה התחתון של תחום התדרים הנראים ובאורך גל ארוך יחסית. לכן הוא נתפס כחזק, בולט ובעל נוכחות גבוהה בשדה הראייה.",
      psychologicalExplanation: "מבחינה פסיכולוגית אדום מתקשר להפעלה, הישרדות, תשוקה, כוח ואיום, ולכן הוא יכול גם לעורר וגם להעמיס.",
      balancingColorName: "ירוק",
      balancingColorHex: "#43A047",
      balancingExplanation: "ירוק מאזֵן אדום דרך רוגע, התאוששות, נשימה רגשית ותחושת יציבות.",
    },
    {
      key: "orange",
      name: "כתום",
      hex: "#FB8C00",
      frequencyTHz: 496,
      wavelengthNm: 605,
      positionPercent: 16.6,
      positiveMeaning: "חום אנושי, יצירתיות, פתיחות, שמחת חיים והתלהבות.",
      negativeMeaning: "עודף גירוי, חוסר מיקוד, שטחיות, חוסר שקט ופיזור.",
      effects: "מעלה תחושת חיות, מזמין קשר, מגביר סקרנות ותנועה רגשית.",
      needForBalance: "יש צורך באיזון כאשר הכתום נעשה רועש מדי ומפחית ריכוז או עומק.",
      whyBalanceIsNeeded: "עודף כתום עלול ליצור תחושת עומס חברתי או אנרגיה גבוהה ללא כיוון ברור.",
      scientificExplanation: "כתום נמצא מעל האדום בתחום התדרים הנראים ומשלב בולטות גבוהה עם תחושת מעבר לעבר אזורים בהירים יותר בספקטרום.",
      psychologicalExplanation: "מבחינה פסיכולוגית כתום מתקשר לחום, קרבה, משחקיות וביטוי, אך בעודף הוא עשוי להרגיש פולשני או חסר מנוחה.",
      balancingColorName: "כחול",
      balancingColorHex: "#1E88E5",
      balancingExplanation: "כחול מאזֵן כתום דרך שקט, בהירות, סדר ותחושת עומק.",
    },
    {
      key: "yellow",
      name: "צהוב",
      hex: "#FDD835",
      frequencyTHz: 517,
      wavelengthNm: 580,
      positionPercent: 33.3,
      positiveMeaning: "בהירות, למידה, אופטימיות, חדות מחשבה וסקרנות.",
      negativeMeaning: "עומס מנטלי, עצבנות, ביקורתיות, אי שקט ותחושת מתח.",
      effects: "מעלה ערנות, מפעיל תשומת לב, מחזק זיהוי מהיר ותחושת חיוניות שכלית.",
      needForBalance: "יש צורך באיזון כאשר הצהוב נעשה חד מדי, מעייף או מעורר מתח קוגניטיבי.",
      whyBalanceIsNeeded: "עודף צהוב עלול להרגיש צורב, תובעני או מעורר דריכות יתר.",
      scientificExplanation: "צהוב נמצא במרכז החם של התחום הנראה, עם נראות גבוהה מאוד לעין האנושית, ולכן הוא בולט במיוחד.",
      psychologicalExplanation: "מבחינה פסיכולוגית צהוב מתקשר לחשיבה, למיקוד, ללמידה ולהבנה, אך בעודף הוא עלול לעורר עומס עצבי.",
      balancingColorName: "סגול",
      balancingColorHex: "#8E24AA",
      balancingExplanation: "סגול מאזֵן צהוב דרך עומק, השהיה, רפלקטיביות וריכוך החדוּת.",
    },
    {
      key: "green",
      name: "ירוק",
      hex: "#43A047",
      frequencyTHz: 566,
      wavelengthNm: 530,
      positionPercent: 50,
      positiveMeaning: "איזון, צמיחה, ריפוי, יציבות, התאוששות והרמוניה.",
      negativeMeaning: "קיפאון, פסיביות, הימנעות משינוי, ריחוק רגשי ועצירה.",
      effects: "מרגיע את המערכת, מפחית עומס, מחזק תחושת איזון והתחדשות.",
      needForBalance: "יש צורך באיזון כאשר הירוק הופך לפסיבי מדי או מעכב תנועה והכרעה.",
      whyBalanceIsNeeded: "עודף ירוק עלול ליצור נוחות מוגזמת, האטה או הימנעות מעימות הכרחי.",
      scientificExplanation: "ירוק נמצא באזור מרכזי בספקטרום הנראה, ולכן הוא נתפס כנקודת איזון ויזואלית טבעית ביחס לצבעים חמים וקרים.",
      psychologicalExplanation: "מבחינה פסיכולוגית ירוק מתקשר לטבע, ביטחון, ריפוי והתחדשות, אך בעודף הוא עלול להפוך לשאננות.",
      balancingColorName: "אדום",
      balancingColorHex: "#E53935",
      balancingExplanation: "אדום מאזֵן ירוק דרך הנעה, דחיפות, חיות ויציאה מקיפאון.",
    },
    {
      key: "blue",
      name: "כחול",
      hex: "#1E88E5",
      frequencyTHz: 638,
      wavelengthNm: 470,
      positionPercent: 66.6,
      positiveMeaning: "רוגע, אמון, בהירות, עומק, ויסות רגשי והיגיון.",
      negativeMeaning: "קור רגשי, ריחוק, נוקשות, שליטה יתר והסתגרות.",
      effects: "מוריד עוררות, מחזק תחושת סדר, תורם לריכוז וליציבות תפיסתית.",
      needForBalance: "יש צורך באיזון כאשר הכחול מתרחק מדי מרגש, חמימות וקשר אנושי.",
      whyBalanceIsNeeded: "עודף כחול עלול ליצור תחושת ריחוק, פורמליות יתר או עיכוב רגשי.",
      scientificExplanation: "כחול נמצא באזור תדר גבוה יותר מהירוק והצהוב, ולכן הוא קשור לחלק הקריר והעמוק יותר של הספקטרום הנראה.",
      psychologicalExplanation: "מבחינה פסיכולוגית כחול מתקשר לאמון, שקט, יציבות ומחשבה מסודרת, אך בעודף הוא עלול לדכא ספונטניות.",
      balancingColorName: "כתום",
      balancingColorHex: "#FB8C00",
      balancingExplanation: "כתום מאזֵן כחול דרך חום, חיבור, ספונטניות ונוכחות אנושית.",
    },
    {
      key: "indigo",
      name: "אינדיגו",
      hex: "#3949AB",
      frequencyTHz: 675,
      wavelengthNm: 445,
      positionPercent: 83.3,
      positiveMeaning: "אינטואיציה, עומק, ריכוז, התבוננות פנימית וחדות תפיסתית.",
      negativeMeaning: "כובד, הסתגרות, מחשבת יתר, ניתוק ובדידות.",
      effects: "מכוון פנימה, מחזק קשב עומק, יוצר תחושת רצינות ומרחק.",
      needForBalance: "יש צורך באיזון כאשר האינדיגו נעשה כבד מדי וסוגר תנועה, קלילות או קשר.",
      whyBalanceIsNeeded: "עודף אינדיגו עלול לדחוף להתכנסות, עומס מחשבתי ותחושת ניתוק.",
      scientificExplanation: "אינדיגו נמצא באזור התדרים הגבוהים של התחום הנראה, קרוב לסגול, ולכן הוא נתפס כעמוק, דחוס וקר.",
      psychologicalExplanation: "מבחינה פסיכולוגית אינדיגו מתקשר לרפלקציה, תפיסה פנימית ומשמעות, אך בעודף הוא עלול להפוך לחשוך או מרוחק.",
      balancingColorName: "צהוב",
      balancingColorHex: "#FDD835",
      balancingExplanation: "צהוב מאזֵן אינדיגו דרך אור, פתיחות, קלילות וערנות מנטלית.",
    },
    {
      key: "violet",
      name: "סגול",
      hex: "#8E24AA",
      frequencyTHz: 730,
      wavelengthNm: 410,
      positionPercent: 100,
      positiveMeaning: "דמיון, טרנספורמציה, השראה, רגישות וראייה רחבה.",
      negativeMeaning: "בריחה, עמימות, עודף רגש, חוסר קרקע ובלבול.",
      effects: "מעורר אסוציאציה, דמיון, רגישות ועיבוד מופשט.",
      needForBalance: "יש צורך באיזון כאשר הסגול מתנתק מדי מהמציאות, מהפשטות ומהבהירות.",
      whyBalanceIsNeeded: "עודף סגול עלול ליצור פיזור, ריחוף רגשי או עודף מופשטות.",
      scientificExplanation: "סגול נמצא בקצה העליון של תחום התדרים הנראים, סמוך לאולטרה סגול, ולכן הוא מתקשר לחוויה קצהית, עדינה ומרובת מתח תפיסתי.",
      psychologicalExplanation: "מבחינה פסיכולוגית סגול מתקשר לרוח, דמיון, שינוי ועומק רגשי, אך בעודף הוא עלול להחליש עיגון ובהירות.",
      balancingColorName: "צהוב",
      balancingColorHex: "#FDD835",
      balancingExplanation: "צהוב מאזֵן סגול דרך פשטות, בהירות, מודעות וקרקוע.",
    },
  ] as ColorPsychologyStop[],
};

// Spectrum constants derived from zones
export const SPECTRUM_MIN_THZ = 300;
export const SPECTRUM_MAX_THZ = 1000;
export const VISIBLE_MIN_THZ = 400;
export const VISIBLE_MAX_THZ = 789;
export const SNAP_THRESHOLD_THZ = 15;
