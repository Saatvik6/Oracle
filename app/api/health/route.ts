import { NextResponse } from "next/server";
import { getGeminiModelPool } from "@/lib/gemini/modelPool";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    gemini: {
      strategy: "round-robin-with-fallback",
      models: getGeminiModelPool(),
    },
  });
}
