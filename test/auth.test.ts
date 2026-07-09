import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createRequireAuth } from "../src/auth/middleware/require-auth.middleware";
import { MockAuthenticationProvider } from "../src/auth/providers/mock-authentication.provider";
import { OidcAuthenticationProvider } from "../src/auth/providers/oidc-authentication.provider";
import type { MockAuthConfig, OidcAuthConfig } from "../src/auth/types/auth.types";

const mockConfig: MockAuthConfig = {
  provider: "mock",
  user: {
    id: "dev-user-1",
    email: "dev@example.com",
    name: "Dev User",
    groups: ["admins", "developers"],
  },
};

const oidcConfig: OidcAuthConfig = {
  provider: "oidc",
  issuer: "http://auth.home.lab/application/o/frontend-test/",
  jwksUrl: "http://auth.home.lab/application/o/frontend-test/jwks/",
  audience: "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui",
};

describe("MockAuthenticationProvider", () => {
  it("injects the configured authenticated user", async () => {
    const provider = new MockAuthenticationProvider(mockConfig);
    const app = express();
    const requireAuth = createRequireAuth(provider);

    app.get("/me", requireAuth, (req, res) => {
      res.json(req.user);
    });

    app.get("/auth/test", requireAuth, (req, res) => {
      res.json({ authenticated: true, user: req.user });
    });

    const res = await request(app).get("/me");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockConfig.user);
  });

  it("supports the protected auth test endpoint", async () => {
    const provider = new MockAuthenticationProvider(mockConfig);
    const app = express();
    const requireAuth = createRequireAuth(provider);

    app.get("/auth/test", requireAuth, (req, res) => {
      res.json({ authenticated: true, user: req.user });
    });

    const res = await request(app).get("/auth/test");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true, user: mockConfig.user });
  });
});

describe("OidcAuthenticationProvider", () => {
  it("rejects requests without a bearer token", async () => {
    const provider = new OidcAuthenticationProvider(oidcConfig);
    const app = express();
    const requireAuth = createRequireAuth(provider);

    app.get("/me", requireAuth, (_req, res) => {
      res.json({ ok: true });
    });

    const res = await request(app).get("/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized", message: "Missing bearer token" });
  });

  it("rejects the auth test endpoint without a bearer token", async () => {
    const provider = new OidcAuthenticationProvider(oidcConfig);
    const app = express();
    const requireAuth = createRequireAuth(provider);

    app.get("/auth/test", requireAuth, (_req, res) => {
      res.json({ authenticated: true });
    });

    const res = await request(app).get("/auth/test");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized", message: "Missing bearer token" });
  });
});
