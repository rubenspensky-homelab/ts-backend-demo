import type { RequestHandler } from "express";
import type { DocsConfig } from "../config/types";

export function createDocsOAuthAuthorizeRedirectHandler(config: DocsConfig): RequestHandler {
  return (req, res) => {
    const authorizationUrl = new URL(config.oauthUpstreamAuthorizationUrl);

    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") {
        authorizationUrl.searchParams.set(key, value);
      }
    }

    authorizationUrl.searchParams.delete("Response_type");
    authorizationUrl.searchParams.set("client_id", config.oauthClientId);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("redirect_uri", config.oauthRedirectUri);

    res.redirect(authorizationUrl.toString());
  };
}
