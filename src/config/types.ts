import type { AuthConfig } from "../auth/types/auth.types";

export type AppConfig = {
  port: number;
  serviceName: string;
  version: string;
  environment: string;
  metricsEnabled: boolean;
  tracingEnabled: boolean;
  otlpTracesEndpoint: string;
  auth: AuthConfig;
  docs: DocsConfig;
};

export type DocsConfig = {
  oauthClientId: string;
  oauthAuthorizationUrl: string;
  oauthUpstreamAuthorizationUrl: string;
  oauthTokenUrl: string;
  oauthRedirectUri: string;
};

export type ConfigSource = {
  get(key: string): string | undefined;
};
