import type { AppConfig } from "../src/shared/config/types";

export const mockAuthAppConfig: AppConfig = {
  port: 3000,
  serviceName: "base-microservice",
  serviceDescription: "Base microservice template for future backend services.",
  version: "1.0.0",
  environment: "test",
  docs: {
    publicBaseUrls: [{ url: "http://localhost:3000", description: "Local" }],
    oauthClientId: "L9JCsgnMIb4CgTE3G4eSe8J5aWDTphvbpX9NM7ui",
    oauthAuthorizationUrl: "http://localhost:3000/docs/oauth/authorize",
    oauthUpstreamAuthorizationUrl: "http://auth.home.lab/application/o/authorize/",
    oauthTokenUrl: "http://auth.home.lab/application/o/token/",
    oauthRedirectUri: "http://localhost:3000/docs",
  },
  metricsEnabled: true,
  tracingEnabled: false,
  otlpTracesEndpoint: "http://localhost:4318/v1/traces",
  auth: {
    provider: "mock",
    user: {
      id: "dev-user-1",
      email: "dev@example.com",
      name: "Dev User",
      groups: ["admins", "developers"],
    },
  },
};
