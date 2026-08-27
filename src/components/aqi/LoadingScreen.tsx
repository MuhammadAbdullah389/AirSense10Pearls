import { Skeleton } from "@/components/ui/skeleton";
import { Wind } from "lucide-react";

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${className}`}>
      <Skeleton className="h-3 w-24 bg-white/10" />
      <Skeleton className="mt-4 h-9 w-28 bg-white/10" />
      <Skeleton className="mt-3 h-3 w-full bg-white/5" />
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="glass-card rise-in flex flex-col gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <div className="text-primary flex items-center gap-3 text-sm font-medium tracking-widest uppercase">
            <Wind className="size-4 animate-pulse" />
            Fetching air quality predictions
          </div>
          <Skeleton className="h-10 w-72 max-w-full bg-white/10" />
          <Skeleton className="h-4 w-56 max-w-full bg-white/5" />
        </div>
        <div className="relative grid size-32 place-items-center">
          <span className="border-primary/25 border-t-primary absolute inset-0 animate-spin rounded-full border-4" />
          <span
            className="border-primary/10 absolute inset-4 animate-spin rounded-full border-2"
            style={{ animationDirection: "reverse", animationDuration: "2.4s" }}
          />
          <span className="text-muted-foreground text-xs">AQI</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rise-in" style={{ animationDelay: `${i * 70}ms` }}>
            <SkeletonCard />
          </div>
        ))}
      </div>

      <div className="glass-card rise-in mt-6 rounded-3xl p-6" style={{ animationDelay: "420ms" }}>
        <Skeleton className="h-3 w-40 bg-white/10" />
        <div className="mt-6 flex h-56 items-end gap-2">
          {Array.from({ length: 28 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 animate-pulse bg-white/10"
              style={{
                height: `${30 + Math.abs(Math.sin(i / 2.2)) * 65}%`,
                animationDelay: `${i * 45}ms`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rise-in" style={{ animationDelay: `${500 + i * 90}ms` }}>
            <SkeletonCard className="h-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
