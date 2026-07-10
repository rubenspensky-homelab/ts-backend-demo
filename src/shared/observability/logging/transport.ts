import type { LogEntry } from "./types";

export type LogTransport = {
  write(entry: LogEntry): void;
};

export class StdoutJsonTransport implements LogTransport {
  write(entry: LogEntry): void {
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  }
}
