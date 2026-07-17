import type { ConfigSource } from "./types";
import { ConfigError } from "./validation/config.errors";

export function readRequiredString(source: ConfigSource, key: string): string {
  const value = source.get(key);

  if (!value || value.trim() === "") {
    throw new ConfigError(`${key} is required`);
  }

  return value.trim();
}

export function readRequiredStringList(source: ConfigSource, key: string): string[] {
  return readRequiredString(source, key)
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

export function readPort(source: ConfigSource, key: string): number {
  const rawPort = readRequiredString(source, key);
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(`${key} must be an integer between 1 and 65535`);
  }

  return port;
}

export function readBoolean(source: ConfigSource, key: string): boolean {
  const value = readRequiredString(source, key).toLowerCase();

  if (value !== "true" && value !== "false") {
    throw new ConfigError(`${key} must be either true or false`);
  }

  return value === "true";
}
