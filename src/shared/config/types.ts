import type { AuthConfig } from "../auth/types/auth.types";

export type DocsConfig = {
  publicBaseUrls: Array<{
    url: string;
    description: string;
  }>;
  oauthClientId: string;
  oauthAuthorizationUrl: string;
  oauthUpstreamAuthorizationUrl: string;
  oauthTokenUrl: string;
  oauthRedirectUri: string;
};

export type AppConfig = {
  port: number;
  serviceName: string;
  serviceDescription: string;
  version: string;
  environment: string;
  metricsEnabled: boolean;
  tracingEnabled: boolean;
  otlpTracesEndpoint: string;
  auth: AuthConfig;
  docs: DocsConfig;
};

export type ConfigSource = {
  get(key: string): string | undefined;
};
