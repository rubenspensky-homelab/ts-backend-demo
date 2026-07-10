import { Router } from "express";
import type { DemoController } from "../controllers/demo.controller";

export function createDemoRoutes(controller: DemoController): Router {
  const router = Router();

  router.get("/demo/users/:id", async (req, res) => {
    res.json(await controller.getUser(req.params.id, req.requestContext));
  });

  router.get("/demo/error", (_req, _res) => {
    controller.getError();
  });

  return router;
}
