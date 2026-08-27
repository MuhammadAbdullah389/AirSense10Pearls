import { useMemo } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Download,
  Gauge,
  HeartPulse,
  RefreshCw,
  ShieldAlert,
  Skull,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AqiBadge } from "./AqiBadge";
import { ForecastCharts } from "./ForecastCharts";
import { HourlyTable } from "./HourlyTable";
import { ShapPanel } from "./ShapPanel";
import type { Forecast } from "@/lib/aqi-api";
import {
  AQI_MAX,
  buildAlerts,
  categoryFor,
  fmtDay,
  fmtStamp,
  recommendations,
  toCsv,
} from "@/lib/aqi";

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  delay: number;
}) {
  return (
    <div className="glass-card rise-in rounded-2xl p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold" style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && <p className="text-muted-foreground mt-1 text-xs">{sub}</p>}
    </div>
  );
}

export function Dashboard({
  forecast,
  onRefresh,
  refreshing,
}: {
  forecast: Forecast;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { hours, days, baseTimestamp } = forecast;

  const stats = useMemo(() => {
    const values = hours.map((h) => h.aqi);
    return {
      next: hours[0],
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      hazardous: hours.filter((h) => h.category.key === "hazardous").length,
      veryUnhealthy: hours.filter((h) => h.category.key === "very").length,
    };
  }, [hours]);

  const alerts = useMemo(() => buildAlerts(hours), [hours]);
  const advice = useMemo(() => recommendations(stats.max), [stats.max]);
  const nextCat = stats.next.category;
  const avgCat = categoryFor(stats.avg);

  const exportCsv = () => {
    const blob = new Blob([toCsv(hours)], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `aqi-hourly-forecast-${baseTimestamp.toISOString().slice(0, 13)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const lastHour = hours[hours.length - 1];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="glass-card rise-in overflow-hidden rounded-3xl">
        <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-5">
            <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase">
              <Wind className="size-4" />
              Lahore air quality · 72-hour outlook
            </div>
            <div>
              <h1 className="text-4xl font-semibold sm:text-5xl">AQI Forecast</h1>
              <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
                Air is expected to be <span className="text-foreground font-semibold">{avgCat.label.toLowerCase()}</span>{" "}
                on average over the next three days, peaking at{" "}
                <span className="text-foreground font-semibold">{Math.round(stats.max)} AQI</span> and
                easing to {Math.round(stats.min)} at best. {avgCat.advice}
              </p>
            </div>
            <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                  Prediction generated at
                </dt>
                <dd className="mt-1 font-medium">{fmtStamp(baseTimestamp)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                  Forecast period
                </dt>
                <dd className="mt-1 font-medium">
                  {fmtStamp(hours[0].date)} → {fmtStamp(lastHour.date)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3">
              <Button onClick={onRefresh} disabled={refreshing}>
                <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh predictions
              </Button>
              <Button variant="secondary" onClick={exportCsv}>
                <Download className="size-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div
            className="relative shrink-0 rounded-3xl p-8 text-center"
            style={{
              background: `radial-gradient(circle at 50% 30%, color-mix(in oklab, ${nextCat.color} 26%, transparent), transparent 70%)`,
            }}
          >
            <div className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Next hour</div>
            <div className="mt-2 text-7xl font-semibold" style={{ color: nextCat.color }}>
              {Math.round(stats.next.aqi)}
            </div>
            <div className="mt-3 flex justify-center">
              <AqiBadge aqi={stats.next.aqi} />
            </div>
            <div className="text-muted-foreground mt-3 text-xs">
              {fmtStamp(stats.next.date)} · scale 0–{AQI_MAX}
            </div>
            <div className="mt-5 h-2 w-56 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((stats.next.aqi / AQI_MAX) * 100, 100)}%`,
                  backgroundColor: nextCat.color,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          delay={40}
          icon={<Gauge className="size-3.5" />}
          label="Next hour AQI"
          value={String(Math.round(stats.next.aqi))}
          sub={nextCat.label}
          color={nextCat.color}
        />
        <StatCard
          delay={80}
          icon={<ArrowUpRight className="size-3.5" />}
          label="Highest predicted"
          value={String(Math.round(stats.max))}
          sub={categoryFor(stats.max).label}
          color={categoryFor(stats.max).color}
        />
        <StatCard
          delay={120}
          icon={<ArrowDownRight className="size-3.5" />}
          label="Lowest predicted"
          value={String(Math.round(stats.min))}
          sub={categoryFor(stats.min).label}
          color={categoryFor(stats.min).color}
        />
        <StatCard
          delay={160}
          icon={<Activity className="size-3.5" />}
          label="Average (72 h)"
          value={String(Math.round(stats.avg))}
          sub={avgCat.label}
          color={avgCat.color}
        />
        <StatCard
          delay={200}
          icon={<Skull className="size-3.5" />}
          label="Hazardous hours"
          value={String(stats.hazardous)}
          sub="AQI above 300"
          color="var(--aqi-hazardous)"
        />
        <StatCard
          delay={240}
          icon={<ShieldAlert className="size-3.5" />}
          label="Very unhealthy hours"
          value={String(stats.veryUnhealthy)}
          sub="AQI 201–300"
          color="var(--aqi-very)"
        />
      </section>

      {/* Alerts + recommendations */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="glass-card rise-in rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <BellRing className="text-primary size-5" />
            <h2 className="text-lg font-semibold">Air quality alerts</h2>
          </div>
          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground rounded-2xl border border-dashed border-white/12 p-5 text-sm">
                No severe air quality alerts during the forecast period.
              </p>
            ) : (
              alerts.map((a) => {
                const cat = categoryFor(a.peak);
                return (
                  <div
                    key={a.id}
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${cat.color} 12%, transparent)`,
                      borderLeft: `3px solid ${cat.color}`,
                    }}
                  >
                    <p className="text-sm font-medium">{a.message}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Episode: {fmtStamp(a.start)} → {fmtStamp(a.end)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="glass-card rise-in rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <HeartPulse className="text-primary size-5" />
            <h2 className="text-lg font-semibold">Health recommendations</h2>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Based on a peak of {Math.round(stats.max)} AQI ({categoryFor(stats.max).label})
          </p>
          <ul className="mt-4 space-y-3">
            {advice.map((line) => (
              <li key={line} className="flex gap-3 text-sm">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: categoryFor(stats.max).color }}
                />
                {line}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Daily forecast */}
      <section className="glass-card rise-in rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-primary size-5" />
          <h2 className="text-lg font-semibold">Daily forecast</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {days.map((d) => (
            <div
              key={d.dayKey}
              className="rounded-2xl border border-white/8 bg-white/4 p-5"
              style={{
                background: `linear-gradient(160deg, color-mix(in oklab, ${d.category.color} 14%, transparent), transparent 75%)`,
              }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">{fmtDay(d.date)}</span>
                <span className="text-muted-foreground text-xs">{d.hours.length} h</span>
              </div>
              <div className="mt-3 text-4xl font-semibold" style={{ color: d.category.color }}>
                {Math.round(d.avg)}
              </div>
              <div className="mt-2">
                <AqiBadge aqi={d.avg} />
              </div>
              <div className="text-muted-foreground mt-4 flex justify-between text-xs">
                <span>min {Math.round(d.min)}</span>
                <span>max {Math.round(d.max)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((d.max / AQI_MAX) * 100, 100)}%`,
                    backgroundColor: d.category.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ForecastCharts hours={hours} days={days} />
      <ShapPanel shap={forecast.shap} features={forecast.features} hours={hours} />
      <HourlyTable hours={hours} shap={forecast.shap} />

      <footer className="text-muted-foreground pb-6 text-center text-xs">
        Custom US AQI model · scale 0–{AQI_MAX} · predictions refresh on demand
      </footer>
    </div>
  );
}
