import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini/client";
import { buildScheduleChatPrompt } from "@/lib/gemini/prompts";

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

    const client = getGeminiClient();

    const prompt = buildScheduleChatPrompt(analysis, question);

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer = response.text;

    if (!answer) {
      throw new Error("Gemini returned empty chat response");
    }

    return NextResponse.json({ answer });
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