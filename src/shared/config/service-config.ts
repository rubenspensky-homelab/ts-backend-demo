import type { ConfigSource } from "./types";
import { EnvConfigSource } from "./env/config-source";
import { AuthConfigError, ConfigError } from "./validation/config.errors";
import type { AppConfig } from "./types";
import type { AuthConfig, AuthProviderName } from "../auth/types/auth.types";

const DEFAULT_PORT = 3000;
const DEFAULT_SERVICE_NAME = "base-microservice";
const DEFAULT_SERVICE_DESCRIPTION = "Base microservice template for future backend services.";
const DEFAULT_VERSION = "1.0.0";
const DEFAULT_ENVIRONMENT = "development";
const DEFAULT_OTLP_TRACES_ENDPOINT = "http://localhost:4318/v1/traces";
const DEFAULT_DOCS_OAUTH_CLIENT_ID = "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui";
const DEFAULT_DOCS_OAUTH_AUTHORIZATION_URL = "http://localhost:3000/docs/oauth/authorize";
const DEFAULT_DOCS_OAUTH_UPSTREAM_AUTHORIZATION_URL = "http://auth.home.lab/application/o/authorize/";
const DEFAULT_DOCS_OAUTH_TOKEN_URL = "http://auth.home.lab/application/o/token/";
const DEFAULT_DOCS_OAUTH_REDIRECT_URI = "http://localhost:3000/docs";
const DEFAULT_AUTH_PROVIDER: AuthProviderName = "oidc";
const DEFAULT_AUTH_ISSUER = "http://auth.home.lab/application/o/frontend-test/";
const DEFAULT_AUTH_JWKS_URL = "http://auth.home.lab/application/o/frontend-test/jwks/";
const DEFAULT_AUTH_AUDIENCE = "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui";

export function loadConfig(source: ConfigSource): AppConfig {
  const environment = readString(source, "NODE_ENV", DEFAULT_ENVIRONMENT);

  return {
    port: readPort(source),
    serviceName: readString(source, "SERVICE_NAME", DEFAULT_SERVICE_NAME),
    serviceDescription: readString(source, "SERVICE_DESCRIPTION", DEFAULT_SERVICE_DESCRIPTION),
    version: readString(source, "npm_package_version", DEFAULT_VERSION),
    environment,
    metricsEnabled: readBoolean(source, "METRICS_ENABLED", true),
    tracingEnabled: readBoolean(source, "TRACING_ENABLED", true),
    otlpTracesEndpoint: readString(source, "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", DEFAULT_OTLP_TRACES_ENDPOINT),
    auth: loadAuthConfig(source, environment),
    docs: {
      oauthClientId: readString(source, "DOCS_OAUTH_CLIENT_ID", DEFAULT_DOCS_OAUTH_CLIENT_ID),
      oauthAuthorizationUrl: readString(
        source,
        "DOCS_OAUTH_AUTHORIZATION_URL",
        DEFAULT_DOCS_OAUTH_AUTHORIZATION_URL,
      ),
      oauthUpstreamAuthorizationUrl: readString(
        source,
        "DOCS_OAUTH_UPSTREAM_AUTHORIZATION_URL",
        DEFAULT_DOCS_OAUTH_UPSTREAM_AUTHORIZATION_URL,
      ),
      oauthTokenUrl: readString(source, "DOCS_OAUTH_TOKEN_URL", DEFAULT_DOCS_OAUTH_TOKEN_URL),
      oauthRedirectUri: readString(source, "DOCS_OAUTH_REDIRECT_URI", DEFAULT_DOCS_OAUTH_REDIRECT_URI),
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
    issuer: readString(source, "AUTH_ISSUER", DEFAULT_AUTH_ISSUER),
    jwksUrl: readString(source, "AUTH_JWKS_URL", DEFAULT_AUTH_JWKS_URL),
    audience: readString(source, "AUTH_AUDIENCE", DEFAULT_AUTH_AUDIENCE),
  };
}

function readAuthProvider(source: ConfigSource): AuthProviderName {
  const value = readString(source, "AUTH_PROVIDER", DEFAULT_AUTH_PROVIDER);

  if (value !== "oidc" && value !== "mock") {
    throw new AuthConfigError("AUTH_PROVIDER must be one of: oidc, mock");
  }

  return value;
}

function readRequiredString(source: ConfigSource, key: string): string {
  const value = source.get(key);

  if (!value || value.trim() === "") {
    throw new AuthConfigError(`${key} is required when AUTH_PROVIDER=mock`);
  }

  return value.trim();
}

function readRequiredStringList(source: ConfigSource, key: string): string[] {
  return readRequiredString(source, key)
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

function readString(source: ConfigSource, key: string, fallback: string): string {
  const value = source.get(key);
  return value && value.trim() !== "" ? value.trim() : fallback;
}

function readPort(source: ConfigSource): number {
  const rawPort = source.get("PORT");

  if (!rawPort || rawPort.trim() === "") {
    return DEFAULT_PORT;
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError("PORT must be an integer between 1 and 65535");
  }

  return port;
}

function readBoolean(source: ConfigSource, key: string, fallback: boolean): boolean {
  const value = source.get(key);

  if (!value || value.trim() === "") {
    return fallback;
  }

  return value.trim().toLowerCase() !== "false";
}

export const config = loadConfig(new EnvConfigSource());
