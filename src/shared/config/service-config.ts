import type { ConfigSource } from "./types";
import { EnvConfigSource } from "./env/config-source";
import { readBoolean, readPort, readRequiredString, readRequiredStringList } from "./readers";
import { AuthConfigError } from "./validation/config.errors";
import type { AppConfig } from "./types";
import type { AuthConfig, AuthProviderName } from "../auth/types/auth.types";

export function loadConfig(source: ConfigSource): AppConfig {
  const environment = readRequiredString(source, "NODE_ENV");

  return {
    port: readPort(source, "PORT"),
    serviceName: readRequiredString(source, "SERVICE_NAME"),
    serviceDescription: readRequiredString(source, "SERVICE_DESCRIPTION"),
    version: readRequiredString(source, "SERVICE_VERSION"),
    environment,
    metricsEnabled: readBoolean(source, "METRICS_ENABLED"),
    tracingEnabled: readBoolean(source, "TRACING_ENABLED"),
    otlpTracesEndpoint: readRequiredString(source, "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"),
    auth: loadAuthConfig(source, environment),
    docs: {
      oauthClientId: readRequiredString(source, "DOCS_OAUTH_CLIENT_ID"),
      oauthAuthorizationUrl: readRequiredString(source, "DOCS_OAUTH_AUTHORIZATION_URL"),
      oauthUpstreamAuthorizationUrl: readRequiredString(source, "DOCS_OAUTH_UPSTREAM_AUTHORIZATION_URL"),
      oauthTokenUrl: readRequiredString(source, "DOCS_OAUTH_TOKEN_URL"),
      oauthRedirectUri: readRequiredString(source, "DOCS_OAUTH_REDIRECT_URI"),
    },
  };
}

function loadAuthConfig(source: ConfigSource, environment: string): AuthConfig {
  const provider = readAuthProvider(source);

  if (environment === "production" && provider === "mock") {
    throw new AuthConfigError("AUTH_PROVIDER=mock is not allowed when NODE_ENV=production");
  }

  if (provider === "mock") {
    return {
      provider,
      user: {
        id: readRequiredString(source, "MOCK_USER_ID"),
        email: readRequiredString(source, "MOCK_USER_EMAIL"),
        name: readRequiredString(source, "MOCK_USER_NAME"),
        groups: readRequiredStringList(source, "MOCK_USER_GROUPS"),
      },
    };
  }

  return {
    provider,
    issuer: readRequiredString(source, "AUTH_ISSUER"),
    jwksUrl: readRequiredString(source, "AUTH_JWKS_URL"),
    audience: readRequiredString(source, "AUTH_AUDIENCE"),
  };
}

function readAuthProvider(source: ConfigSource): AuthProviderName {
  const value = readRequiredString(source, "AUTH_PROVIDER");

  if (value !== "oidc" && value !== "mock") {
    throw new AuthConfigError("AUTH_PROVIDER must be one of: oidc, mock");
  }

  return value;
}

export const config = loadConfig(new EnvConfigSource());
