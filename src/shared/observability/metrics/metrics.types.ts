export type MetricsRegistry = {
  contentType(): string;
  getMetrics(): Promise<string>;
};

export type HttpMetricLabels = {
  method: string;
  route: string;
  statusCode: number;
};

export type HttpMetricsRecorder = {
  recordHttpRequest(labels: HttpMetricLabels, durationSeconds: number): void;
};
