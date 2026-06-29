export const GOOGLE_ACCESS_COOKIE = "oracle_google_access";
export const GOOGLE_REFRESH_COOKIE = "oracle_google_refresh";
export const GOOGLE_STATE_COOKIE = "oracle_google_state";

export function getGoogleOAuthConfig(requestUrl: string) {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      new URL("/api/google-calendar/callback", requestUrl).toString(),
  };
}

export async function refreshGoogleAccessToken(refreshToken: string, requestUrl: string) {
  const config = getGoogleOAuthConfig(requestUrl);
  if (!config.clientId || !config.clientSecret) return null;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) return null;
  return (await response.json()) as { access_token: string; expires_in: number };
}

export const secureCookie = process.env.NODE_ENV === "production";
