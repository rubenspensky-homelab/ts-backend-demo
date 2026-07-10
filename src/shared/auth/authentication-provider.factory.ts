import type { AuthenticationProvider } from "./authentication-provider";
import { MockAuthenticationProvider } from "./providers/mock-authentication.provider";
import { OidcAuthenticationProvider } from "./providers/oidc-authentication.provider";
import type { AuthConfig } from "./types/auth.types";

export function createAuthenticationProvider(config: AuthConfig): AuthenticationProvider {
  switch (config.provider) {
    case "mock":
      return new MockAuthenticationProvider(config);
    case "oidc":
      return new OidcAuthenticationProvider(config);
  }
}
