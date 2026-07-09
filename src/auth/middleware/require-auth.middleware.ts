import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthenticationProvider } from "../types/auth.types";
import { AuthenticationError } from "../types/auth.types";

export function createRequireAuth(authenticationProvider: AuthenticationProvider): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.user = await authenticationProvider.authenticate(req);
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
