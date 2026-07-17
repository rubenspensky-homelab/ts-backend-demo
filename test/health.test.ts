import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { config } from "../src/shared/config/service-config";
import { setLoggerTransport } from "../src/shared/observability/logging/logger";
import type { LogEntry } from "../src/shared/observability/logging/types";

const logs: LogEntry[] = [];

beforeEach(() => {
  logs.length = 0;
  setLoggerTransport({
    write(entry) {
      logs.push(entry);
    },
  });
});

describe("GET /health", () => {
  it("returns service health details", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      service: "base-microservice",
    });
    expect(res.body.timestamp).toEqual(expect.any(String));
  });

  it("logs a structured request entry", async () => {
    const res = await request(app).get("/health").set("x-request-id", "test-request-id");

    expect(res.header["x-request-id"]).toBe("test-request-id");
    expect(logs).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(logs[0]))).toMatchObject({
      level: "info",
      service: config.serviceName,
      version: config.version,
      environment: config.environment,
      requestId: "test-request-id",
      message: "HTTP request completed",
      http: {
        method: "GET",
        route: "/health",
        statusCode: 200,
      },
    });
    expect(logs[0]?.timestamp).toEqual(expect.any(String));
    expect(logs[0]?.http?.durationMs).toEqual(expect.any(Number));
  });
});

describe("GET /ready", () => {
  it("returns service readiness details", async () => {
    const res = await request(app).get("/ready");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ready",
      service: "base-microservice",
      checks: {},
    });
    expect(res.body.timestamp).toEqual(expect.any(String));
  });
});
