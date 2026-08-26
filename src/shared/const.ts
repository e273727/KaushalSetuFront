// TODO: This file replaces the old monorepo import `@shared/const`, which
// pulled these values directly from your backend package. Now that the
// backend is deployed separately, there is no shared package to import from
// — these values are duplicated here and MUST exactly match whatever your
// backend actually uses, or auth will silently break (cookie name mismatch,
// state that the OAuth callback can't decode, etc).
//
// Go find the real values in your backend's `shared/const` (or equivalent)
// and paste them in here.

// Name of the cookie the backend sets after a successful login.
export const COOKIE_NAME = "TODO_COOKIE_NAME";

// Name of the short-lived cookie that stores the OAuth `state` nonce
// between starting login and the callback coming back.
export const OAUTH_STATE_COOKIE = "TODO_OAUTH_STATE_COOKIE";

// Message string the backend returns when a tRPC call is unauthenticated.
// main.tsx compares error.message against this to decide when to redirect
// to login — it must match your backend's error message exactly.
export const UNAUTHED_ERR_MSG = "TODO_UNAUTHED_ERR_MSG";

export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// TODO: replace with your backend's real encoding — this must be decodable
// by your OAuth callback exactly as your backend implements it.
export function encodeOAuthState(payload: {
  redirectUri: string;
  nonce: string;
}): string {
  return btoa(JSON.stringify(payload));
}
