import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";

type RequestValidationSchema = {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
};

export function validateRequest(schema: RequestValidationSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const validations = [
      { key: "params", value: req.params, validator: schema.params },
      { key: "query", value: req.query, validator: schema.query },
      { key: "body", value: req.body, validator: schema.body },
    ] as const;

    for (const validation of validations) {
      if (!validation.validator) {
        continue;
      }

      const result = validation.validator.safeParse(validation.value);

      if (!result.success) {
        res.status(400).json({
          error: "Bad Request",
          message: "Request validation failed",
          issues: result.error.issues.map((issue) => ({
            path: [validation.key, ...issue.path].join("."),
            message: issue.message,
          })),
        });
        return;
      }

      req[validation.key] = result.data;
    }

    next();
  };
}
