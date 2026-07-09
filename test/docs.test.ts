import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";
import { setLoggerTransport } from "../src/logging/logger";

setLoggerTransport({
  write() {},
});

describe("API documentation", () => {
  it("serves the OpenAPI document with Authentik OAuth security", async () => {
    const res = await request(app).get("/openapi.json");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(res.body.paths).toHaveProperty("/me");
    expect(res.body.paths).toHaveProperty("/auth/test");
    expect(res.body.paths["/me"].get.security).toEqual([{ oauth2: ["openid", "email", "profile"] }]);
    expect(res.body.components.securitySchemes.oauth2.flows.authorizationCode).toMatchObject({
      authorizationUrl: "http://localhost:3000/docs/oauth/authorize",
      tokenUrl: "http://auth.home.lab/application/o/token/",
      "x-scalar-client-id": "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui",
      "x-scalar-redirect-uri": "http://localhost:3000/docs",
      "x-scalar-security-query": {
        client_id: "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui",
        response_type: "code",
      },
      "x-usePkce": "SHA-256",
    });
  });

  it("serves the Scalar API reference", async () => {
    const res = await request(app).get("/docs");

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toContain("text/html");
    expect(res.text).toContain("Scalar API Reference");
    expect(res.text).toContain("act-backend-demo API Docs");
  });

  it("normalizes Scalar OAuth authorize requests before redirecting to Authentik", async () => {
    const res = await request(app)
      .get("/docs/oauth/authorize")
      .query({
        Response_type: "code",
        scope: "openid email profile",
        state: "test-state",
        code_challenge: "test-challenge",
        code_challenge_method: "S256",
      });

    expect(res.status).toBe(302);

    const location = res.header.location;
    expect(location).toEqual(expect.any(String));

    const redirectUrl = new URL(location);
    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe("http://auth.home.lab/application/o/authorize/");
    expect(redirectUrl.searchParams.get("client_id")).toBe("L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui");
    expect(redirectUrl.searchParams.get("response_type")).toBe("code");
    expect(redirectUrl.searchParams.get("Response_type")).toBeNull();
    expect(redirectUrl.searchParams.get("redirect_uri")).toBe("http://localhost:3000/docs");
    expect(redirectUrl.searchParams.get("scope")).toBe("openid email profile");
    expect(redirectUrl.searchParams.get("state")).toBe("test-state");
    expect(redirectUrl.searchParams.get("code_challenge")).toBe("test-challenge");
    expect(redirectUrl.searchParams.get("code_challenge_method")).toBe("S256");
  });
});
