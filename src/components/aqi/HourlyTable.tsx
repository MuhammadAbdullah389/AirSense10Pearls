import { useState } from "react";
import { fmtTime, type HourPoint } from "@/lib/aqi";
import { AqiBadge } from "./AqiBadge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function HourlyTable({ hours }: { hours: HourPoint[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? hours : hours.slice(0, 24);

  return (
    <section className="glass-card rise-in rounded-3xl p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Hourly forecast</h2>
        <span className="text-muted-foreground text-xs">{hours.length} hours</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/8">
        <div className="text-muted-foreground grid grid-cols-[1.2fr_0.9fr_0.7fr_1.4fr] gap-2 bg-white/5 px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase">
          <span>Date</span>
          <span>Time</span>
          <span className="text-right">AQI</span>
          <span className="text-right">Category</span>
        </div>
        <div className="divide-y divide-white/5">
          {visible.map((h) => (
            <div
              key={h.index}
              className="grid grid-cols-[1.2fr_0.9fr_0.7fr_1.4fr] items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
            >
              <span className="text-muted-foreground">
                {h.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
              <span className="text-muted-foreground">{fmtTime(h.date)}</span>
              <span className="text-right font-semibold" style={{ color: h.category.color }}>
                {Math.round(h.aqi)}
              </span>
              <span className="flex justify-end">
                <AqiBadge aqi={h.aqi} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {hours.length > 24 && (
        <Button variant="ghost" className="mt-3 w-full" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less" : `Show all ${hours.length} hours`}
          <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </Button>
      )}
    </section>
  );
}
