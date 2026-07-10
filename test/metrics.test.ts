import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { setLoggerTransport } from "../src/shared/observability/logging/logger";

beforeEach(() => {
  setLoggerTransport({ write() {} });
});

describe("GET /metrics", () => {
  it("returns Prometheus metrics", async () => {
    await request(app).get("/health");

    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toContain("text/plain");
    expect(res.text).toContain("# HELP process_cpu_user_seconds_total");
    expect(res.text).toContain("# HELP http_requests_total");
    expect(res.text).toContain('http_requests_total{method="GET",route="/health",status_code="200"}');
  });

  it("uses Express route patterns instead of raw URLs", async () => {
    await request(app).get("/demo/users/123");

    const res = await request(app).get("/metrics");

    expect(res.text).toContain('route="/demo/users/:id"');
    expect(res.text).not.toContain('route="/demo/users/123"');
  });
});
