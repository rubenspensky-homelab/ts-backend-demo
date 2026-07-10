import type { AppConfig } from "../config/types";

export type OpenApiDocument = {
  openapi: "3.1.0";
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
  paths: Record<string, Record<string, unknown>>;
  components: {
    securitySchemes: Record<string, unknown>;
    responses: Record<string, unknown>;
    schemas: Record<string, unknown>;
  };
};

export function createOpenApiDocument(config: AppConfig): OpenApiDocument {
  return {
    openapi: "3.1.0",
    info: {
      title: config.serviceName,
      version: config.version,
      description: config.serviceDescription,
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Local development server",
      },
    ],
    tags: [
      { name: "System", description: "Health and operational endpoints" },
      { name: "Authentication", description: "Protected authentication test endpoints" },
      { name: "Demo", description: "Demo application endpoints" },
    ],
    paths: {
      "/": {
        get: {
          tags: ["System"],
          summary: "Service root endpoint",
          operationId: "getRoot",
          responses: {
            "200": {
              description: "Service metadata",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RootResponse" },
                },
              },
            },
          },
        },
      },
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" },
                },
              },
            },
          },
        },
      },
      "/me": {
        get: {
          tags: ["Authentication"],
          summary: "Get the authenticated user",
          operationId: "getMe",
          security: [{ oauth2: ["openid", "email", "profile"] }],
          responses: {
            "200": {
              description: "Authenticated user",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthenticatedUser" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/auth/test": {
        get: {
          tags: ["Authentication"],
          summary: "Test OAuth authentication",
          operationId: "testAuthentication",
          security: [{ oauth2: ["openid", "email", "profile"] }],
          responses: {
            "200": {
              description: "Authentication succeeded",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthTestResponse" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
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
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          description: "Authentik OAuth2 authorization-code flow with PKCE.",
          flows: {
            authorizationCode: {
              authorizationUrl: config.docs.oauthAuthorizationUrl,
              tokenUrl: config.docs.oauthTokenUrl,
              scopes: {
                openid: "OpenID Connect",
                email: "Email address",
                profile: "User profile",
              },
              "x-scalar-client-id": config.docs.oauthClientId,
              "x-scalar-redirect-uri": config.docs.oauthRedirectUri,
              "x-scalar-security-query": {
                client_id: config.docs.oauthClientId,
                response_type: "code",
              },
              "x-usePkce": "SHA-256",
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Missing or invalid access token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnauthorizedResponse" },
            },
          },
        },
      },
      schemas: {
        RootResponse: {
          type: "object",
          required: ["service", "message", "status", "documentation", "health"],
          properties: {
            service: { type: "string" },
            message: { type: "string" },
            status: { type: "string", const: "running" },
            documentation: { type: "string", const: "/docs" },
            health: { type: "string", const: "/health" },
          },
        },
        HealthResponse: {
          type: "object",
          required: ["status", "service", "timestamp"],
          properties: {
            status: { type: "string", const: "ok" },
            service: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        AuthenticatedUser: {
          type: "object",
          required: ["id", "email", "name", "groups"],
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            groups: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        AuthTestResponse: {
          type: "object",
          required: ["authenticated", "user"],
          properties: {
            authenticated: { type: "boolean", const: true },
            user: { $ref: "#/components/schemas/AuthenticatedUser" },
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
        ErrorResponse: {
          type: "object",
          required: ["error", "requestId"],
          properties: {
            error: { type: "string" },
            requestId: { type: "string" },
          },
        },
        UnauthorizedResponse: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string", const: "Unauthorized" },
            message: { type: "string" },
          },
        },
      },
    },
  };
}
