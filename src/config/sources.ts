import type { ConfigSource } from "./types";

export class EnvConfigSource implements ConfigSource {
  get(key: string): string | undefined {
    return process.env[key];
  }
}

export class CompositeConfigSource implements ConfigSource {
  constructor(private readonly sources: ConfigSource[]) {}

  get(key: string): string | undefined {
    for (const source of this.sources) {
      const value = source.get(key);

      if (value !== undefined && value.trim() !== "") {
        return value;
      }
    }

    return undefined;
  }
}
