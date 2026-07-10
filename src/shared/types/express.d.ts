import type { AuthenticatedUser } from "../auth/types/auth.types";
import type { RequestContext } from "../auth/request-context/request-context.types";

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUser;
      requestContext: RequestContext;
    }
  }
}

export {};
