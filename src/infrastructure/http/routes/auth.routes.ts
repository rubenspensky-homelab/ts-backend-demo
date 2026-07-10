import { Router } from "express";
import type { AuthController } from "../controllers/auth.controller";
import type { AuthenticationProvider } from "../../../shared/auth/authentication-provider";
import { createRequireAuth } from "../../../shared/auth/middleware/require-auth.middleware";

export function createAuthRoutes(controller: AuthController, authenticationProvider: AuthenticationProvider): Router {
  const router = Router();
  const requireAuth = createRequireAuth(authenticationProvider);

  router.get("/me", requireAuth, (req, res) => {
    if (!req.authenticatedUser) {
      throw new Error("Authenticated user missing after requireAuth middleware");
    }

    res.json(controller.getMe(req.authenticatedUser));
  });

  router.get("/auth/test", requireAuth, (req, res) => {
    if (!req.authenticatedUser) {
      throw new Error("Authenticated user missing after requireAuth middleware");
    }

    res.json(controller.getAuthTest(req.authenticatedUser));
  });

  return router;
}
