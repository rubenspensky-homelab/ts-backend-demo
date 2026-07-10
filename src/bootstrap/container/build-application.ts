import type { Application } from "express";
import { createAuthenticationProvider } from "../../shared/auth/authentication-provider.factory";
import { config } from "../../shared/config/service-config";
import type { AppConfig } from "../../shared/config/types";
import { createDocsOAuthAuthorizeRedirectHandler } from "../../shared/http/oauth-redirect";
import { createOpenApiDocument } from "../../shared/http/openapi";
import { createScalarDocsHandler } from "../../shared/http/scalar";
import { logger } from "../../shared/observability/logging/logger";
import type { Logger } from "../../shared/observability/logging/types";
import { httpMetrics, metricsRegistry } from "../../shared/observability/metrics/metrics.registry";
import type { HttpMetricsRecorder, MetricsRegistry } from "../../shared/observability/metrics/metrics.types";
import { GetDemoUserUseCase } from "../../application/use-cases/get-demo-user.use-case";
import type { DemoUserRepository } from "../../application/ports/demo-user.repository";
import { InMemoryDemoUserRepository } from "../../infrastructure/persistence/repositories/in-memory-demo-user.repository";
import { SystemController } from "../../infrastructure/http/controllers/system.controller";
import { AuthController } from "../../infrastructure/http/controllers/auth.controller";
import { DemoController } from "../../infrastructure/http/controllers/demo.controller";
import { DocsController } from "../../infrastructure/http/controllers/docs.controller";
import { createHttpApp } from "../server/create-http-app";

export type ApplicationDependencies = {
  config: AppConfig;
  logger: Logger;
  demoUserRepository: DemoUserRepository;
  metricsRegistry: MetricsRegistry;
  httpMetrics: HttpMetricsRecorder;
};

export function createDependencies(overrides: Partial<ApplicationDependencies> = {}): ApplicationDependencies {
  return {
    config: overrides.config ?? config,
    logger: overrides.logger ?? logger,
    demoUserRepository: overrides.demoUserRepository ?? new InMemoryDemoUserRepository(),
    metricsRegistry: overrides.metricsRegistry ?? metricsRegistry,
    httpMetrics: overrides.httpMetrics ?? httpMetrics,
  };
}

export function buildApplication(overrides: Partial<ApplicationDependencies> = {}): {
  app: Application;
  dependencies: ApplicationDependencies;
} {
  const dependencies = createDependencies(overrides);
  const authenticationProvider = createAuthenticationProvider(dependencies.config.auth);
  const openApiDocument = createOpenApiDocument(dependencies.config);
  const docsOAuthAuthorizeRedirectHandler = createDocsOAuthAuthorizeRedirectHandler(dependencies.config.docs);
  const scalarDocsHandler = createScalarDocsHandler(dependencies.config, openApiDocument);
  const getDemoUserUseCase = new GetDemoUserUseCase(dependencies.demoUserRepository);

  const controllers = {
    system: new SystemController(dependencies.config),
    auth: new AuthController(),
    demo: new DemoController(getDemoUserUseCase, dependencies.logger),
    docs: new DocsController(openApiDocument, scalarDocsHandler, docsOAuthAuthorizeRedirectHandler),
  };

  return {
    app: createHttpApp({
      config: dependencies.config,
      logger: dependencies.logger,
      authenticationProvider,
      controllers,
      metricsRegistry: dependencies.metricsRegistry,
      httpMetrics: dependencies.httpMetrics,
    }),
    dependencies,
  };
}
