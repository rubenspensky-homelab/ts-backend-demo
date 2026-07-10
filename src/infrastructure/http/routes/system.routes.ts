import { Router } from "express";
import type { SystemController } from "../controllers/system.controller";

export function createSystemRoutes(controller: SystemController): Router {
  const router = Router();

  router.get("/", (req, res) => {
    if (req.accepts("json") && !req.accepts("html")) {
      res.json(controller.getRoot());
      return;
    }

    res.type("html").send(controller.renderLandingPage());
  });

  router.get("/health", (_req, res) => {
    res.json(controller.getHealth());
  });

  return router;
}
