# Base Microservice Template

Production-oriented TypeScript backend template for future microservices.

It keeps the current Express, Scalar, OpenTelemetry, Prometheus, and JOSE stack, but reorganizes the codebase around Hexagonal Architecture and Clean Architecture principles.

## Why this exists

Use this repository as the starting point for new backend services when you want:

- a reusable technical foundation
- thin HTTP controllers
- application use cases behind ports
- infrastructure isolated from business logic
- shared auth, config, logging, tracing, metrics, and docs setup

## Architecture overview

### Layers

- `domain/`: business entities and pure domain concepts
- `application/`: use cases, DTOs, mappers, and ports
- `infrastructure/`: HTTP adapters and persistence implementations
- `shared/`: reusable technical infrastructure only
- `bootstrap/`: composition root and dependency wiring

### Dependency direction

- `domain` depends on nothing external
- `application` depends on domain and ports
- `infrastructure` implements ports
- `bootstrap` wires concrete dependencies
- `shared` contains reusable cross-cutting technical concerns

## Folder structure

```text
src/
├── application/
│   ├── dto/
│   ├── mappers/
│   ├── ports/
│   └── use-cases/
├── bootstrap/
│   ├── container/
│   └── server/
├── domain/
│   └── entities/
├── infrastructure/
│   ├── http/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   └── persistence/
│       └── repositories/
├── shared/
│   ├── auth/
│   ├── config/
│   ├── http/
│   ├── observability/
│   └── types/
├── app.ts
├── index.ts
└── main.ts
```

## Endpoints

- `GET /` landing page for browsers, with links to docs and health
- `GET /` with `Accept: application/json` returns service metadata
- `GET /health` health check
- `GET /ready` readiness check
- `GET /docs` Scalar API docs
- `GET /openapi.json` OpenAPI document
- `GET /metrics` Prometheus metrics when enabled
- `GET /me` authenticated user
- `GET /auth/test` auth verification
- `GET /demo/users/:id` demo use case
- `GET /demo/protected/users/:id` authenticated demo use case
- `GET /demo/error` demo error handling

## Installation

```sh
npm ci
```

## Development

Start a watch-mode development server:

```sh
npm run dev
```

Build:

```sh
npm run build
```

Start compiled app:

```sh
npm start
```

Run tests:

```sh
npm test
```

Run tests with coverage:

```sh
npm run coverage
```

Run linting and formatting checks:

```sh
npm run lint
npm run format:check
```

Run the full verification suite:

```sh
npm run check
```

## Environment variables

All configuration values are explicit. Missing or empty required values fail application startup.

### Core

- `PORT`
- `SERVICE_NAME`
- `SERVICE_DESCRIPTION`
- `SERVICE_VERSION`
- `NODE_ENV`
- `PUBLIC_BASE_URLS` comma-separated public service URLs for OpenAPI/Scalar servers. Entries may be `url` or `url|description`.

### Observability

- `METRICS_ENABLED` `true` or `false`
- `TRACING_ENABLED` `true` or `false`
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

### Authentication

- `AUTH_PROVIDER` `oidc` or `mock`
- `AUTH_ISSUER` required when `AUTH_PROVIDER=oidc`
- `AUTH_JWKS_URL` required when `AUTH_PROVIDER=oidc`
- `AUTH_AUDIENCE` required when `AUTH_PROVIDER=oidc`
- `MOCK_USER_ID` required when `AUTH_PROVIDER=mock`
- `MOCK_USER_EMAIL` required when `AUTH_PROVIDER=mock`
- `MOCK_USER_NAME` required when `AUTH_PROVIDER=mock`
- `MOCK_USER_GROUPS` required when `AUTH_PROVIDER=mock`

### Docs / OAuth

- `DOCS_OAUTH_CLIENT_ID`
- `DOCS_OAUTH_AUTHORIZATION_URL`
- `DOCS_OAUTH_UPSTREAM_AUTHORIZATION_URL`
- `DOCS_OAUTH_TOKEN_URL`
- `DOCS_OAUTH_REDIRECT_URI`

These docs OAuth values are required because `/docs` is always mounted.

Example with internal and external Scalar server targets:

```env
PUBLIC_BASE_URLS=http://ts-backend-demo.home.lab:3000|Internal,https://api.example.com|External
```

## Documentation and health URLs

- Landing page: `http://localhost:3000/`
- Docs: `http://localhost:3000/docs`
- OpenAPI: `http://localhost:3000/openapi.json`
- Health: `http://localhost:3000/health`
- Readiness: `http://localhost:3000/ready`

## What belongs in `shared`

Reusable technical infrastructure only:

- authentication middleware
- authentication providers and token validation
- request context and correlation IDs
- logging
- tracing
- metrics
- config loading and validation
- OpenAPI and Scalar setup
- Express type augmentation

## What should remain service-specific

- entities
- business rules
- use cases
- DTOs tied to business flows
- controllers for service endpoints
- repository implementations for service data
- authorization rules beyond authentication
- service-specific integrations

## How to create a new microservice from this template

1. Keep `shared/` and `bootstrap/` as the technical foundation.
2. Replace the demo domain, use case, controller, and repository.
3. Add new ports in `application/ports`.
4. Implement adapters in `infrastructure/`.
5. Wire dependencies in `bootstrap/container`.
6. Update OpenAPI docs and README.

## Testing

The repository includes tests for:

- landing page and root JSON response
- health endpoint
- readiness endpoint
- auth behavior
- docs exposure
- metrics exposure
- config validation
- one representative use case
- error handling
- dependency injection wiring

Coverage is enforced with Vitest V8 thresholds and reports to `coverage/`.

## Notes

- `src/index.ts` remains the process entrypoint so tracing starts before the Express app is imported.
