import { NextResponse } from "next/server";
import { buildScheduleChatPrompt } from "@/lib/gemini/prompts";
import { addGeminiModelHeaders, generateWithModelFallback } from "@/lib/gemini/modelPool";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { analysis, question } = body;

    if (!analysis || !question) {
      return NextResponse.json(
        { error: "analysis and question are required" },
        { status: 400 }
      );
    }

    const prompt = buildScheduleChatPrompt(analysis, question);

    const result = await generateWithModelFallback({
      contents: prompt,
    });

    const answer = result.response.text;

    if (!answer) {
      throw new Error("Gemini returned empty chat response");
    }

    return addGeminiModelHeaders(
      NextResponse.json({ answer }),
      result.model,
      result.attempts.length
    );
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        error: "Failed to answer schedule question",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
