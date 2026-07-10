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
        font-family: Inter, system-ui, sans-serif;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #0f172a, #111827);
        color: #e5e7eb;
      }
      main {
        max-width: 720px;
        padding: 48px;
      }
      h1 {
        font-size: 3rem;
        margin-bottom: 16px;
      }
      p {
        font-size: 1.1rem;
        line-height: 1.7;
        color: #cbd5e1;
      }
      .actions {
        display: flex;
        gap: 16px;
        margin-top: 32px;
        flex-wrap: wrap;
      }
      a {
        display: inline-block;
        text-decoration: none;
        border-radius: 999px;
        padding: 12px 20px;
        font-weight: 600;
      }
      .primary {
        background: #38bdf8;
        color: #0f172a;
      }
      .secondary {
        border: 1px solid #475569;
        color: #e5e7eb;
      }
      .card {
        margin-top: 32px;
        padding: 20px;
        border: 1px solid #334155;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.5);
      }
      code {
        color: #7dd3fc;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${this.config.serviceName}</h1>
      <p>${this.config.serviceDescription}</p>
      <div class="actions">
        <a class="primary" href="/docs">View API docs</a>
        <a class="secondary" href="/health">Health check</a>
      </div>
      <section class="card">
        <p>This project is a reusable microservice template with shared authentication, configuration, observability, and API documentation foundations.</p>
        <p>To learn how to interact with the service, open <code>/docs</code>.</p>
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
}
