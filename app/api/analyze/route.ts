import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini/client";
import { buildAnalyzePrompt } from "@/lib/gemini/prompts";
import { analysisJsonSchema } from "@/lib/gemini/analysisSchema";
import { IntakeResult } from "@/types/intake";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const intake = body as Partial<IntakeResult>;

    if (intake.status !== "ready" || !Array.isArray(intake.commitmentsDraft)) {
      return NextResponse.json(
        { error: "A completed Oracle intake is required before report generation." },
        { status: 400 }
      );
    }

    const client = getGeminiClient();

    const prompt = buildAnalyzePrompt(intake as IntakeResult, new Date().toISOString());

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
    console.error("Analyze API error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze commitments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
