import { EnvConfigSource } from "./sources";
import type { AppConfig, ConfigSource } from "./types";

const DEFAULT_PORT = 3000;
const DEFAULT_SERVICE_NAME = "act-backend-demo";
const DEFAULT_VERSION = "1.0.0";
const DEFAULT_ENVIRONMENT = "development";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function loadConfig(source: ConfigSource): AppConfig {
  return {
    port: readPort(source),
    serviceName: readString(source, "SERVICE_NAME", DEFAULT_SERVICE_NAME),
    version: readString(source, "npm_package_version", DEFAULT_VERSION),
    environment: readString(source, "NODE_ENV", DEFAULT_ENVIRONMENT),
    metricsEnabled: readBoolean(source, "METRICS_ENABLED", true),
  };
}

function readString(source: ConfigSource, key: string, fallback: string): string {
  const value = source.get(key);
  return value && value.trim() !== "" ? value : fallback;
}

function readPort(source: ConfigSource): number {
  const rawPort = source.get("PORT");

  if (!rawPort || rawPort.trim() === "") {
    return DEFAULT_PORT;
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError("PORT must be an integer between 1 and 65535");
  }

  return port;
}

function readBoolean(source: ConfigSource, key: string, fallback: boolean): boolean {
  const value = source.get(key);

  if (!value || value.trim() === "") {
    return fallback;
  }

  return value.trim().toLowerCase() !== "false";
}

export const config = loadConfig(new EnvConfigSource());
