export type AppConfig = {
  port: number;
  serviceName: string;
  version: string;
  environment: string;
  metricsEnabled: boolean;
  tracingEnabled: boolean;
  otlpTracesEndpoint: string;
};

export type ConfigSource = {
  get(key: string): string | undefined;
};
