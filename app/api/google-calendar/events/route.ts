import { NextRequest, NextResponse } from "next/server";
import {
  GOOGLE_ACCESS_COOKIE,
  GOOGLE_REFRESH_COOKIE,
  refreshGoogleAccessToken,
  secureCookie,
} from "@/lib/google/calendar";

interface CalendarEventRequest {
  title: string;
  description?: string;
  start: string;
  end: string;
}

export async function POST(request: NextRequest) {
  const event = (await request.json()) as CalendarEventRequest;
  if (!event.title || !event.start || !event.end) {
    return NextResponse.json({ error: "title, start, and end are required" }, { status: 400 });
  }

  let accessToken = request.cookies.get(GOOGLE_ACCESS_COOKIE)?.value;
  let refreshed: { access_token: string; expires_in: number } | null = null;
  if (!accessToken) {
    const refreshToken = request.cookies.get(GOOGLE_REFRESH_COOKIE)?.value;
    if (refreshToken) refreshed = await refreshGoogleAccessToken(refreshToken, request.url);
    accessToken = refreshed?.access_token;
  }
  if (!accessToken) {
    return NextResponse.json({ error: "Google Calendar is not connected." }, { status: 401 });
  }

  const googleResponse = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.title,
        description: event.description || "Prepared and approved by Oracle AI Chief of Staff.",
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      }),
    }
  );

  if (!googleResponse.ok) {
    return NextResponse.json(
      { error: "Google Calendar rejected the event.", details: await googleResponse.text() },
      { status: googleResponse.status }
    );
  }

  const created = await googleResponse.json();
  const response = NextResponse.json({ id: created.id, htmlLink: created.htmlLink });
  if (refreshed) {
    response.cookies.set(GOOGLE_ACCESS_COOKIE, refreshed.access_token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(60, refreshed.expires_in - 60),
    });
  }
  return response;
}
