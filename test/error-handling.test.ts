import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
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

describe("error handling", () => {
  it("returns a structured 500 response and logs the error", async () => {
    const res = await request(app).get("/demo/error").set("x-request-id", "error-request-id");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: "Internal Server Error",
      requestId: "error-request-id",
    });
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
  });
});
