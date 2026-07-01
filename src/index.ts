import { app } from "./app";
import { config } from "./config/config";
import { logger } from "./logging/logger";

app.listen(config.port, () => {
  logger.info("Server started", {
    event: {
      event: "server.started",
      entity: "server",
    },
  });
});
