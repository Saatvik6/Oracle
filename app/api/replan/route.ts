import { NextResponse } from "next/server";
import { buildReplanPrompt } from "@/lib/gemini/prompts";
import { analysisJsonSchema } from "@/lib/gemini/analysisSchema";
import { addGeminiModelHeaders, generateWithModelFallback } from "@/lib/gemini/modelPool";

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

    const prompt = buildReplanPrompt(
      previousAnalysis,
      eventType,
      new Date().toISOString()
    );

    const result = await generateWithModelFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisJsonSchema,
      },
    });

    const text = result.response.text;

    if (!text) {
      throw new Error("Gemini returned empty response");
    }

    const parsed = JSON.parse(text);

    return addGeminiModelHeaders(
      NextResponse.json(parsed),
      result.model,
      result.attempts.length
    );
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
