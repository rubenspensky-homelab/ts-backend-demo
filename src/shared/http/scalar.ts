import type { RequestHandler } from "express";
import type { DocsConfig } from "../config/types";
import type { OpenApiDocument } from "./openapi";

type ScalarDocsConfig = {
  serviceName: string;
  docs: DocsConfig;
};

export function createScalarDocsHandler(config: ScalarDocsConfig, openApiDocument: OpenApiDocument): RequestHandler {
  let scalarHandler: RequestHandler | undefined;

  return async (req, res, next) => {
    try {
      if (!scalarHandler) {
        const { apiReference } = await import("@scalar/express-api-reference");
        scalarHandler = apiReference({
          pageTitle: `${config.serviceName} API Docs`,
          content: openApiDocument,
          theme: "default",
          layout: "modern",
          oauth2RedirectUri: config.docs.oauthRedirectUri,
          authentication: {
            preferredSecurityScheme: "oauth2",
            securitySchemes: {
              oauth2: {
                flows: {
                  authorizationCode: {
                    "x-scalar-client-id": config.docs.oauthClientId,
                    "x-scalar-redirect-uri": config.docs.oauthRedirectUri,
                    "x-scalar-security-query": {
                      client_id: config.docs.oauthClientId,
                      response_type: "code",
                    },
                    "x-usePkce": "SHA-256",
                    selectedScopes: ["openid", "email", "profile"],
                  },
                },
              },
            },
          },
          persistAuth: false,
          telemetry: false,
        }) as unknown as RequestHandler;
      }

      scalarHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
