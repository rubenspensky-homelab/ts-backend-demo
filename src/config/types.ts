export type AppConfig = {
  port: number;
  serviceName: string;
  version: string;
  environment: string;
};

export type ConfigSource = {
  get(key: string): string | undefined;
};
