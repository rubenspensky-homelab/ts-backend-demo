import type { Request } from "express";
import type { JWTPayload } from "jose";
import type { AuthenticatedUser, AuthenticationProvider, OidcAuthConfig } from "../types/auth.types";
import { AuthenticationError } from "../types/auth.types";

type JoseModule = typeof import("jose");
type RemoteJWKSet = ReturnType<JoseModule["createRemoteJWKSet"]>;

export class OidcAuthenticationProvider implements AuthenticationProvider {
  private readonly jwksUrl: URL;
  private jwks: RemoteJWKSet | undefined;

  constructor(private readonly config: OidcAuthConfig) {
    this.jwksUrl = new URL(config.jwksUrl);
  }

  async authenticate(req: Request): Promise<AuthenticatedUser> {
    const token = readBearerToken(req);

    try {
      const { jwtVerify } = await import("jose");
      const result = await jwtVerify(token, await this.getJwks(), {
        issuer: this.config.issuer,
        audience: this.config.audience,
      });

      return mapClaimsToUser(result.payload);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      throw new AuthenticationError("Invalid access token");
    }
  }

  private async getJwks(): Promise<RemoteJWKSet> {
    if (!this.jwks) {
      const { createRemoteJWKSet } = await import("jose");
      this.jwks = createRemoteJWKSet(this.jwksUrl);
    }

    return this.jwks;
  }
}

function readBearerToken(req: Request): string {
  const authorization = req.header("authorization")?.trim();

  if (!authorization) {
    throw new AuthenticationError("Missing bearer token");
  }

  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);

  if (!match) {
    throw new AuthenticationError("Invalid Authorization header");
  }

  return match[1];
}

function mapClaimsToUser(payload: JWTPayload): AuthenticatedUser {
  if (!payload.sub) {
    throw new AuthenticationError("Access token is missing subject");
  }

  const email = readStringClaim(payload, "email", payload.sub);
  const name = readStringClaim(payload, "name", email);

  return {
    id: payload.sub,
    email,
    name,
    groups: readGroupsClaim(payload),
  };
}

function readStringClaim(payload: JWTPayload, key: string, fallback: string): string {
  const value = payload[key];
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function readGroupsClaim(payload: JWTPayload): string[] {
  const groups = payload.groups;

  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.filter((group): group is string => typeof group === "string" && group.trim() !== "");
}
