import { describe, expect, it } from "vitest";
import { AuthConfigError } from "../src/auth/config/auth.config";
import { ConfigError, loadConfig } from "../src/config/config";
import { CompositeConfigSource } from "../src/config/sources";
import type { ConfigSource } from "../src/config/types";

function source(values: Record<string, string | undefined>): ConfigSource {
  return {
    get(key) {
      return values[key];
    },
  };
}

describe("loadConfig", () => {
  it("uses safe defaults", () => {
    expect(loadConfig(source({}))).toEqual({
      port: 3000,
      serviceName: "act-backend-demo",
      version: "1.0.0",
      environment: "development",
      metricsEnabled: true,
      tracingEnabled: true,
      otlpTracesEndpoint: "http://localhost:4318/v1/traces",
      auth: {
        provider: "oidc",
        issuer: "http://auth.home.lab/application/o/frontend-test/",
        jwksUrl: "http://auth.home.lab/application/o/frontend-test/jwks/",
        audience: "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui",
      },
      docs: {
        oauthClientId: "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui",
        oauthAuthorizationUrl: "http://localhost:3000/docs/oauth/authorize",
        oauthUpstreamAuthorizationUrl: "http://auth.home.lab/application/o/authorize/",
        oauthTokenUrl: "http://auth.home.lab/application/o/token/",
        oauthRedirectUri: "http://localhost:3000/docs",
      },
    });
  });

  it("reads values from the provided source", () => {
    expect(
      loadConfig(
        source({
          PORT: "8080",
          SERVICE_NAME: "users-api",
          npm_package_version: "2.3.4",
          NODE_ENV: "production",
          METRICS_ENABLED: "false",
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
        }),
      ),
    ).toEqual({
      port: 8080,
      serviceName: "users-api",
      version: "2.3.4",
      environment: "production",
      metricsEnabled: false,
      tracingEnabled: false,
      otlpTracesEndpoint: "http://localhost:4318/custom/traces",
      auth: {
        provider: "oidc",
        issuer: "http://auth.example.test/application/o/app/",
        jwksUrl: "http://auth.example.test/application/o/app/jwks/",
        audience: "api-client-id",
      },
      docs: {
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
    expect(() => loadConfig(source({ AUTH_PROVIDER: "local" }))).toThrow(AuthConfigError);
    expect(() => loadConfig(source({ AUTH_PROVIDER: "local" }))).toThrow("AUTH_PROVIDER must be one of: oidc, mock");
  });

  it("rejects mock auth in production", () => {
    expect(() =>
      loadConfig(
        source({
          NODE_ENV: "production",
          AUTH_PROVIDER: "mock",
          MOCK_USER_ID: "dev-user-1",
          MOCK_USER_EMAIL: "dev@example.com",
          MOCK_USER_NAME: "Dev User",
        }),
      ),
    ).toThrow("AUTH_PROVIDER=mock is not allowed when NODE_ENV=production");
  });

  it("enables metrics unless explicitly disabled", () => {
    expect(loadConfig(source({ METRICS_ENABLED: "true" })).metricsEnabled).toBe(true);
    expect(loadConfig(source({ METRICS_ENABLED: "" })).metricsEnabled).toBe(true);
    expect(loadConfig(source({ METRICS_ENABLED: "FALSE" })).metricsEnabled).toBe(false);
  });

  it("rejects invalid ports", () => {
    expect(() => loadConfig(source({ PORT: "abc" }))).toThrow(ConfigError);
    expect(() => loadConfig(source({ PORT: "70000" }))).toThrow("PORT must be an integer between 1 and 65535");
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
