import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ProxyAgent, fetch as undiciFetch } from "undici";

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 120;
const DEFAULT_MODEL = "gpt-5.4-mini";
const OPENAI_TIMEOUT_MS = 120_000;
const CACHE_TTL_MS = 5 * 60_000;

type ErrorCode =
  | "INVALID_INPUT"
  | "OPENAI_CONFIG_MISSING"
  | "OPENAI_REQUEST_FAILED"
  | "INVALID_MODEL_OUTPUT";

type CompetitorAnalysis = {
  competitors: Array<{
    name: string;
    category: string;
    positioning: string;
    strengths: string[];
    weaknesses: string[];
    evidence: string[];
  }>;
  featureComparison: Array<{
    feature: string;
    importance: "high" | "medium" | "low";
    comparison: Array<{
      competitor: string;
      performance: string;
      notes: string;
    }>;
  }>;
  userScenarios: Array<{
    scenario: string;
    userType: string;
    painPoints: string[];
    currentAlternatives: string[];
  }>;
  differentiationAnalysis: Array<{
    dimension: string;
    currentPattern: string;
    gaps: string[];
    implications: string;
  }>;
  opportunities: Array<{
    title: string;
    rationale: string;
    targetUsers: string[];
    suggestedMoves: string[];
    priority: "high" | "medium" | "low";
  }>;
};

type AnalysisMode = "web_search" | "model_only";

const analysisCache = new Map<
  string,
  {
    expiresAt: number;
    promise: Promise<CompetitorAnalysis>;
  }
>();

const stringArraySchema = {
  type: "array",
  items: { type: "string" },
} as const;

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "competitors",
    "featureComparison",
    "userScenarios",
    "differentiationAnalysis",
    "opportunities",
  ],
  properties: {
    competitors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "category",
          "positioning",
          "strengths",
          "weaknesses",
          "evidence",
        ],
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          positioning: { type: "string" },
          strengths: stringArraySchema,
          weaknesses: stringArraySchema,
          evidence: stringArraySchema,
        },
      },
    },
    featureComparison: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["feature", "importance", "comparison"],
        properties: {
          feature: { type: "string" },
          importance: { type: "string", enum: ["high", "medium", "low"] },
          comparison: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["competitor", "performance", "notes"],
              properties: {
                competitor: { type: "string" },
                performance: { type: "string" },
                notes: { type: "string" },
              },
            },
          },
        },
      },
    },
    userScenarios: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "scenario",
          "userType",
          "painPoints",
          "currentAlternatives",
        ],
        properties: {
          scenario: { type: "string" },
          userType: { type: "string" },
          painPoints: stringArraySchema,
          currentAlternatives: stringArraySchema,
        },
      },
    },
    differentiationAnalysis: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["dimension", "currentPattern", "gaps", "implications"],
        properties: {
          dimension: { type: "string" },
          currentPattern: { type: "string" },
          gaps: stringArraySchema,
          implications: { type: "string" },
        },
      },
    },
    opportunities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "rationale",
          "targetUsers",
          "suggestedMoves",
          "priority",
        ],
        properties: {
          title: { type: "string" },
          rationale: { type: "string" },
          targetUsers: stringArraySchema,
          suggestedMoves: stringArraySchema,
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
    },
  },
} as const;

function errorResponse(code: ErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getValidatedQuery(body: unknown) {
  if (!isPlainObject(body) || typeof body.query !== "string") {
    return null;
  }

  const query = body.query.trim();

  if (!query || query.length > MAX_QUERY_LENGTH) {
    return null;
  }

  return query;
}

function hasAnalysisShape(value: unknown): value is CompetitorAnalysis {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    Array.isArray(value.competitors) &&
    value.competitors.length > 0 &&
    Array.isArray(value.featureComparison) &&
    value.featureComparison.length > 0 &&
    Array.isArray(value.userScenarios) &&
    value.userScenarios.length > 0 &&
    Array.isArray(value.differentiationAnalysis) &&
    value.differentiationAnalysis.length > 0 &&
    Array.isArray(value.opportunities) &&
    value.opportunities.length > 0
  );
}

function buildPrompt(query: string, mode: AnalysisMode) {
  const sourceInstruction =
    mode === "web_search"
      ? "请优先基于 Web search 获取的当前公开信息。"
      : "本次未使用实时 Web search；请基于模型知识和公开信息推断，并在 evidence 中明确写“基于模型知识和公开信息推断”。";

  return `
你是一个资深产品策略分析师。请基于当前公开信息，分析用户输入的赛道或产品名。

用户输入：${query}

信息来源要求：${sourceInstruction}

只返回一个 JSON 对象，字段必须严格使用以下结构：
{
  "competitors": [
    {
      "name": "竞品名称",
      "category": "竞品类型",
      "positioning": "定位",
      "strengths": ["优势"],
      "weaknesses": ["短板"],
      "evidence": ["公开信息依据；不确定时写基于公开信息推断"]
    }
  ],
  "featureComparison": [
    {
      "feature": "功能",
      "importance": "high",
      "comparison": [
        {
          "competitor": "竞品名称",
          "performance": "表现",
          "notes": "说明"
        }
      ]
    }
  ],
  "userScenarios": [
    {
      "scenario": "场景",
      "userType": "用户类型",
      "painPoints": ["痛点"],
      "currentAlternatives": ["当前替代方案"]
    }
  ],
  "differentiationAnalysis": [
    {
      "dimension": "差异维度",
      "currentPattern": "当前格局",
      "gaps": ["缺口"],
      "implications": "启示"
    }
  ],
  "opportunities": [
    {
      "title": "机会点",
      "rationale": "原因",
      "targetUsers": ["目标用户"],
      "suggestedMoves": ["建议动作"],
      "priority": "high"
    }
  ]
}

要求：
- 先判断输入更像“赛道”还是“产品名”，并据此选择竞品和分析视角。
- 必须使用中文输出所有内容。
- 给出 3 个竞品；如果是产品名，竞品应包含直接竞品和相邻替代方案。
- 给出 5 个功能对比项，并让每个对比项覆盖主要竞品。
- 给出 3 个用户场景、3 个差异分析维度、3 个机会点。
- 每个字段保持简洁，单条说明尽量控制在 30 个汉字以内。
- 机会点要面向可以落地的产品策略，不要只写泛泛的市场口号。
- 对无法从公开信息确认的判断，在 evidence 或分析文字中明确写“基于公开信息推断”。
- 不要输出 JSON 之外的任何解释文字。
`.trim();
}

