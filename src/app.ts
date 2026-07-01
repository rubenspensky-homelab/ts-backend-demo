import express from "express";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "./logging/logger";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const forwardedRequestId = req.header("x-request-id");
  req.requestId = forwardedRequestId && forwardedRequestId.trim() !== "" ? forwardedRequestId : randomUUID();
  res.setHeader("x-request-id", req.requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const route = req.route?.path ? String(req.route.path) : req.path;

    logger.info("HTTP request completed", {
      requestId: req.requestId,
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
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/demo/users/:id", (req, res) => {
  const user = { id: req.params.id, name: "Demo User" };

  logger.event("Demo user fetched", {
    requestId: req.requestId,
    event: {
      event: "demo.user.fetched",
      entity: "user",
      entityId: user.id,
    },
    user: { id: user.id },
  });

  res.json({ user });
});

app.get("/demo/error", () => {
  throw new Error("Demo error for structured logging");
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const error = err instanceof Error ? err : new Error("Unknown error");

  logger.error("Unhandled request error", {
    requestId: req.requestId,
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
    requestId: req.requestId,
  });
});
