export type LogLevel = "debug" | "info" | "warn" | "error";

export type HttpLogContext = {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  clientIp?: string;
};

export type EventLogContext = {
  event: string;
  entity?: string;
  entityId?: string;
};

export type UserLogContext = {
  id?: string;
  [key: string]: unknown;
};

export type ErrorLogContext = {
  name: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
};

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  service: string;
  version: string;
  environment: string;
  requestId?: string;
  message: string;
  http?: HttpLogContext;
  event?: EventLogContext;
  user?: UserLogContext;
  error?: ErrorLogContext;
};

export type LogContext = Partial<Pick<LogEntry, "requestId" | "http" | "event" | "user" | "error">>;

export type Logger = {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  event(message: string, context: LogContext & { event: EventLogContext }): void;
};