async function createAnalysis(
  client: OpenAI,
  query: string,
  mode: AnalysisMode,
) {
  return client.responses.create(
    {
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      input: buildPrompt(query, mode),
      ...(mode === "web_search"
        ? {
            tools: [
              { type: "web_search" as const, search_context_size: "low" as const },
            ],
          }
        : {}),
      reasoning: { effort: "low" },
      max_output_tokens: 3500,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "competitor_analysis",
          strict: true,
          schema: analysisSchema,
        },
      },
      store: false,
    },
    { timeout: mode === "web_search" ? 15_000 : OPENAI_TIMEOUT_MS },
  );
}

function getOpenAIClient(apiKey: string) {
  const proxyUrl =
    process.env.OPENAI_PROXY_URL ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY;

  if (!proxyUrl) {
    return new OpenAI({
      apiKey,
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: 0,
    });
  }

  const dispatcher = new ProxyAgent(proxyUrl);
  const proxiedFetch: typeof fetch = (async (url, init) => {
    const response = await undiciFetch(
      url as Parameters<typeof undiciFetch>[0],
      {
        ...init,
        dispatcher,
      } as Parameters<typeof undiciFetch>[1],
    );

    return response as unknown as Response;
  }) as typeof fetch;

  return new OpenAI({
    apiKey,
    timeout: OPENAI_TIMEOUT_MS,
    maxRetries: 0,
    fetch: proxiedFetch,
  });
}

function getAnalysisMode(): AnalysisMode {
  return process.env.OPENAI_ENABLE_WEB_SEARCH === "true"
    ? "web_search"
    : "model_only";
}

function getOpenAIErrorMessage(error: unknown) {
  if (
    error instanceof Error &&
    (/rate_limit/i.test(error.message) || "code" in error && error.code === "rate_limit_exceeded")
  ) {
    return "OpenAI 账号请求过于频繁，已触发限流。请等待 1 分钟后再试；当前项目已改为低额度模式，每次分析只会发起 1 次 OpenAI 请求。";
  }

  if (error instanceof Error && /timed? ?out/i.test(error.message)) {
    return "OpenAI request timed out. If you are using a local proxy, set OPENAI_PROXY_URL in .env.local and restart the dev server.";
  }

  if (
    error instanceof Error &&
    ("status" in error || "code" in error || "type" in error)
  ) {
    const details = [
      "status" in error ? `status=${String(error.status)}` : null,
      "code" in error ? `code=${String(error.code)}` : null,
      "type" in error ? `type=${String(error.type)}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    return details
      ? `OpenAI request failed (${details}): ${error.message}`
      : `OpenAI request failed: ${error.message}`;
  }

  return "Failed to generate competitor analysis.";
}

async function generateAnalysis(
  client: OpenAI,
  query: string,
  mode: AnalysisMode,
) {
  const response = await createAnalysis(client, query, mode);
  const analysis = JSON.parse(response.output_text) as unknown;

  if (!hasAnalysisShape(analysis)) {
    throw new Error("Model output did not match the expected analysis structure.");
  }

  return analysis;
}

function getCachedAnalysis(
  client: OpenAI,
  query: string,
  mode: AnalysisMode,
) {
  const now = Date.now();
  const cacheKey = `${mode}:${query}`;
  const cached = analysisCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = generateAnalysis(client, query, mode).catch((error) => {
    analysisCache.delete(cacheKey);
    throw error;
  });

  analysisCache.set(cacheKey, {
    expiresAt: now + CACHE_TTL_MS,
    promise,
  });

  return promise;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Request body must be valid JSON.", 400);
  }

  const query = getValidatedQuery(body);

  if (!query) {
    return errorResponse(
      "INVALID_INPUT",
      `query must be a non-empty string up to ${MAX_QUERY_LENGTH} characters.`,
      400,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return errorResponse(
      "OPENAI_CONFIG_MISSING",
      "OPENAI_API_KEY is not configured.",
      500,
    );
  }

  const client = getOpenAIClient(apiKey);

  try {
    const analysis = await getCachedAnalysis(client, query, getAnalysisMode());
    return NextResponse.json(analysis);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse(
        "INVALID_MODEL_OUTPUT",
        "Model output was not valid JSON.",
        502,
      );
    }

    if (
      error instanceof Error &&
      error.message === "Model output did not match the expected analysis structure."
    ) {
      return errorResponse("INVALID_MODEL_OUTPUT", error.message, 502);
    }

    return errorResponse(
      "OPENAI_REQUEST_FAILED",
      getOpenAIErrorMessage(error),
      502,
    );
  }
}
