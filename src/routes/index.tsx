import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchForecast } from "@/lib/aqi-api";
import { Dashboard } from "@/components/aqi/Dashboard";
import { LoadingScreen } from "@/components/aqi/LoadingScreen";
import { ErrorScreen } from "@/components/aqi/ErrorScreen";
import skyline from "@/assets/lahore-skyline.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AQI Predictor — 72-Hour Lahore Air Quality Forecast" },
      {
        name: "description",
        content:
          "Hourly and daily AQI predictions for the next 72 hours with alerts, health guidance, charts and SHAP model explanations.",
      },
      { property: "og:title", content: "AQI Predictor — 72-Hour Air Quality Forecast" },
      {
        property: "og:description",
        content:
          "Interactive AQI forecast dashboard: hourly predictions, daily summaries, alerts and model explanations.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const query = useQuery({
    queryKey: ["aqi-forecast"],
    queryFn: () => fetchForecast(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src={skyline}
          alt=""
          aria-hidden
          width={1920}
          height={1088}
          className="drift size-full object-cover opacity-70"
        />
        <div className="fog-veil absolute inset-0" />
      </div>

      {query.isPending ? (
        <LoadingScreen />
      ) : query.isError || !query.data ? (
        <ErrorScreen
          message={query.error instanceof Error ? query.error.message : "Unknown error."}
          onRetry={() => query.refetch()}
        />
      ) : (
        <Dashboard
          forecast={query.data}
          onRefresh={() => query.refetch()}
          refreshing={query.isFetching}
        />
      )}
    </main>
  );
}
