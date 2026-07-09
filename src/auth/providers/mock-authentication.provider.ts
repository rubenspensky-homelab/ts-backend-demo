import type { Request } from "express";
import type { AuthenticatedUser, AuthenticationProvider, MockAuthConfig } from "../types/auth.types";

export class MockAuthenticationProvider implements AuthenticationProvider {
  constructor(private readonly config: MockAuthConfig) {}

  authenticate(_req: Request): Promise<AuthenticatedUser> {
    return Promise.resolve(this.config.user);
  }
}
