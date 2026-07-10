import { config } from "../../config/service-config";
import { StdoutJsonTransport, type LogTransport } from "./transport";
import type { LogContext, Logger, LogLevel } from "./types";

type LoggerOptions = {
  service: string;
  version: string;
  environment: string;
  transport?: LogTransport;
};

export class JsonLogger implements Logger {
  private transport: LogTransport;

  constructor(private readonly options: LoggerOptions) {
    this.transport = options.transport ?? new StdoutJsonTransport();
  }

  setTransport(transport: LogTransport): void {
    this.transport = transport;
  }

  debug(message: string, context: LogContext = {}): void {
    this.write("debug", message, context);
  }

  info(message: string, context: LogContext = {}): void {
    this.write("info", message, context);
  }

  warn(message: string, context: LogContext = {}): void {
    this.write("warn", message, context);
  }

  error(message: string, context: LogContext = {}): void {
    this.write("error", message, context);
  }

  event(message: string, context: LogContext & { event: NonNullable<LogContext["event"]> }): void {
    this.write("info", message, context);
  }

  private write(level: LogLevel, message: string, context: LogContext): void {
    this.transport.write({
      timestamp: new Date().toISOString(),
      level,
      service: this.options.service,
      version: this.options.version,
      environment: this.options.environment,
      requestId: context.requestId,
      message,
      http: context.http,
      event: context.event,
      user: context.user,
      error: context.error,
    });
  }
}

export const logger = new JsonLogger({
  service: config.serviceName,
  version: config.version,
  environment: config.environment,
});

export function setLoggerTransport(transport: LogTransport): void {
  logger.setTransport(transport);
}
