import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { config } from "../src/config/config";
import { setLoggerTransport } from "../src/logging/logger";
import type { LogEntry } from "../src/logging/types";

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
  it("returns ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("logs a structured JSON request entry", async () => {
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

describe("GET /me", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized", message: "Missing bearer token" });
  });
});

describe("GET /auth/test", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/auth/test");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized", message: "Missing bearer token" });
  });
});

describe("demo logging routes", () => {
  it("logs a domain event for the demo user route", async () => {
    const res = await request(app).get("/demo/users/123").set("x-request-id", "event-request-id");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: { id: "123", name: "Demo User" } });
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({
      level: "info",
      requestId: "event-request-id",
      message: "Demo user fetched",
      event: {
        event: "demo.user.fetched",
        entity: "user",
        entityId: "123",
      },
      user: { id: "123" },
    });
    expect(logs[1]).toMatchObject({
      message: "HTTP request completed",
      http: {
        method: "GET",
        route: "/demo/users/:id",
        statusCode: 200,
      },
    });
  });

  it("logs structured errors and returns the request id", async () => {
    const res = await request(app).get("/demo/error").set("x-request-id", "error-request-id");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: "Internal Server Error",
      requestId: "error-request-id",
    });
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({
      level: "error",
      requestId: "error-request-id",
      message: "Unhandled request error",
      error: {
        name: "Error",
        message: "Demo error for structured logging",
        context: {
          method: "GET",
          path: "/demo/error",
        },
      },
    });
    expect(logs[0]?.error?.stack).toEqual(expect.any(String));
    expect(logs[1]).toMatchObject({
      message: "HTTP request completed",
      http: {
        method: "GET",
        route: "/demo/error",
        statusCode: 500,
      },
    });
  });
});
