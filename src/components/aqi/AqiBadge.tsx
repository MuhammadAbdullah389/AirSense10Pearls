import { categoryFor } from "@/lib/aqi";
import { cn } from "@/lib/utils";

export function AqiBadge({
  aqi,
  className,
  showValue = false,
}: {
  aqi: number;
  className?: string;
  showValue?: boolean;
}) {
  const cat = categoryFor(aqi);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        className,
      )}
      style={{
        color: cat.color,
        backgroundColor: `color-mix(in oklab, ${cat.color} 16%, transparent)`,
        border: `1px solid color-mix(in oklab, ${cat.color} 35%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
      {showValue ? `${Math.round(aqi)} · ${cat.label}` : cat.label}
    </span>
  );
}
