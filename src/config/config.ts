import { loadAuthConfig } from "../auth/config/auth.config";
import { EnvConfigSource } from "./sources";
import type { AppConfig, ConfigSource } from "./types";

const DEFAULT_PORT = 3000;
const DEFAULT_SERVICE_NAME = "act-backend-demo";
const DEFAULT_VERSION = "1.0.0";
const DEFAULT_ENVIRONMENT = "development";
const DEFAULT_OTLP_TRACES_ENDPOINT = "http://localhost:4318/v1/traces";
const DEFAULT_DOCS_OAUTH_CLIENT_ID = "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui";
const DEFAULT_DOCS_OAUTH_AUTHORIZATION_URL = "http://localhost:3000/docs/oauth/authorize";
const DEFAULT_DOCS_OAUTH_UPSTREAM_AUTHORIZATION_URL = "http://auth.home.lab/application/o/authorize/";
const DEFAULT_DOCS_OAUTH_TOKEN_URL = "http://auth.home.lab/application/o/token/";
const DEFAULT_DOCS_OAUTH_REDIRECT_URI = "http://localhost:3000/docs";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function loadConfig(source: ConfigSource): AppConfig {
  const environment = readString(source, "NODE_ENV", DEFAULT_ENVIRONMENT);

  return {
    port: readPort(source),
    serviceName: readString(source, "SERVICE_NAME", DEFAULT_SERVICE_NAME),
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

function readString(source: ConfigSource, key: string, fallback: string): string {
  const value = source.get(key);
  return value && value.trim() !== "" ? value : fallback;
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
