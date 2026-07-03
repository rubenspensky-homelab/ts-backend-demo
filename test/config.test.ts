import { describe, expect, it } from "vitest";
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
        }),
      ),
    ).toEqual({
      port: 8080,
      serviceName: "users-api",
      version: "2.3.4",
      environment: "production",
      metricsEnabled: false,
    });
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
