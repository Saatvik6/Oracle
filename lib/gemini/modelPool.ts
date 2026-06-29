import { getGeminiClient } from "@/lib/gemini/client";

type GeminiClient = ReturnType<typeof getGeminiClient>;
type GenerateContentParams = Parameters<GeminiClient["models"]["generateContent"]>[0];
type GenerateContentResponse = Awaited<
  ReturnType<GeminiClient["models"]["generateContent"]>
>;

export interface GeminiAttempt {
  model: string;
  status?: number;
  reason: string;
}

const DEFAULT_MODEL_POOL = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3-flash",
];

let rotationCursor = 0;

export function getGeminiModelPool() {
  const configured = process.env.GEMINI_MODEL_POOL?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  return [...new Set(configured?.length ? configured : DEFAULT_MODEL_POOL)];
}

function orderedModels() {
  const pool = getGeminiModelPool();
  const start = rotationCursor % pool.length;
  rotationCursor = (rotationCursor + 1) % pool.length;
  return [...pool.slice(start), ...pool.slice(0, start)];
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as {
    status?: unknown;
    code?: unknown;
    error?: { code?: unknown };
  };
  const value = candidate.status ?? candidate.code ?? candidate.error?.code;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function errorReason(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 240);
  return String(error).slice(0, 240);
}

function shouldTryAnotherModel(error: unknown) {
  const status = errorStatus(error);
  if (status === 404 || status === 408 || status === 429) return true;
  if (status && status >= 500) return true;

  const reason = errorReason(error).toLowerCase();
  return [
    "resource_exhausted",
    "quota",
    "rate limit",
    "too many requests",
    "overloaded",
    "unavailable",
    "timeout",
    "timed out",
    "fetch failed",
    "empty response",
    "not found",
    "not supported",
    "unsupported",
  ].some((phrase) => reason.includes(phrase));
}

export class GeminiModelPoolError extends Error {
  constructor(public readonly attempts: GeminiAttempt[]) {
    super(`Every configured Gemini model failed (${attempts.map((item) => item.model).join(", ")}).`);
    this.name = "GeminiModelPoolError";
  }
}

export async function generateWithModelFallback(
  input: Omit<GenerateContentParams, "model">
): Promise<{
  response: GenerateContentResponse;
  model: string;
  attempts: GeminiAttempt[];
}> {
  const client = getGeminiClient();
  const attempts: GeminiAttempt[] = [];
  const models = orderedModels();

  for (const model of models) {
    try {
      const response = await client.models.generateContent({ ...input, model });
      if (!response.text?.trim()) throw new Error("Gemini returned an empty response.");

      if (attempts.length) {
        console.info(`[Gemini pool] ${model} recovered after ${attempts.length} failed attempt(s).`);
      }
      return { response, model, attempts };
    } catch (error) {
      const attempt = {
        model,
        status: errorStatus(error),
        reason: errorReason(error),
      };
      attempts.push(attempt);
      console.warn("[Gemini pool] Model attempt failed", attempt);

      if (!shouldTryAnotherModel(error)) throw error;
    }
  }

  throw new GeminiModelPoolError(attempts);
}

export function addGeminiModelHeaders(
  response: Response,
  model: string,
  failedAttempts: number
) {
  response.headers.set("X-Oracle-Gemini-Model", model);
  response.headers.set("X-Oracle-Gemini-Fallbacks", String(failedAttempts));
  return response;
}
