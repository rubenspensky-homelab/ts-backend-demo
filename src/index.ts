import { config } from "./config/config";
import { logger } from "./logging/logger";
import { shutdownTracing, startTracing } from "./observability/tracing/tracing";

async function main(): Promise<void> {
  startTracing();

  const { app } = await import("./app.js");
  const server = app.listen(config.port, () => {
    logger.info("Server started", {
      event: {
        event: "server.started",
        entity: "server",
      },
    });
  });

  const shutdown = async () => {
    logger.info("Server shutting down", {
      event: {
        event: "server.shutdown",
        entity: "server",
      },
    });

    server.close(async (error?: Error) => {
      try {
        if (error) {
          logger.error("Server shutdown failed", {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          });
          process.exitCode = 1;
        }

        await shutdownTracing();
      } catch (shutdownError) {
        const tracedError = shutdownError instanceof Error ? shutdownError : new Error("Unknown tracing shutdown error");

        logger.error("Tracing shutdown failed", {
          error: {
            name: tracedError.name,
            message: tracedError.message,
            stack: tracedError.stack,
          },
        });
        process.exitCode = 1;
      } finally {
        process.exit(process.exitCode ?? 0);
      }
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch(async (error: unknown) => {
  const startupError = error instanceof Error ? error : new Error("Unknown startup error");

  logger.error("Server startup failed", {
    error: {
      name: startupError.name,
      message: startupError.message,
      stack: startupError.stack,
    },
  });

  await shutdownTracing();
  process.exit(1);
});
