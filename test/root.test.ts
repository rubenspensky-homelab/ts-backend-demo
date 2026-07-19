import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { setLoggerTransport } from "../src/shared/observability/logging/logger";

beforeEach(() => {
  setLoggerTransport({ write() {} });
});

describe("GET /", () => {
  it("returns a landing page for browsers", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toContain("text/html");
    expect(res.text).toContain("base-microservice");
    expect(res.text).toContain("View API docs");
    expect(res.text).toContain("/docs");
    expect(res.text).toContain("Grafana Dashboard");
    expect(res.text).toContain("https://grafana.rubenspensky.com/public-dashboards/670e197c902a4c179d9e2a92812b8f07");
  });

  it("returns service metadata when json is requested", async () => {
    const res = await request(app).get("/").set("accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      service: "base-microservice",
      message: "Base microservice template for future backend services.",
      status: "running",
      documentation: "/docs",
      health: "/health",
    });
  });
});
