export type AppConfig = {
  port: number;
  serviceName: string;
  version: string;
  environment: string;
  metricsEnabled: boolean;
};

export type ConfigSource = {
  get(key: string): string | undefined;
};
