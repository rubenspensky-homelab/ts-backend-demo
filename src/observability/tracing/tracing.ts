import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { config } from "../../config/config";

let sdk: NodeSDK | undefined;

export function startTracing(): void {
  if (!config.tracingEnabled || sdk) {
    return;
  }

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
}

export async function shutdownTracing(): Promise<void> {
  if (!sdk) {
    return;
  }

  await sdk.shutdown();
  sdk = undefined;
}
