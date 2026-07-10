export type AuthProviderName = "oidc" | "mock";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  groups: string[];
};

export type OidcAuthConfig = {
  provider: "oidc";
  issuer: string;
  jwksUrl: string;
  audience: string;
};

export type MockAuthConfig = {
  provider: "mock";
  user: AuthenticatedUser;
};

export type AuthConfig = OidcAuthConfig | MockAuthConfig;

export class AuthenticationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}
