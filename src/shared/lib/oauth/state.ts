import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// State OAuth signé HMAC (anti-CSRF). Le state porte l'utilisateur qui a
// initié le flow + un nonce + un horodatage, signés avec OAUTH_STATE_SECRET.
// Serveur uniquement (node:crypto).

export type OAuthProvider = "notion" | "github";

interface StatePayload {
  userId: string;
  provider: OAuthProvider;
  nonce: string;
  iat: number;
}

const DEFAULT_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function stateSecret(): string {
  const s = process.env.OAUTH_STATE_SECRET;
  if (!s) throw new Error("OAUTH_STATE_SECRET manquant.");
  return s;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(body: string): string {
  return createHmac("sha256", stateSecret()).update(body).digest("base64url");
}

export function signState(data: {
  userId: string;
  provider: OAuthProvider;
}): string {
  const payload: StatePayload = {
    userId: data.userId,
    provider: data.provider,
    nonce: randomBytes(12).toString("hex"),
    iat: Date.now(),
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyState(
  token: string | null,
  opts: { provider: OAuthProvider; maxAgeMs?: number },
): StatePayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: StatePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (payload.provider !== opts.provider) return null;
  const maxAge = opts.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
  if (!payload.iat || Date.now() - payload.iat > maxAge) return null;

  return payload;
}
