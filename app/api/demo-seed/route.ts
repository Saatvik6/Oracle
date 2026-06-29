import { NextResponse } from "next/server";
import { demoScenario } from "@/data/demoScenario";

export async function GET() {
  return NextResponse.json(demoScenario);
}