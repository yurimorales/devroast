"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/client-singleton";

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
  const { data: metrics, isError } = useQuery(trpc.getMetrics.queryOptions());
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (metrics) {
      setDisplayTotal(metrics.totalSubmissions);
      setDisplayScore(metrics.avgScore);
    }
  }, [metrics]);

  if (isError || !metrics) {
    return (
      <div className="flex items-center gap-6 justify-center pt-8">
        <span className="font-mono text-xs text-text-tertiary">
          -- codes roasted
        </span>
        <span className="font-mono text-xs text-text-tertiary">·</span>
        <span className="font-mono text-xs text-text-tertiary">
          avg score: --/10
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 justify-center pt-8">
      <div className="flex items-center gap-2">
        <MetricValue value={displayTotal} />
        <span className="font-mono text-xs text-text-tertiary">
          codes roasted
        </span>
      </div>
      <span className="font-mono text-xs text-text-tertiary">·</span>
      <div className="flex items-center gap-2">
        <MetricValue value={displayScore} suffix="/10" />
        <span className="font-mono text-xs text-text-tertiary">avg score</span>
      </div>
    </div>
  );
}
