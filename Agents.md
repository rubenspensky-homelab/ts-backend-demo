# Agents

## Project Notes

- This is a TypeScript Node.js backend using Express.
- Keep application concerns decoupled from infrastructure implementations.
- Run `npm run build` and `npm test` after code changes.

## Metrics

- Metrics live under `src/observability/metrics/`.
- Routes should depend on the `MetricsRegistry` interface, not directly on `prom-client`.
- HTTP metrics should be recorded through middleware, not inside route handlers or controllers.
- `prom-client` is the current implementation, but the abstraction is intended to allow replacement with OpenTelemetry metrics or another backend later.
- Do not use raw URLs as metric labels. Use Express route patterns when available, for example `/demo/users/:id`.
- Metrics are enabled by default and can be disabled with `METRICS_ENABLED=false`.
- `GET /metrics` returns Prometheus text format and sets the registry-provided `Content-Type`.
