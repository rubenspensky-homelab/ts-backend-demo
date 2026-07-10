import type { RequestHandler } from "express";
import type { OpenApiDocument } from "../../../shared/http/openapi";

export class DocsController {
  constructor(
    private readonly openApiDocument: OpenApiDocument,
    private readonly scalarDocsHandler: RequestHandler,
    private readonly docsOAuthAuthorizeRedirectHandler: RequestHandler,
  ) {}

  getOpenApiDocument(): OpenApiDocument {
    return this.openApiDocument;
  }

  getScalarDocsHandler(): RequestHandler {
    return this.scalarDocsHandler;
  }

  getOAuthAuthorizeRedirectHandler(): RequestHandler {
    return this.docsOAuthAuthorizeRedirectHandler;
  }
}
