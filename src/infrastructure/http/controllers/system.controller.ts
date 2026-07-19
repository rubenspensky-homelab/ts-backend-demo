import type { AppConfig } from "../../../shared/config/types";

export class SystemController {
  constructor(private readonly config: AppConfig) {}

  getRoot() {
    return {
      service: this.config.serviceName,
      message: this.config.serviceDescription,
      status: "running" as const,
      documentation: "/docs",
      health: "/health",
    };
  }

  renderLandingPage(): string {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.config.serviceName}</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        background: #000;
        color: #fff;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        background: #000;
        color: #fff;
      }
      main {
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
        padding: 32px 0;
      }
      a {
        color: inherit;
        text-decoration: none;
      }
      .shell {
        border: 2px solid #d4d4d4;
        background: #050505;
      }
      .topbar {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 16px;
        border-bottom: 1px solid #737373;
        color: #d4d4d4;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
        gap: 1px;
        background: #737373;
      }
      .panel {
        background: #050505;
        padding: 24px;
      }
      .eyebrow {
        margin: 0 0 16px;
        color: #a3a3a3;
        font-size: 0.78rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        max-width: 760px;
        font-size: clamp(2.5rem, 8vw, 6rem);
        line-height: 0.92;
        letter-spacing: -0.08em;
        text-transform: uppercase;
      }
      p {
        margin: 0;
        color: #d4d4d4;
        line-height: 1.65;
      }
      .summary {
        max-width: 760px;
        margin-top: 24px;
        font-size: 1rem;
      }
      .terminal {
        min-height: 100%;
        border-left: 1px solid #737373;
      }
      .terminal pre {
        margin: 0;
        overflow-x: auto;
        color: #f5f5f5;
        font: inherit;
        line-height: 1.7;
      }
      .actions {
        display: flex;
        gap: 12px;
        margin-top: 28px;
        flex-wrap: wrap;
      }
      .button {
        display: inline-block;
        border: 1px solid #d4d4d4;
        padding: 12px 14px;
        color: #fff;
        text-decoration: none;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.78rem;
      }
      .button.primary {
        background: #fff;
        color: #000;
      }
      .button:hover,
      .link-row:hover {
        outline: 2px solid #fff;
        outline-offset: -2px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1px;
        background: #737373;
        border-top: 1px solid #737373;
      }
      .card {
        min-height: 220px;
        background: #050505;
        padding: 20px;
      }
      .dashboard {
        border-top: 1px solid #737373;
        background: #050505;
        padding: 20px;
      }
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        margin-bottom: 16px;
      }
      .dashboard-header h2 {
        margin: 0;
      }
      .dashboard-frame {
        width: 100%;
        height: min(760px, 72vh);
        border: 1px solid #737373;
        background: #000;
      }
      h2 {
        margin: 0 0 18px;
        color: #fff;
        font-size: 0.88rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      ul {
        display: grid;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      li {
        color: #d4d4d4;
        line-height: 1.5;
      }
      code,
      .label {
        color: #fff;
      }
      .link-list {
        display: grid;
        gap: 8px;
      }
      .link-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        border: 1px solid #737373;
        padding: 10px 12px;
        color: #f5f5f5;
      }
      .link-row span:last-child {
        color: #a3a3a3;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 16px;
        border-top: 1px solid #737373;
        color: #a3a3a3;
        font-size: 0.78rem;
      }
      @media (max-width: 820px) {
        main {
          width: 100%;
          padding: 0;
        }
        .shell {
          border-width: 0 0 2px;
        }
        .hero,
        .grid {
          grid-template-columns: 1fr;
        }
        .terminal {
          border-left: 0;
          border-top: 1px solid #737373;
        }
        .topbar,
        .footer,
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .dashboard-frame {
          height: 560px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="shell" aria-label="Developer dashboard">
        <header class="topbar">
          <span>${this.config.serviceName} / backend scaffold</span>
          <span>env:${this.config.environment} version:${this.config.version}</span>
        </header>

        <section class="hero">
          <div class="panel">
            <p class="eyebrow">TypeScript service foundation</p>
            <h1>Backend control plane</h1>
            <p class="summary">${this.config.serviceDescription} This project is a reusable scaffolding for TypeScript backends with production-ready foundations for configuration, observability, authentication, health checks, API documentation, and CI quality gates.</p>
            <div class="actions" aria-label="Primary links">
              <a class="button primary" href="/docs">View API docs</a>
              <a class="button" href="/openapi.json">OpenAPI JSON</a>
              <a class="button" href="/health">Health check</a>
              <a class="button" href="/ready">Readiness</a>
            </div>
          </div>

          <aside class="panel terminal" aria-label="Runtime status">
            <p class="eyebrow">Runtime</p>
            <pre>$ curl /health
status      ok
service     ${this.config.serviceName}
auth        ${this.config.auth.provider}
metrics     ${String(this.config.metricsEnabled)}
tracing     ${String(this.config.tracingEnabled)}</pre>
          </aside>
        </section>

        <section class="grid" aria-label="Scaffold capabilities">
          <article class="card">
            <h2>Core Modules</h2>
            <ul>
              <li><span class="label">Config</span> / explicit env validation</li>
              <li><span class="label">Auth</span> / OIDC or mock provider</li>
              <li><span class="label">Docs</span> / Scalar + OpenAPI 3.1</li>
              <li><span class="label">HTTP</span> / Express 5 service shell</li>
            </ul>
          </article>

          <article class="card">
            <h2>Observability</h2>
            <ul>
              <li><span class="label">Logs</span> / structured request entries</li>
              <li><span class="label">Metrics</span> / Prometheus endpoint</li>
              <li><span class="label">Tracing</span> / OpenTelemetry OTLP HTTP</li>
              <li><span class="label">Health</span> / liveness and readiness probes</li>
            </ul>
          </article>

          <article class="card">
            <h2>Relevant Links</h2>
            <div class="link-list">
              <a class="link-row" href="https://github.com/rubenspensky-homelab/ts-backend-demo" rel="noreferrer"><span>GitHub</span><span>source + actions</span></a>
              <a class="link-row" href="https://opentelemetry.io" rel="noreferrer"><span>OpenTelemetry</span><span>traces</span></a>
              <a class="link-row" href="https://prometheus.io" rel="noreferrer"><span>Prometheus</span><span>metrics</span></a>
              <a class="link-row" href="https://scalar.com" rel="noreferrer"><span>Scalar</span><span>api docs</span></a>
            </div>
          </article>
        </section>

        <section class="dashboard" aria-label="Grafana dashboard">
          <div class="dashboard-header">
            <h2>Grafana Dashboard</h2>
            <a class="button" href="${this.config.grafanaDashboardUrl}" rel="noreferrer">Open Grafana</a>
          </div>
          <iframe class="dashboard-frame" src="${this.config.grafanaDashboardUrl}" title="Grafana public dashboard" loading="lazy"></iframe>
        </section>

        <footer class="footer">
          <span>functional over decorative / monochrome interface</span>
          <span>GET / returns JSON when requested with Accept: application/json</span>
        </footer>
      </section>
    </main>
  </body>
</html>`;
  }

  getHealth() {
    return {
      status: "ok" as const,
      service: this.config.serviceName,
      timestamp: new Date().toISOString(),
    };
  }

  getReadiness() {
    return {
      status: "ready" as const,
      service: this.config.serviceName,
      checks: {},
      timestamp: new Date().toISOString(),
    };
  }
}
