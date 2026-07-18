import type { AppConfig } from "../../../shared/config/types";
import { createBaseOpenApiDocument, type OpenApiDocument } from "../../../shared/http/openapi";

export function createOpenApiDocument(config: AppConfig): OpenApiDocument {
  const document = createBaseOpenApiDocument(config);

  return {
    ...document,
    tags: [...document.tags, { name: "Demo", description: "Demo application endpoints" }],
    paths: {
      ...document.paths,
      "/demo/users/{id}": {
        get: {
          tags: ["Demo"],
          summary: "Get a demo user",
          operationId: "getDemoUser",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", minLength: 1, maxLength: 64, pattern: "^[A-Za-z0-9_-]+$" },
            },
          ],
          responses: {
            "200": {
              description: "Demo user",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DemoUserResponse" },
                },
              },
            },
            "400": { $ref: "#/components/responses/BadRequest" },
          },
        },
      },
      "/demo/protected/users/{id}": {
        get: {
          tags: ["Demo"],
          summary: "Get a protected demo user",
          operationId: "getProtectedDemoUser",
          security: [{ oauth2: ["openid", "email", "profile"] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", minLength: 1, maxLength: 64, pattern: "^[A-Za-z0-9_-]+$" },
            },
          ],
          responses: {
            "200": {
              description: "Demo user",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DemoUserResponse" },
                },
              },
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/demo/error": {
        get: {
          tags: ["Demo"],
          summary: "Trigger a demo error",
          operationId: "getDemoError",
          responses: {
            "500": {
              description: "Demo error response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      ...document.components,
      responses: {
        ...document.components.responses,
        BadRequest: {
          description: "Request validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BadRequestResponse" },
            },
          },
        },
      },
      schemas: {
        ...document.components.schemas,
        BadRequestResponse: {
          type: "object",
          required: ["error", "message", "issues"],
          properties: {
            error: { type: "string", const: "Bad Request" },
            message: { type: "string" },
            issues: {
              type: "array",
              items: {
                type: "object",
                required: ["path", "message"],
                properties: {
                  path: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        DemoUserResponse: {
          type: "object",
          required: ["user"],
          properties: {
            user: {
              type: "object",
              required: ["id", "name"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
      },
    },
  };
}
