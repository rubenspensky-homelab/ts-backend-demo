import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client";
import type { HttpMetricLabels, HttpMetricsRecorder, MetricsRegistry } from "./metrics.types";

const HTTP_LABELS = ["method", "route", "status_code"] as const;

export class PrometheusMetrics implements MetricsRegistry, HttpMetricsRecorder {
  private readonly registry = new Registry();
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDurationSeconds: Histogram<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests.",
      labelNames: HTTP_LABELS,
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds.",
      labelNames: HTTP_LABELS,
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });
  }

  contentType(): string {
    return this.registry.contentType;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  recordHttpRequest(labels: HttpMetricLabels, durationSeconds: number): void {
    const prometheusLabels = {
      method: labels.method,
      route: labels.route,
      status_code: String(labels.statusCode),
    };

    this.httpRequestsTotal.inc(prometheusLabels);
    this.httpRequestDurationSeconds.observe(prometheusLabels, durationSeconds);
  }
}
