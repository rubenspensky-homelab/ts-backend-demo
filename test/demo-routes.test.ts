import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { buildApplication } from "../src/bootstrap/container/build-application";
import { setLoggerTransport } from "../src/shared/observability/logging/logger";
import { mockAuthAppConfig } from "./test-config";

beforeEach(() => {
  setLoggerTransport({ write() {} });
});

describe("demo routes", () => {
  it("allows public access to the demo user endpoint", async () => {
    const res = await request(app).get("/demo/users/123");

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: "123" });
  });

  it("requires authentication for the protected demo user endpoint", async () => {
    const res = await request(app).get("/demo/protected/users/123");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized", message: "Missing bearer token" });
  });

  it("allows authenticated access to the protected demo user endpoint", async () => {
    const { app: authenticatedApp } = buildApplication({ config: mockAuthAppConfig });

    const res = await request(authenticatedApp).get("/demo/protected/users/123");

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: "123" });
  });

  it("validates the demo user id", async () => {
    const res = await request(app).get("/demo/users/%20");

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: "Bad Request",
      message: "Request validation failed",
    });
    expect(res.body.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: "params.id" })]));
  });
});
