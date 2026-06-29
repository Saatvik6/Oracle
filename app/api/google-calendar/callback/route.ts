import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleOAuthConfig,
  GOOGLE_ACCESS_COOKIE,
  GOOGLE_REFRESH_COOKIE,
  GOOGLE_STATE_COOKIE,
  secureCookie,
} from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const destination = new URL("/", request.url);

  if (!code || !state || state !== expectedState) {
    destination.searchParams.set("calendar", "error");
    return NextResponse.redirect(destination);
  }

  const config = getGoogleOAuthConfig(request.url);
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    destination.searchParams.set("calendar", "error");
    return NextResponse.redirect(destination);
  }

  const tokens = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  destination.searchParams.set("calendar", "connected");
  const response = NextResponse.redirect(destination);
  const cookieOptions = { httpOnly: true, secure: secureCookie, sameSite: "lax" as const, path: "/" };

  response.cookies.set(GOOGLE_ACCESS_COOKIE, tokens.access_token, {
    ...cookieOptions,
    maxAge: Math.max(60, tokens.expires_in - 60),
  });
  if (tokens.refresh_token) {
    response.cookies.set(GOOGLE_REFRESH_COOKIE, tokens.refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  response.cookies.delete(GOOGLE_STATE_COOKIE);
  return response;
}
