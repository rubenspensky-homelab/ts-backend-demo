import { DiagLogLevel, diag } from "@opentelemetry/api";
import type { DiagLogger } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import type { Logger } from "../logging/types";

export type TracingConfig = {
  tracingEnabled: boolean;
  serviceName: string;
  version: string;
  environment: string;
  otlpTracesEndpoint: string;
};

export type StartTracingOptions = {
  config: TracingConfig;
  logger: Logger;
};

let sdk: NodeSDK | undefined;
let diagnosticsRegistered = false;
let activeLogger: Logger | undefined;

export function startTracing(options: StartTracingOptions): void {
  const { config, logger } = options;
  activeLogger = logger;

  if (!config.tracingEnabled) {
    logger.info("OpenTelemetry tracing disabled", {
      event: {
        event: "opentelemetry.tracing.disabled",
        entity: "tracing",
      },
    });

    return;
  }

  if (sdk) {
    return;
  }

  try {
    registerOpenTelemetryDiagnostics(logger);

    sdk = new NodeSDK({
      autoDetectResources: true,
      instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
      resource: resourceFromAttributes({
        "service.name": config.serviceName,
        "service.version": config.version,
        "deployment.environment.name": config.environment,
      }),
      traceExporter: new OTLPTraceExporter({
        url: config.otlpTracesEndpoint,
      }),
    });

    sdk.start();

    logger.info(`OpenTelemetry tracing registered for OTLP endpoint ${config.otlpTracesEndpoint}`, {
      event: {
        event: "opentelemetry.tracing.registered",
        entity: "tracing",
      },
    });
  } catch (error) {
    sdk = undefined;

    const registrationError = error instanceof Error ? error : new Error("Unknown OpenTelemetry registration error");

    logger.error("OpenTelemetry tracing registration failed", {
      error: {
        name: registrationError.name,
        message: registrationError.message,
        stack: registrationError.stack,
      },
    });

    throw registrationError;
  }
}

export async function shutdownTracing(): Promise<void> {
  if (!sdk) {
    return;
  }

  await sdk.shutdown();
  sdk = undefined;

  activeLogger?.info("OpenTelemetry tracing shutdown completed", {
    event: {
      event: "opentelemetry.tracing.shutdown",
      entity: "tracing",
    },
  });
}

function registerOpenTelemetryDiagnostics(logger: Logger): void {
  if (diagnosticsRegistered) {
    return;
  }

  const diagnosticLogger: DiagLogger = {
    debug(message, ...args) {
      logger.debug(formatDiagnosticMessage(message, args));
    },
    error(message, ...args) {
      logger.error(formatDiagnosticMessage(message, args), {
        error: {
          name: "OpenTelemetryDiagnosticError",
          message: formatDiagnosticMessage(message, args),
        },
      });
    },
    info(message, ...args) {
      logger.info(formatDiagnosticMessage(message, args));
    },
    verbose(message, ...args) {
      logger.debug(formatDiagnosticMessage(message, args));
    },
    warn(message, ...args) {
      logger.warn(formatDiagnosticMessage(message, args));
    },
  };

  diag.setLogger(diagnosticLogger, DiagLogLevel.ERROR);
  diagnosticsRegistered = true;
}

function formatDiagnosticMessage(message: string, args: unknown[]): string {
  if (args.length === 0) {
    return message;
  }

  return `${message} ${args.map(formatDiagnosticArg).join(" ")}`;
}

function formatDiagnosticArg(arg: unknown): string {
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}`;
  }

  if (typeof arg === "string") {
    return arg;
  }

  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}
