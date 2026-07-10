# AGENTS.md

## Commands

- Install with `npm ci`; this repo uses `package-lock.json` and has no alternate package manager config.
- Run all tests with `npm test` (`vitest run`). Run a focused test with `npx vitest run test/<file>.test.ts`.
- Run type/build verification with `npm run build`; `tsconfig.json` emits compiled files to `dist/` and excludes `test/`.
- There is no configured lint or formatter script in `package.json`.
- `npm start` runs `node --env-file=.env dist/index.js`, so build first when testing the production start path.

## Runtime Shape

- `src/index.ts` is the process entrypoint. It starts tracing before dynamically importing `./main.js`; keep that ordering so OpenTelemetry auto-instrumentation can patch HTTP/Express.
- `src/main.ts` builds the application through the bootstrap container and exports the app and resolved dependencies.
- `src/app.ts` re-exports the Express app for tests. Tests import this app directly rather than starting a listener.
- The codebase now follows a lightweight hexagonal/clean structure: `domain/`, `application/`, `infrastructure/`, `shared/`, and `bootstrap/`.
- The package is `type: commonjs`, but TypeScript uses `module`/`moduleResolution: nodenext`; source imports that target runtime JS may use `.js` specifiers.

## Config And Observability

- Config comes from `process.env` through `src/shared/config/service-config.ts`; defaults include `PORT=3000`, `SERVICE_NAME=base-microservice`, metrics enabled, tracing enabled, and OTLP HTTP traces endpoint `http://localhost:4318/v1/traces`.
- Auth config is selected once at startup through `src/shared/auth/authentication-provider.factory.ts`; avoid adding provider conditionals in routes or middleware.
- Default auth provider is OIDC with the local Authentik issuer/JWKS/audience. Set `AUTH_PROVIDER=mock` plus all `MOCK_USER_*` vars for local fake auth; mock auth is rejected when `NODE_ENV=production`.
- Boolean env flags are only disabled by the string `false` ignoring case; empty or any other value enables the feature.
- `GET /` serves a landing page for browsers and returns JSON metadata when the client requests `application/json`.
- `GET /health` returns service status, service name, and a timestamp.
- `/metrics` only exists when `METRICS_ENABLED` is not `false`. Metrics route labels should use Express route patterns such as `/demo/users/:id`, not raw URLs.
- Local runs without an OTLP HTTP receiver should set `TRACING_ENABLED=false`; the default endpoint is HTTP `/v1/traces`, not OTLP gRPC.
- Docker expects prebuilt `dist/`: the `Dockerfile` copies `dist` and installs production deps only. It exposes `8080`, but the app still listens on `PORT` (default `3000`) unless set.

## Testing Notes

- Tests live under `test/` and use Vitest plus Supertest.
- When tests assert logs, use `setLoggerTransport` from `src/shared/observability/logging/logger.ts` to capture or silence global logger output.
- The shared Prometheus registry is module-level state in `src/shared/observability/metrics/metrics.registry.ts`; metrics tests can accumulate observations across requests in the same process.
