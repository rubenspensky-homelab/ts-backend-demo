import { PrometheusMetrics } from "./prometheus.metrics";
import type { HttpMetricsRecorder, MetricsRegistry } from "./metrics.types";

const prometheusMetrics = new PrometheusMetrics();

export function createPrometheusMetrics(): MetricsRegistry & HttpMetricsRecorder {
  return new PrometheusMetrics();
}

export const metricsRegistry: MetricsRegistry = prometheusMetrics;
export const httpMetrics: HttpMetricsRecorder = prometheusMetrics;
