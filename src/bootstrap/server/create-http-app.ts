import cors from "cors";
import express, { type Application } from "express";
import type { AuthenticationProvider } from "../../shared/auth/authentication-provider";
import { requestContextMiddleware } from "../../shared/auth/request-context/request-context.middleware";
import type { AppConfig } from "../../shared/config/types";
import type { Logger } from "../../shared/observability/logging/types";
import { createHttpMetricsMiddleware } from "../../shared/observability/metrics/http-metrics.middleware";
import type { HttpMetricsRecorder, MetricsRegistry } from "../../shared/observability/metrics/metrics.types";
import { createErrorHandler } from "../../infrastructure/http/middleware/error-handler.middleware";
import { createRequestLoggingMiddleware } from "../../infrastructure/http/middleware/request-logging.middleware";
import type { AuthController } from "../../infrastructure/http/controllers/auth.controller";
import type { DemoController } from "../../infrastructure/http/controllers/demo.controller";
import type { DocsController } from "../../infrastructure/http/controllers/docs.controller";
import type { SystemController } from "../../infrastructure/http/controllers/system.controller";
import { createAuthRoutes } from "../../infrastructure/http/routes/auth.routes";
import { createDemoRoutes } from "../../infrastructure/http/routes/demo.routes";
import { createDocsRoutes } from "../../infrastructure/http/routes/docs.routes";
import { createSystemRoutes } from "../../infrastructure/http/routes/system.routes";

type CreateHttpAppOptions = {
  config: AppConfig;
  logger: Logger;
  authenticationProvider: AuthenticationProvider;
  controllers: {
    system: SystemController;
    auth: AuthController;
    demo: DemoController;
    docs: DocsController;
  };
  metricsRegistry: MetricsRegistry;
  httpMetrics: HttpMetricsRecorder;
};

export function createHttpApp(options: CreateHttpAppOptions): Application {
  const app = express();

  if (options.config.cors.enabled) {
    app.use(
      cors({
        origin: options.config.cors.allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
        exposedHeaders: ["X-Request-Id"],
        credentials: false,
      }),
    );
  }

  app.use(express.json());

  if (options.config.metricsEnabled) {
    app.use(createHttpMetricsMiddleware(options.httpMetrics));
  }

  app.use(requestContextMiddleware);
  app.use(createRequestLoggingMiddleware(options.logger));
  app.use(createSystemRoutes(options.controllers.system));
  app.use(createDocsRoutes(options.controllers.docs));

  if (options.config.metricsEnabled) {
    app.get("/metrics", async (_req, res) => {
      res.setHeader("Content-Type", options.metricsRegistry.contentType());
      res.send(await options.metricsRegistry.getMetrics());
    });
  }

  app.use(createAuthRoutes(options.controllers.auth, options.authenticationProvider));
  app.use(createDemoRoutes(options.controllers.demo, options.authenticationProvider));
  app.use(createErrorHandler(options.logger));

  return app;
}
