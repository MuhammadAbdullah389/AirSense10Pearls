import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categoryFor, fmtDay, fmtStamp, type DaySummary, type HourPoint } from "@/lib/aqi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

function HourTooltip({ active, payload }: { active?: boolean; payload?: unknown[] }) {
  if (!active || !payload?.length) return null;
  const point = (payload[0] as { payload: { date: Date; aqi: number } }).payload;
  const cat = categoryFor(point.aqi);
  return (
    <div className="bg-popover/95 rounded-xl border p-3 text-xs shadow-xl backdrop-blur">
      <div className="text-muted-foreground">{fmtStamp(point.date)}</div>
      <div className="mt-1 text-lg font-semibold" style={{ color: cat.color }}>
        {Math.round(point.aqi)}
      </div>
      <div style={{ color: cat.color }}>{cat.label}</div>
    </div>
  );
}

function DayTooltip({ active, payload }: { active?: boolean; payload?: unknown[] }) {
  if (!active || !payload?.length) return null;
  const d = (payload[0] as { payload: { date: Date; avg: number; min: number; max: number } })
    .payload;
  const cat = categoryFor(d.avg);
  return (
    <div className="bg-popover/95 rounded-xl border p-3 text-xs shadow-xl backdrop-blur">
      <div className="text-muted-foreground">{fmtDay(d.date)}</div>
      <div className="mt-1 text-lg font-semibold" style={{ color: cat.color }}>
        {Math.round(d.avg)} avg
      </div>
      <div style={{ color: cat.color }}>{cat.label}</div>
      <div className="text-muted-foreground mt-1">
        min {Math.round(d.min)} · max {Math.round(d.max)}
      </div>
    </div>
  );
}

export function ForecastCharts({ hours, days }: { hours: HourPoint[]; days: DaySummary[] }) {
  const hourData = hours.map((h) => ({
    ...h,
    label: `${fmtDay(h.date)} ${h.date.getHours()}:00`,
  }));

  return (
    <section className="glass-card rise-in rounded-3xl p-5 sm:p-6">
      <Tabs defaultValue="line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Forecast analytics</h2>
            <p className="text-muted-foreground text-sm">
              72 hours of predicted AQI, visualised three ways
            </p>
          </div>
          <TabsList className="bg-white/5">
            <TabsTrigger value="line">Hourly line</TabsTrigger>
            <TabsTrigger value="bar">Daily average</TabsTrigger>
            <TabsTrigger value="area">Trend</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="line" className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourData} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" {...axis} interval={7} />
              <YAxis {...axis} domain={[0, "dataMax + 30"]} />
              <Tooltip content={<HourTooltip />} cursor={{ stroke: "var(--border)" }} />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="var(--primary)"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="bar" className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="dayKey" {...axis} tickFormatter={(_v, i) => fmtDay(days[i].date)} />
              <YAxis {...axis} />
              <Tooltip content={<DayTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.3 }} />
              <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                {days.map((d) => (
                  <Cell key={d.dayKey} fill={d.category.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="area" className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourData} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="aqiTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--aqi-unhealthy)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" {...axis} interval={7} />
              <YAxis {...axis} domain={[0, "dataMax + 30"]} />
              <Tooltip content={<HourTooltip />} cursor={{ stroke: "var(--border)" }} />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="var(--aqi-sensitive)"
                strokeWidth={2}
                fill="url(#aqiTrend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </section>
  );
}
