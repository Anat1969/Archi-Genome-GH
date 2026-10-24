// Simplified solar geometry (local solar time) — accurate to ~1° which is
// plenty for facade shading studies.

export const ASHDOD_LATITUDE = 31.8;

export interface SunPosition {
  /** degrees above horizon */
  altitude: number;
  /** degrees clockwise from north */
  azimuth: number;
  /** unit vector in scene space: +x east, +y up, +z south */
  direction: [number, number, number];
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function dayOfYear(month: number, day = 21) {
  const cumulative = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cumulative[month - 1] + day;
}

export function sunPosition(month: number, hour: number, latitude = ASHDOD_LATITUDE): SunPosition {
  const n = dayOfYear(month);
  const decl = 23.44 * Math.sin(rad((360 / 365) * (n - 81)));
  const hourAngle = 15 * (hour - 12);
  const phi = rad(latitude), d = rad(decl), h = rad(hourAngle);

  const sinAlt = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(h);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz = (Math.sin(d) - Math.sin(alt) * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi));
  let az = deg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
  if (hourAngle > 0) az = 360 - az;

  const direction: [number, number, number] = [
    Math.cos(alt) * Math.sin(rad(az)),
    Math.sin(alt),
    -Math.cos(alt) * Math.cos(rad(az)),
  ];
  return { altitude: deg(alt), azimuth: az, direction };
}

/** Warm at the horizon, neutral-white at noon. */
export function sunColor(altitude: number): string {
  if (altitude <= 0) return '#3a4a6b';
  if (altitude < 6) return '#ff9a5a';
  if (altitude < 15) return '#ffc48a';
  if (altitude < 30) return '#ffe3bf';
  return '#fff6ea';
}

export const MONTH_NAMES = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export function compassLabel(azimuth: number) {
  const dirs = ['צפון', 'צפון־מזרח', 'מזרח', 'דרום־מזרח', 'דרום', 'דרום־מערב', 'מערב', 'צפון־מערב'];
  return dirs[Math.round(azimuth / 45) % 8];
}
