import { Router } from "express";
import type { DemoController } from "../controllers/demo.controller";
import type { AuthenticationProvider } from "../../../shared/auth/authentication-provider";
import { createRequireAuth } from "../../../shared/auth/middleware/require-auth.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { demoUserParamsSchema } from "../validation/demo.schemas";

export function createDemoRoutes(controller: DemoController, authenticationProvider: AuthenticationProvider): Router {
  const router = Router();
  const requireAuth = createRequireAuth(authenticationProvider);

  router.get("/demo/users/:id", validateRequest({ params: demoUserParamsSchema }), async (req, res) => {
    res.json(await controller.getUser(req.params.id as string, req.requestContext));
  });

  router.get(
    "/demo/protected/users/:id",
    requireAuth,
    validateRequest({ params: demoUserParamsSchema }),
    async (req, res) => {
      res.json(await controller.getUser(req.params.id as string, req.requestContext));
    },
  );

  router.get("/demo/error", (_req, _res) => {
    controller.getError();
  });

  return router;
}
