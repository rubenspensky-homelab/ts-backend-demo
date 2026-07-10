import type { RequestHandler } from "express";
import type { Logger } from "../../../shared/observability/logging/types";

export function createRequestLoggingMiddleware(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const route = req.route?.path ? String(req.route.path) : req.path;

      logger.info("HTTP request completed", {
        requestId: req.requestContext.requestId,
        http: {
          method: req.method,
          route,
          statusCode: res.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
          clientIp: req.ip,
        },
      });
    });

    next();
  };
}
