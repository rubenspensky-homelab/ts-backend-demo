# Agents

## Project Notes

- This is a TypeScript Node.js backend using Express.
- Keep application concerns decoupled from infrastructure implementations.
- Run `npm run check` after code changes when feasible; otherwise run `npm run lint`, `npm run build`, and `npm test`.

## Metrics

- Metrics live under `src/observability/metrics/`.
- Routes should depend on the `MetricsRegistry` interface, not directly on `prom-client`.
- HTTP metrics should be recorded through middleware, not inside route handlers or controllers.
- `prom-client` is the current implementation, but the abstraction is intended to allow replacement with OpenTelemetry metrics or another backend later.
- Do not use raw URLs as metric labels. Use Express route patterns when available, for example `/demo/users/:id`.
- Metrics require an explicit `METRICS_ENABLED=true` or `METRICS_ENABLED=false` value.
- `GET /metrics` returns Prometheus text format and sets the registry-provided `Content-Type`.
