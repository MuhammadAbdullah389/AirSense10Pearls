import { buildHours, groupByDay, parseBaseTimestamp, type HourPoint } from "./aqi";

export const API_STORAGE_KEY = "aqi_api_url";
export const DEFAULT_API_URL = "https://aqi-predictor-shine.onrender.com/predict";

export function getApiUrl(): string {
  if (typeof window === "undefined") return DEFAULT_API_URL;
  return window.localStorage.getItem(API_STORAGE_KEY) || DEFAULT_API_URL;
}

export function setApiUrl(url: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(API_STORAGE_KEY, url);
}

/** Per-hour feature contributions, normalized from whatever shape the API sends. */
export interface ShapHour {
  index: number;
  contributions: Record<string, number>;
}

export interface Forecast {
  baseTimestamp: Date;
  hours: HourPoint[];
  days: ReturnType<typeof groupByDay>;
  shap: ShapHour[];
  features: string[];
}

type UnknownRecord = Record<string, unknown>;

function pickShapRaw(payload: UnknownRecord): unknown {
  return (
    payload["shap"] ??
    payload["shap_values"] ??
    payload["shap_explanations"] ??
    payload["explanations"] ??
    payload["hourly_shap"] ??
    null
  );
}

function normalizeShap(payload: UnknownRecord): { shap: ShapHour[]; features: string[] } {
  const raw = pickShapRaw(payload);
  if (!Array.isArray(raw)) return { shap: [], features: [] };

  const names = (payload["feature_names"] ?? payload["features"]) as unknown;
  const featureNames = Array.isArray(names) ? names.map(String) : null;

  const shap: ShapHour[] = [];
  const featureSet = new Set<string>();

  raw.forEach((entry, index) => {
    const contributions: Record<string, number> = {};
    if (Array.isArray(entry)) {
      entry.forEach((v, i) => {
        const name = featureNames?.[i] ?? `feature_${i + 1}`;
        contributions[name] = Number(v) || 0;
      });
    } else if (entry && typeof entry === "object") {
      const obj = entry as UnknownRecord;
      const inner = (obj["shap_values"] ?? obj["contributions"] ?? obj) as UnknownRecord;
      for (const [k, v] of Object.entries(inner)) {
        if (typeof v === "number") contributions[k] = v;
      }
    }
    Object.keys(contributions).forEach((k) => featureSet.add(k));
    shap.push({ index, contributions });
  });

  return { shap, features: [...featureSet] };
}

export async function fetchForecast(url = getApiUrl()): Promise<Forecast> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    throw new Error(
      `Could not reach the prediction API at ${url}. Make sure the backend is running and allows CORS.`,
    );
  }
  if (!res.ok) throw new Error(`API responded with ${res.status} ${res.statusText}`);

  const payload = (await res.json()) as UnknownRecord;
  const stamp = payload["based_on_timestamp"];
  const preds = payload["predictions"];
  if (typeof stamp !== "string" || !Array.isArray(preds)) {
    throw new Error("Unexpected API response shape: missing based_on_timestamp or predictions.");
  }

  const flat = (Array.isArray(preds[0]) ? preds[0] : preds) as unknown[];
  const values = flat.map((v) => Number(v)).filter((v) => Number.isFinite(v));
  if (!values.length) throw new Error("The API returned no prediction values.");

  const baseTimestamp = parseBaseTimestamp(stamp);
  const hours = buildHours(baseTimestamp, values);
  const { shap, features } = normalizeShap(payload);

  return { baseTimestamp, hours, days: groupByDay(hours), shap, features };
}
