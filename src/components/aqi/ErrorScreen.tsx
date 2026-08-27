import { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiUrl, setApiUrl } from "@/lib/aqi-api";

export function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  const [url, setUrl] = useState(getApiUrl());

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-4 py-16">
      <div className="glass-card rise-in rounded-3xl p-8 text-center">
        <div
          className="mx-auto grid size-14 place-items-center rounded-2xl"
          style={{ backgroundColor: "color-mix(in oklab, var(--destructive) 18%, transparent)" }}
        >
          <AlertTriangle className="text-destructive size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Prediction request failed</h1>
        <p className="text-muted-foreground mt-2 text-sm">{message}</p>

        <div className="mt-6 text-left">
          <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            API endpoint
          </label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2 bg-white/5"
            placeholder="http://localhost:5000/predict"
          />
        </div>

        <Button
          className="mt-5 w-full"
          onClick={() => {
            setApiUrl(url.trim());
            onRetry();
          }}
        >
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
