export type CategoryKey =
  | "good"
  | "moderate"
  | "sensitive"
  | "unhealthy"
  | "very"
  | "hazardous";

export interface AqiCategory {
  key: CategoryKey;
  label: string;
  range: [number, number];
  /** css var reference usable in charts + inline styles */
  color: string;
  advice: string;
}

export const AQI_MAX = 550;

export const CATEGORIES: AqiCategory[] = [
  {
    key: "good",
    label: "Good",
    range: [0, 50],
    color: "var(--aqi-good)",
    advice: "Air quality is satisfactory. Perfect for outdoor activity.",
  },
  {
    key: "moderate",
    label: "Moderate",
    range: [51, 100],
    color: "var(--aqi-moderate)",
    advice: "Acceptable air. Unusually sensitive people should watch symptoms.",
  },
  {
    key: "sensitive",
    label: "Unhealthy for Sensitive Groups",
    range: [101, 150],
    color: "var(--aqi-sensitive)",
    advice: "Children, elderly and people with asthma should limit long outdoor exertion.",
  },
  {
    key: "unhealthy",
    label: "Unhealthy",
    range: [151, 200],
    color: "var(--aqi-unhealthy)",
    advice: "Everyone may feel effects. Reduce prolonged outdoor exertion.",
  },
  {
    key: "very",
    label: "Very Unhealthy",
    range: [201, 300],
    color: "var(--aqi-very)",
    advice: "Health alert. Avoid outdoor activity and keep windows closed.",
  },
  {
    key: "hazardous",
    label: "Hazardous",
    range: [301, AQI_MAX],
    color: "var(--aqi-hazardous)",
    advice: "Emergency conditions. Stay indoors with filtration; wear an N95 outside.",
  },
];

export function categoryFor(aqi: number): AqiCategory {
  const value = Math.round(aqi);
  return (
    CATEGORIES.find((c) => value >= c.range[0] && value <= c.range[1]) ??
    CATEGORIES[CATEGORIES.length - 1]
  );
}

export interface HourPoint {
  index: number;
  date: Date;
  aqi: number;
  category: AqiCategory;
  dayKey: string;
}

export interface DaySummary {
  dayKey: string;
  date: Date;
  hours: HourPoint[];
  avg: number;
  min: number;
  max: number;
  category: AqiCategory;
}

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function parseBaseTimestamp(raw: string): Date {
  // "2026-07-28 23:00:00+00:00" -> ISO
  const iso = raw.trim().replace(" ", "T");
  const d = new Date(iso);
  if (!Number.isNaN(d.getTime())) return d;
  return new Date(raw);
}

export function buildHours(base: Date, values: number[]): HourPoint[] {
  return values.map((aqi, i) => {
    const date = new Date(base.getTime() + (i + 1) * 3600_000);
    return {
      index: i,
      date,
      aqi,
      category: categoryFor(aqi),
      dayKey: dayKeyFmt.format(date),
    };
  });
}

export function groupByDay(hours: HourPoint[]): DaySummary[] {
  const map = new Map<string, HourPoint[]>();
  for (const h of hours) {
    const list = map.get(h.dayKey);
    if (list) list.push(h);
    else map.set(h.dayKey, [h]);
  }
  return [...map.entries()].map(([dayKey, list]) => {
    const values = list.map((h) => h.aqi);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      dayKey,
      date: list[0].date,
      hours: list,
      avg,
      min: Math.min(...values),
      max: Math.max(...values),
      category: categoryFor(avg),
    };
  });
}

export const fmtDay = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export const fmtLongDay = (d: Date) =>
  d.toLocaleDateString(undefined, { month: "long", day: "numeric" });

export const fmtTime = (d: Date) =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const fmtStamp = (d: Date) =>
  d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export interface AqiAlert {
  id: string;
  severity: CategoryKey;
  label: string;
  message: string;
  peak: number;
  start: Date;
  end: Date;
}

const ALERT_KEYS: CategoryKey[] = ["unhealthy", "very", "hazardous"];

/** Merge consecutive unhealthy+ hours into episode alerts. */
export function buildAlerts(hours: HourPoint[]): AqiAlert[] {
  const alerts: AqiAlert[] = [];
  let run: HourPoint[] = [];

  const flush = () => {
    if (!run.length) return;
    const peakHour = run.reduce((a, b) => (b.aqi > a.aqi ? b : a));
    const cat = peakHour.category;
    const icon = cat.key === "hazardous" ? "☣️" : cat.key === "very" ? "⚠️" : "😷";
    alerts.push({
      id: `${run[0].index}-${cat.key}`,
      severity: cat.key,
      label: cat.label,
      peak: peakHour.aqi,
      start: run[0].date,
      end: run[run.length - 1].date,
      message: `${icon} ${cat.label} air quality expected on ${fmtLongDay(peakHour.date)} at ${fmtTime(
        peakHour.date,
      )} (AQI ${Math.round(peakHour.aqi)}).`,
    });
    run = [];
  };

  for (const h of hours) {
    if (ALERT_KEYS.includes(h.category.key)) run.push(h);
    else flush();
  }
  flush();
  return alerts;
}

export function recommendations(maxAqi: number): string[] {
  const base = [
    "Track the hourly forecast before planning outdoor commutes.",
    "Prefer indoor workouts when the forecast peaks.",
  ];
  if (maxAqi <= 50)
    return ["Air stays clean — outdoor activity is safe all forecast long.", ...base.slice(0, 1)];
  if (maxAqi <= 100)
    return [
      "Generally safe. Unusually sensitive individuals should monitor symptoms.",
      "Ventilate your home during the cleanest hours.",
      ...base.slice(0, 1),
    ];
  if (maxAqi <= 150)
    return [
      "Sensitive groups (asthma, children, elderly) should shorten outdoor exertion.",
      "Keep reliever inhalers accessible.",
      "Close windows during the peak hours.",
      ...base,
    ];
  if (maxAqi <= 200)
    return [
      "Limit prolonged outdoor activity — everyone can be affected.",
      "Wear a well-fitted N95 mask outdoors.",
      "Run an air purifier indoors and keep windows shut.",
      ...base,
    ];
  if (maxAqi <= 300)
    return [
      "Avoid all outdoor exertion; move workouts indoors.",
      "N95 masks are strongly recommended when going outside.",
      "Keep children and elderly indoors during peak hours.",
      "Run HEPA purification continuously and seal window gaps.",
    ];
  return [
    "Health emergency: stay indoors and avoid any outdoor exposure.",
    "Seal windows and doors; run HEPA filtration around the clock.",
    "Wear an N95/N99 respirator for unavoidable trips outside.",
    "Seek medical advice immediately for breathing difficulty or chest tightness.",
  ];
}

export function toCsv(hours: HourPoint[]): string {
  const rows = [
    ["date", "time", "iso_timestamp", "aqi", "category"],
    ...hours.map((h) => [
      h.date.toLocaleDateString(),
      fmtTime(h.date),
      h.date.toISOString(),
      String(Math.round(h.aqi)),
      h.category.label,
    ]),
  ];
  return rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
}
