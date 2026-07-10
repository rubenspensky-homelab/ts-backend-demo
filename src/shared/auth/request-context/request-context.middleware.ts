import { randomUUID } from "node:crypto";
import { context, trace } from "@opentelemetry/api";
import type { RequestHandler } from "express";

export const requestContextMiddleware: RequestHandler = (req, res, next) => {
  const forwardedRequestId = req.header("x-request-id");
  const traceId = trace.getSpan(context.active())?.spanContext().traceId;

  req.requestContext = {
    requestId: forwardedRequestId && forwardedRequestId.trim() !== "" ? forwardedRequestId : randomUUID(),
    traceId,
  };

  res.setHeader("x-request-id", req.requestContext.requestId);
  next();
};
