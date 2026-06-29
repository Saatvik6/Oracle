import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini/client";
import { buildReplanPrompt } from "@/lib/gemini/prompts";
import { analysisJsonSchema } from "@/lib/gemini/analysisSchema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { previousAnalysis, eventType } = body;

    if (!previousAnalysis || !eventType) {
      return NextResponse.json(
        { error: "previousAnalysis and eventType are required" },
        { status: 400 }
      );
    }

    const client = getGeminiClient();

    const prompt = buildReplanPrompt(
      previousAnalysis,
      eventType,
      new Date().toISOString()
    );

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisJsonSchema,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned empty response");
    }

    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Replan API error:", error);

    return NextResponse.json(
      {
        error: "Failed to replan commitments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}