import type { ConfigSource } from "../../config/types";
import type { AuthConfig, AuthProviderName } from "../types/auth.types";

const DEFAULT_AUTH_PROVIDER: AuthProviderName = "oidc";
const DEFAULT_AUTH_ISSUER = "http://auth.home.lab/application/o/frontend-test/";
const DEFAULT_AUTH_JWKS_URL = "http://auth.home.lab/application/o/frontend-test/jwks/";
const DEFAULT_AUTH_AUDIENCE = "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui";

export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigError";
  }
}

export function loadAuthConfig(source: ConfigSource, environment: string): AuthConfig {
  const provider = readAuthProvider(source);

  if (environment === "production" && provider === "mock") {
    throw new AuthConfigError("AUTH_PROVIDER=mock is not allowed when NODE_ENV=production");
  }

  if (provider === "mock") {
    return {
      provider,
      user: {
        id: readRequiredString(source, "MOCK_USER_ID"),
        email: readRequiredString(source, "MOCK_USER_EMAIL"),
        name: readRequiredString(source, "MOCK_USER_NAME"),
        groups: readRequiredStringList(source, "MOCK_USER_GROUPS"),
      },
    };
  }

  return {
    provider,
    issuer: readString(source, "AUTH_ISSUER", DEFAULT_AUTH_ISSUER),
    jwksUrl: readString(source, "AUTH_JWKS_URL", DEFAULT_AUTH_JWKS_URL),
    audience: readString(source, "AUTH_AUDIENCE", DEFAULT_AUTH_AUDIENCE),
  };
}

function readAuthProvider(source: ConfigSource): AuthProviderName {
  const value = readString(source, "AUTH_PROVIDER", DEFAULT_AUTH_PROVIDER);

  if (value !== "oidc" && value !== "mock") {
    throw new AuthConfigError("AUTH_PROVIDER must be one of: oidc, mock");
  }

  return value;
}

function readRequiredString(source: ConfigSource, key: string): string {
  const value = source.get(key);

  if (!value || value.trim() === "") {
    throw new AuthConfigError(`${key} is required when AUTH_PROVIDER=mock`);
  }

  return value.trim();
}

function readString(source: ConfigSource, key: string, fallback: string): string {
  const value = source.get(key);
  return value && value.trim() !== "" ? value.trim() : fallback;
}

function readRequiredStringList(source: ConfigSource, key: string): string[] {
  return readRequiredString(source, key)
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}
