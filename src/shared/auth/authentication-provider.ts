import type { Request } from "express";
import type { AuthenticatedUser } from "./types/auth.types";

export type AuthenticationProvider = {
  authenticate(req: Request): Promise<AuthenticatedUser>;
};
