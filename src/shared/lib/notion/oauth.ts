// OAuth Notion — bas niveau (serveur uniquement). Enregistrement STATIQUE :
// client_id/secret fixes, pas de Dynamic Client Registration.

const AUTHORIZE_URL = "https://api.notion.com/v1/oauth/authorize";
const TOKEN_URL = "https://api.notion.com/v1/oauth/token";

export interface NotionTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string | null;
  // Non documenté à ce jour mais géré défensivement (tokens rotatifs).
  expires_in?: number | null;
  bot_id: string;
  workspace_id: string;
  workspace_name: string | null;
  workspace_icon: string | null;
  duplicated_template_id?: string | null;
}

export class NotionOAuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "NotionOAuthError";
  }
}

function clientId(): string {
  const v = process.env.NOTION_OAUTH_CLIENT_ID;
  if (!v) throw new Error("NOTION_OAUTH_CLIENT_ID manquant.");
  return v;
}

function clientSecret(): string {
  const v = process.env.NOTION_OAUTH_CLIENT_SECRET;
  if (!v) throw new Error("NOTION_OAUTH_CLIENT_SECRET manquant.");
  return v;
}

// redirect_uri doit être identique au caractère près entre authorize,
// enregistrement Notion et échange → une seule source (env explicite).
export function notionRedirectUri(): string {
  const v = process.env.NOTION_OAUTH_REDIRECT_URI;
  if (!v) throw new Error("NOTION_OAUTH_REDIRECT_URI manquant.");
  return v;
}

function basicAuthHeader(): string {
  const creds = Buffer.from(`${clientId()}:${clientSecret()}`).toString("base64");
  return `Basic ${creds}`;
}

export function buildAuthorizeUrl(state: string): string {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("owner", "user");
  url.searchParams.set("redirect_uri", notionRedirectUri());
  url.searchParams.set("state", state);
  return url.toString();
}

async function postToken(body: Record<string, string>): Promise<NotionTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const code = typeof json.error === "string" ? json.error : "oauth_error";
    const message =
      typeof json.error_description === "string"
        ? json.error_description
        : `Échange OAuth Notion échoué (${res.status}).`;
    throw new NotionOAuthError(code, message);
  }

  return json as unknown as NotionTokenResponse;
}

// Échange le code d'autorisation contre des tokens.
export function exchangeCode(code: string): Promise<NotionTokenResponse> {
  return postToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: notionRedirectUri(),
  });
}

// Rafraîchit l'access token. Notion FAIT TOURNER le refresh token : la réponse
// contient un nouvel access_token ET (le cas échéant) un nouveau refresh_token.
export function refreshAccessToken(
  refreshToken: string,
): Promise<NotionTokenResponse> {
  return postToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}
