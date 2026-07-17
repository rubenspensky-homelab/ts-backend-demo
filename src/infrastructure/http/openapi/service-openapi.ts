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
              schema: { type: "string" },
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
      schemas: {
        ...document.components.schemas,
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
