import { useState } from "react";
import { fmtStamp, fmtTime, type HourPoint } from "@/lib/aqi";
import type { ShapHour } from "@/lib/aqi-api";
import { AqiBadge } from "./AqiBadge";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function HourlyTable({
  hours,
  shap,
}: {
  hours: HourPoint[];
  shap: ShapHour[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [explainingHour, setExplainingHour] = useState<number | null>(null);
  const visible = expanded ? hours : hours.slice(0, 24);
  const selectedHour = explainingHour === null ? undefined : hours[explainingHour];
  const selectedShap = explainingHour === null ? undefined : shap.find((item) => item.index === explainingHour);
  const selectedRows = selectedShap
    ? Object.entries(selectedShap.contributions)
        .map(([feature, value]) => ({ feature, value }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    : [];

  return (
    <section className="glass-card rise-in rounded-3xl p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Hourly forecast</h2>
        <span className="text-muted-foreground text-xs">{hours.length} hours</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/8">
        <div className="text-muted-foreground grid grid-cols-[1.2fr_0.9fr_0.7fr_1.4fr_auto] gap-2 bg-white/5 px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase">
          <span>Date</span>
          <span>Time</span>
          <span className="text-right">AQI</span>
          <span className="text-right">Category</span>
          <span className="sr-only">Explanation</span>
        </div>
        <div className="divide-y divide-white/5">
          {visible.map((h) => (
            <div
              key={h.index}
              className="grid grid-cols-[1.2fr_0.9fr_0.7fr_1.4fr_auto] items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
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
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                disabled={!shap.some((item) => item.index === h.index)}
                onClick={() => setExplainingHour(h.index)}
                title={
                  shap.some((item) => item.index === h.index)
                    ? "Show SHAP contributions for this hour"
                    : "No SHAP data available for this hour"
                }
              >
                <Brain className="size-3.5" />
                <span className="hidden sm:inline">Explain</span>
                <span className="sr-only"> hour {h.index + 1}</span>
              </Button>
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

      <Dialog open={explainingHour !== null} onOpenChange={(open) => !open && setExplainingHour(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>What influenced this hour?</DialogTitle>
            <DialogDescription>
              {selectedHour ? `${fmtStamp(selectedHour.date)} · AQI ${Math.round(selectedHour.aqi)}` : "Hourly SHAP contributions"}
            </DialogDescription>
          </DialogHeader>
          {selectedRows.length ? (
            <div className="divide-y divide-border rounded-xl border border-border">
              {selectedRows.map(({ feature, value }) => (
                <div key={feature} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span className="min-w-0 break-words">{feature}</span>
                  <span
                    className="shrink-0 font-semibold"
                    style={{ color: value >= 0 ? "var(--aqi-unhealthy)" : "var(--aqi-good)" }}
                  >
                    {value >= 0 ? "+" : ""}{value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No feature contributions were returned for this hour.</p>
          )}
          <p className="text-muted-foreground text-xs">
            Positive values increase the predicted AQI; negative values decrease it.
          </p>
        </DialogContent>
      </Dialog>
    </section>
  );
}
