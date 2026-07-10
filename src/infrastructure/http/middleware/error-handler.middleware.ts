import type { NextFunction, Request, Response } from "express";
import type { Logger } from "../../../shared/observability/logging/types";

export function createErrorHandler(logger: Logger) {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const error = err instanceof Error ? err : new Error("Unknown error");

    logger.error("Unhandled request error", {
      requestId: req.requestContext?.requestId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context: {
          method: req.method,
          path: req.path,
        },
      },
    });

    res.status(500).json({
      error: "Internal Server Error",
      requestId: req.requestContext?.requestId,
    });
  };
}
