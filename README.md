# TypeScript Backend Demo

Small TypeScript Node.js backend using Express.

## Scripts

- `npm run build` compiles TypeScript.
- `npm test` runs the Vitest test suite.
- `npm start` starts the compiled app from `dist/index.js`.

## Configuration

Environment variables:

- `PORT`: HTTP port. Defaults to `3000`.
- `SERVICE_NAME`: Service name used in logs. Defaults to `act-backend-demo`.
- `NODE_ENV`: Runtime environment. Defaults to `development`.
- `METRICS_ENABLED`: Enables the `/metrics` endpoint unless explicitly set to `false`.
- `TRACING_ENABLED`: Enables OpenTelemetry tracing unless explicitly set to `false`.
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`: OTLP HTTP traces endpoint. Defaults to `http://localhost:4318/v1/traces`.
- `OTEL_EXPORTER_OTLP_HEADERS`: Optional OTLP headers, formatted as comma-separated `key=value` pairs.
- `OTEL_EXPORTER_OTLP_TRACES_HEADERS`: Optional trace-specific OTLP headers, formatted as comma-separated `key=value` pairs.

## Health Check

`GET /health` returns:

```json
{ "status": "ok" }
```

## Metrics

`GET /metrics` exposes Prometheus-compatible metrics when `METRICS_ENABLED` is not `false`.

The endpoint returns Prometheus text format with the correct `Content-Type` for scraping.

Included metrics:

- Default Node.js and process metrics from `prom-client`.
- `http_requests_total` with `method`, `route`, and `status_code` labels.
- `http_request_duration_seconds` histogram with `method`, `route`, and `status_code` labels.

Route labels use Express route patterns when available, such as `/demo/users/:id`, and do not use raw URLs.

Example Prometheus scrape config:

```yaml
scrape_configs:
  - job_name: act-backend-demo
    static_configs:
      - targets: ["localhost:3000"]
```

## Tracing

Tracing is initialized before the Express application is loaded so OpenTelemetry automatic instrumentation can capture HTTP and Express spans.

Traces are exported only through OTLP over HTTP. Configure the OTLP destination with environment variables; the application does not contain backend-specific tracing configuration.
