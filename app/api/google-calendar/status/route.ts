import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleOAuthConfig,
  GOOGLE_ACCESS_COOKIE,
  GOOGLE_REFRESH_COOKIE,
} from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  const config = getGoogleOAuthConfig(request.url);
  const configured = Boolean(config.clientId && config.clientSecret);
  const connected = Boolean(
    request.cookies.get(GOOGLE_ACCESS_COOKIE)?.value ||
      request.cookies.get(GOOGLE_REFRESH_COOKIE)?.value
  );
  return NextResponse.json({ configured, connected: configured && connected });
}
