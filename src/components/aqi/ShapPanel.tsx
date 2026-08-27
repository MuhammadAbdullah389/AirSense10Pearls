import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { fmtStamp, type HourPoint } from "@/lib/aqi";
import type { ShapHour } from "@/lib/aqi-api";
import { Brain } from "lucide-react";

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--aqi-sensitive)",
];

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

export function ShapPanel({
  shap,
  features,
  hours,
}: {
  shap: ShapHour[];
  features: string[];
  hours: HourPoint[];
}) {
  const [hourIndex, setHourIndex] = useState(0);

  const importance = useMemo(
    () =>
      features
        .map((f) => ({
          feature: f,
          mean: shap.reduce((sum, s) => sum + Math.abs(s.contributions[f] ?? 0), 0) / (shap.length || 1),
        }))
        .sort((a, b) => b.mean - a.mean),
    [features, shap],
  );

  const topFeatures = importance.slice(0, 6).map((i) => i.feature);

  const overTime = useMemo(
    () =>
      shap.map((s) => {
        const row: Record<string, number | string> = {
          label: hours[s.index]
            ? `${hours[s.index].date.getDate()}/${hours[s.index].date.getHours()}h`
            : `h${s.index + 1}`,
        };
        topFeatures.forEach((f) => (row[f] = s.contributions[f] ?? 0));
        return row;
      }),
    [shap, hours, topFeatures],
  );

  const selected = shap[Math.min(hourIndex, shap.length - 1)];
  const selectedRows = useMemo(() => {
    if (!selected) return [];
    return Object.entries(selected.contributions)
      .map(([feature, value]) => ({ feature, value }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 10);
  }, [selected]);

  if (!shap.length) {
    return (
      <section className="glass-card rise-in rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <Brain className="text-primary size-5" />
          <h2 className="text-lg font-semibold">Hour-wise SHAP explanations</h2>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          No SHAP payload found in the API response. Include a{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">shap</code> array (one entry
          per predicted hour, either objects of feature → contribution or arrays paired with{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">feature_names</code>) and this
          panel renders importance, drivers over time, and a per-hour breakdown automatically.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-card rise-in space-y-8 rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Brain className="text-primary size-5" />
        <div>
          <h2 className="text-lg font-semibold">Hour-wise SHAP explanations</h2>
          <p className="text-muted-foreground text-sm">
            What drives each hourly prediction, accumulated across the forecast
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Global importance (mean |SHAP|)
          </h3>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importance.slice(0, 10)} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" {...axis} />
                <YAxis type="category" dataKey="feature" width={110} {...axis} />
                <Tooltip
                  cursor={{ fill: "var(--accent)", opacity: 0.3 }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [v.toFixed(3), "mean |SHAP|"]}
                />
                <Bar dataKey="mean" radius={[0, 6, 6, 0]}>
                  {importance.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Top drivers over the forecast
          </h3>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overTime} margin={{ left: -18, right: 8 }} stackOffset="sign">
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" {...axis} interval={7} />
                <YAxis {...axis} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0} stroke="var(--border)" />
                {topFeatures.map((f, i) => (
                  <Area
                    key={f}
                    type="monotone"
                    dataKey={f}
                    stackId="shap"
                    stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                    fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                    fillOpacity={0.35}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Breakdown for a single hour
          </h3>
          <span className="text-sm font-medium">
            {hours[hourIndex] ? fmtStamp(hours[hourIndex].date) : `Hour ${hourIndex + 1}`}
            {hours[hourIndex] && (
              <span className="text-primary ml-2">AQI {Math.round(hours[hourIndex].aqi)}</span>
            )}
          </span>
        </div>
        <Slider
          className="mt-4"
          value={[hourIndex]}
          min={0}
          max={Math.max(shap.length - 1, 0)}
          step={1}
          onValueChange={([v]) => setHourIndex(v)}
        />
        <div className="mt-5 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={selectedRows} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis type="number" {...axis} />
              <YAxis type="category" dataKey="feature" width={110} {...axis} />
              <ReferenceLine x={0} stroke="var(--border)" />
              <Tooltip
                cursor={{ fill: "var(--accent)", opacity: 0.3 }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [v.toFixed(3), "SHAP contribution"]}
              />
              <Bar dataKey="value" radius={4}>
                {selectedRows.map((r, i) => (
                  <Cell
                    key={i}
                    fill={r.value >= 0 ? "var(--aqi-unhealthy)" : "var(--aqi-good)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          Positive contributions push the predicted AQI up; negative ones pull it down.
        </p>
      </div>
    </section>
  );
}
