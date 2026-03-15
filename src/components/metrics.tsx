"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client-singleton";

function MetricSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-16 bg-bg-elevated animate-pulse rounded" />
      <div className="h-4 w-8 bg-bg-elevated animate-pulse rounded" />
    </div>
  );
}

function MetricValue({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <NumberFlow
      value={value}
      suffix={suffix}
      className="font-mono text-xs text-text-tertiary"
    />
  );
}

export function Metrics() {
  const {
    data: metrics,
    isLoading,
    isError,
  } = useQuery(trpc.getMetrics.queryOptions());

  if (isLoading) {
    return (
      <div className="flex items-center gap-6 justify-center pt-8">
        <MetricSkeleton />
        <span className="font-mono text-xs text-text-tertiary">·</span>
        <MetricSkeleton />
      </div>
    );
  }

  if (isError || !metrics) {
    return null;
  }

  return (
    <div className="flex items-center gap-6 justify-center pt-8">
      <div className="flex items-center gap-2">
        <MetricValue value={metrics.totalSubmissions} />
        <span className="font-mono text-xs text-text-tertiary">
          codes roasted
        </span>
      </div>
      <span className="font-mono text-xs text-text-tertiary">·</span>
      <div className="flex items-center gap-2">
        <MetricValue value={metrics.avgScore} suffix="/10" />
        <span className="font-mono text-xs text-text-tertiary">avg score</span>
      </div>
    </div>
  );
}
