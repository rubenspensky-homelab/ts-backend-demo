import { describe, expect, it } from "vitest";
import { CompositeConfigSource } from "../src/shared/config/env/config-source";
import { loadConfig } from "../src/shared/config/service-config";
import type { ConfigSource } from "../src/shared/config/types";
import { AuthConfigError, ConfigError } from "../src/shared/config/validation/config.errors";

function source(values: Record<string, string | undefined>): ConfigSource {
  return {
    get(key) {
      return values[key];
    },
  };
}

const validConfigValues = {
  PORT: "8080",
  SERVICE_NAME: "users-api",
  SERVICE_DESCRIPTION: "Users service",
  SERVICE_VERSION: "2.3.4",
  NODE_ENV: "production",
  PUBLIC_BASE_URLS: "http://users.internal.test|Internal,https://users.example.test|External",
  METRICS_ENABLED: "true",
  TRACING_ENABLED: "false",
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "http://localhost:4318/custom/traces",
  AUTH_PROVIDER: "oidc",
  AUTH_ISSUER: "http://auth.example.test/application/o/app/",
  AUTH_JWKS_URL: "http://auth.example.test/application/o/app/jwks/",
  AUTH_AUDIENCE: "api-client-id",
  DOCS_OAUTH_CLIENT_ID: "docs-client-id",
  DOCS_OAUTH_AUTHORIZATION_URL: "http://localhost:3000/docs/oauth/authorize",
  DOCS_OAUTH_UPSTREAM_AUTHORIZATION_URL: "http://auth.example.test/application/o/authorize/",
  DOCS_OAUTH_TOKEN_URL: "http://auth.example.test/application/o/token/",
  DOCS_OAUTH_REDIRECT_URI: "http://localhost:3000/docs",
};

describe("loadConfig", () => {
  it("rejects missing required values", () => {
    expect(() => loadConfig(source({}))).toThrow(ConfigError);
    expect(() => loadConfig(source({}))).toThrow("NODE_ENV is required");
  });

  it("reads values from the provided source", () => {
    expect(loadConfig(source(validConfigValues))).toEqual({
      port: 8080,
      serviceName: "users-api",
      serviceDescription: "Users service",
      version: "2.3.4",
      environment: "production",
      metricsEnabled: true,
      tracingEnabled: false,
      otlpTracesEndpoint: "http://localhost:4318/custom/traces",
      auth: {
        provider: "oidc",
        issuer: "http://auth.example.test/application/o/app/",
        jwksUrl: "http://auth.example.test/application/o/app/jwks/",
        audience: "api-client-id",
      },
      docs: {
        publicBaseUrls: [
          { url: "http://users.internal.test", description: "Internal" },
          { url: "https://users.example.test", description: "External" },
        ],
        oauthClientId: "docs-client-id",
        oauthAuthorizationUrl: "http://localhost:3000/docs/oauth/authorize",
        oauthUpstreamAuthorizationUrl: "http://auth.example.test/application/o/authorize/",
        oauthTokenUrl: "http://auth.example.test/application/o/token/",
        oauthRedirectUri: "http://localhost:3000/docs",
      },
    });
  });

  it("reads mock auth config from environment values", () => {
    expect(
      loadConfig(
        source({
          ...validConfigValues,
          NODE_ENV: "development",
          AUTH_PROVIDER: "mock",
          MOCK_USER_ID: "dev-user-1",
          MOCK_USER_EMAIL: "dev@example.com",
          MOCK_USER_NAME: "Dev User",
          MOCK_USER_GROUPS: "admins, developers",
        }),
      ).auth,
    ).toEqual({
      provider: "mock",
      user: {
        id: "dev-user-1",
        email: "dev@example.com",
        name: "Dev User",
        groups: ["admins", "developers"],
      },
    });
  });

  it("rejects unknown auth providers", () => {
    expect(() => loadConfig(source({ ...validConfigValues, AUTH_PROVIDER: "local" }))).toThrow(AuthConfigError);
    expect(() => loadConfig(source({ ...validConfigValues, AUTH_PROVIDER: "local" }))).toThrow(
      "AUTH_PROVIDER must be one of: oidc, mock",
    );
  });

  it("rejects mock auth in production", () => {
    expect(() =>
      loadConfig(
        source({
          ...validConfigValues,
          AUTH_PROVIDER: "mock",
          MOCK_USER_ID: "dev-user-1",
          MOCK_USER_EMAIL: "dev@example.com",
          MOCK_USER_NAME: "Dev User",
          MOCK_USER_GROUPS: "admins,developers",
        }),
      ),
    ).toThrow("AUTH_PROVIDER=mock is not allowed when NODE_ENV=production");
  });

  it("requires explicit boolean values", () => {
    expect(loadConfig(source({ ...validConfigValues, METRICS_ENABLED: "true" })).metricsEnabled).toBe(true);
    expect(loadConfig(source({ ...validConfigValues, METRICS_ENABLED: "false" })).metricsEnabled).toBe(false);
    expect(() => loadConfig(source({ ...validConfigValues, METRICS_ENABLED: "" }))).toThrow(
      "METRICS_ENABLED is required",
    );
    expect(() => loadConfig(source({ ...validConfigValues, METRICS_ENABLED: "yes" }))).toThrow(
      "METRICS_ENABLED must be either true or false",
    );
  });

  it("rejects invalid ports", () => {
    expect(() => loadConfig(source({ ...validConfigValues, PORT: "abc" }))).toThrow(ConfigError);
    expect(() => loadConfig(source({ ...validConfigValues, PORT: "70000" }))).toThrow(
      "PORT must be an integer between 1 and 65535",
    );
  });

  it("rejects invalid public base URLs", () => {
    expect(() => loadConfig(source({ ...validConfigValues, PUBLIC_BASE_URLS: "not-a-url" }))).toThrow(ConfigError);
    expect(() => loadConfig(source({ ...validConfigValues, PUBLIC_BASE_URLS: "not-a-url" }))).toThrow(
      "PUBLIC_BASE_URLS contains an invalid URL: not-a-url",
    );
  });
});

describe("CompositeConfigSource", () => {
  it("uses the first non-empty value", () => {
    const configSource = new CompositeConfigSource([
      source({ SERVICE_NAME: "" }),
      source({ SERVICE_NAME: "from-secrets" }),
      source({ SERVICE_NAME: "from-env" }),
    ]);

    expect(configSource.get("SERVICE_NAME")).toBe("from-secrets");
  });
});
