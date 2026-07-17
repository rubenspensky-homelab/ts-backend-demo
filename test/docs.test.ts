import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { setLoggerTransport } from "../src/shared/observability/logging/logger";

beforeEach(() => {
  setLoggerTransport({ write() {} });
});

describe("API documentation", () => {
  it("serves the OpenAPI document with documented system and auth endpoints", async () => {
    const res = await request(app).get("/openapi.json");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(res.body.paths).toHaveProperty("/");
    expect(res.body.paths).toHaveProperty("/health");
    expect(res.body.paths).toHaveProperty("/ready");
    expect(res.body.paths).toHaveProperty("/me");
    expect(res.body.paths["/me"].get.security).toEqual([{ oauth2: ["openid", "email", "profile"] }]);
    expect(res.body.components.securitySchemes.oauth2.flows.authorizationCode).toMatchObject({
      authorizationUrl: "http://localhost:3000/docs/oauth/authorize",
      tokenUrl: "http://auth.home.lab/application/o/token/",
      "x-scalar-client-id": "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui",
      "x-scalar-redirect-uri": "http://localhost:3000/docs",
    });
  });

  it("serves the Scalar API reference", async () => {
    const res = await request(app).get("/docs");

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toContain("text/html");
    expect(res.text).toContain("Scalar API Reference");
    expect(res.text).toContain("base-microservice API Docs");
  });

  it("normalizes Scalar OAuth authorize requests before redirecting to Authentik", async () => {
    const res = await request(app).get("/docs/oauth/authorize").query({
      Response_type: "code",
      scope: "openid email profile",
      state: "test-state",
      code_challenge: "test-challenge",
      code_challenge_method: "S256",
    });

    expect(res.status).toBe(302);

    const redirectUrl = new URL(res.header.location as string);
    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe("http://auth.home.lab/application/o/authorize/");
    expect(redirectUrl.searchParams.get("client_id")).toBe("L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui");
    expect(redirectUrl.searchParams.get("response_type")).toBe("code");
    expect(redirectUrl.searchParams.get("Response_type")).toBeNull();
    expect(redirectUrl.searchParams.get("redirect_uri")).toBe("http://localhost:3000/docs");
  });
});
