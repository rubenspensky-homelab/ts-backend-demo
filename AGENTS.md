# AGENTS.md

## Commands

- Install with `npm ci`; this repo uses `package-lock.json` and has no alternate package manager config.
- Run all tests with `npm test` (`vitest run`). Run coverage with `npm run coverage`. Run a focused test with `npx vitest run test/<file>.test.ts`.
- Run type/build verification with `npm run build`; `tsconfig.json` emits compiled files to `dist/` and excludes `test/`.
- Run linting with `npm run lint`; run formatting checks with `npm run format:check`; run full verification with `npm run check`.
- Start a watch-mode development server with `npm run dev`.
- `npm start` runs `node --env-file=.env dist/index.js`, so build first when testing the production start path.

## Runtime Shape

- `src/index.ts` is the process entrypoint. It starts tracing before dynamically importing `./main.js`; keep that ordering so OpenTelemetry auto-instrumentation can patch HTTP/Express.
- `src/main.ts` builds the application through the bootstrap container and exports the app and resolved dependencies.
- `src/app.ts` re-exports the Express app for tests. Tests import this app directly rather than starting a listener.
- The codebase now follows a lightweight hexagonal/clean structure: `domain/`, `application/`, `infrastructure/`, `shared/`, and `bootstrap/`.
- The package is `type: commonjs`, but TypeScript uses `module`/`moduleResolution: nodenext`; source imports that target runtime JS may use `.js` specifiers.

## Config And Observability

- Config comes from `process.env` through `src/shared/config/service-config.ts`; all config values are explicit and missing or empty required values fail startup.
- Auth config is selected once at startup through `src/shared/auth/authentication-provider.factory.ts`; avoid adding provider conditionals in routes or middleware.
- Auth provider must be selected explicitly with `AUTH_PROVIDER=oidc` or `AUTH_PROVIDER=mock`. Set all required OIDC vars for OIDC auth, or all `MOCK_USER_*` vars for local fake auth; mock auth is rejected when `NODE_ENV=production`.
- Boolean env flags must be explicit `true` or `false` values.
- `GET /` serves a landing page for browsers and returns JSON metadata when the client requests `application/json`.
- `GET /health` returns service status, service name, and a timestamp.
- `GET /ready` returns readiness status, service name, dependency checks, and a timestamp.
- `/metrics` only exists when `METRICS_ENABLED=true`. Metrics route labels should use Express route patterns such as `/demo/users/:id`, not raw URLs.
- Local runs without an OTLP HTTP receiver should set `TRACING_ENABLED=false`; when tracing is enabled, `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` must be explicit and should use HTTP `/v1/traces`, not OTLP gRPC.
- Docker expects prebuilt `dist/`: the `Dockerfile` copies `dist` and installs production deps only. It exposes `8080`, but the app listens on the explicit `PORT` value.

## Testing Notes

- Tests live under `test/` and use Vitest plus Supertest.
- When tests assert logs, use `setLoggerTransport` from `src/shared/observability/logging/logger.ts` to capture or silence global logger output.
- The shared Prometheus registry is module-level state in `src/shared/observability/metrics/metrics.registry.ts`; metrics tests can accumulate observations across requests in the same process.
