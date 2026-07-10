import { Router } from "express";
import type { DocsController } from "../controllers/docs.controller";

export function createDocsRoutes(controller: DocsController): Router {
  const router = Router();

  router.get("/openapi.json", (_req, res) => {
    res.json(controller.getOpenApiDocument());
  });

  router.get("/docs/oauth/authorize", controller.getOAuthAuthorizeRedirectHandler());
  router.get("/docs", controller.getScalarDocsHandler());

  return router;
}
