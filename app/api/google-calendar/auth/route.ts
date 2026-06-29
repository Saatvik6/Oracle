import { NextResponse } from "next/server";
import { getGoogleOAuthConfig, GOOGLE_STATE_COOKIE, secureCookie } from "@/lib/google/calendar";

export async function GET(request: Request) {
  const config = getGoogleOAuthConfig(request.url);
  if (!config.clientId || !config.clientSecret) {
    return NextResponse.json(
      { error: "Google Calendar OAuth is not configured." },
      { status: 503 }
    );
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
