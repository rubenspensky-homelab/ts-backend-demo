import type { RequestHandler } from "express";
import type { HttpMetricsRecorder } from "./metrics.types";

export function createHttpMetricsMiddleware(metrics: HttpMetricsRecorder): RequestHandler {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
      if (req.path === "/metrics") {
        return;
      }

      const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;

      metrics.recordHttpRequest(
        {
          method: req.method,
          route: getRouteLabel(req),
          statusCode: res.statusCode,
        },
        durationSeconds,
      );
    });

    next();
  };
}

function getRouteLabel(req: Parameters<RequestHandler>[0]): string {
  const routePath = req.route?.path;

  if (typeof routePath === "string") {
    return `${req.baseUrl}${routePath}`;
  }

  return req.route ? "unknown" : "not_found";
}
