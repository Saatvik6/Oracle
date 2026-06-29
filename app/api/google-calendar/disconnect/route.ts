import { NextResponse } from "next/server";
import { GOOGLE_ACCESS_COOKIE, GOOGLE_REFRESH_COOKIE } from "@/lib/google/calendar";

export async function POST() {
  const response = NextResponse.json({ connected: false });
  response.cookies.delete(GOOGLE_ACCESS_COOKIE);
  response.cookies.delete(GOOGLE_REFRESH_COOKIE);
  return response;
}
