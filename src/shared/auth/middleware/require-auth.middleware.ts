import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthenticationProvider } from "../authentication-provider";
import { AuthenticationError } from "../types/auth.types";

export function createRequireAuth(authenticationProvider: AuthenticationProvider): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedUser = await authenticationProvider.authenticate(req);

      req.authenticatedUser = authenticatedUser;
      req.requestContext = {
        ...req.requestContext,
        userId: authenticatedUser.id,
        roles: authenticatedUser.groups,
      };

      next();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Unauthorized", message: error.message });
        return;
      }

      next(error);
    }
  };
}
