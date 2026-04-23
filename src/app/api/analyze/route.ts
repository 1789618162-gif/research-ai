import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ProxyAgent, fetch as undiciFetch } from "undici";
import { scoreOpportunities } from "../../../../lib/opportunity/scoreOpportunities";

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

type CapabilityLevel = "low" | "medium" | "high";

type OpportunityInsight = {
  opportunity_title: string;
  gap_type: "用户" | "场景" | "流程" | "agent" | "商业化";
  evidence: string;
  unmet_need: string;
  why_now: string;
  product_direction: string;
  priority: "High" | "Medium" | "Low";
  priority_reason: string;
  mvp_idea: string;
  user_value?: number;
  differentiation?: number;
  feasibility?: number;
  agent_fit?: number;
  total_score?: number;
  recommended_priority?: "High" | "Medium" | "Low";
  recommendation_reason?: string;
};

type CompetitorAnalysis = {
  competitors: Array<{
    name: string;
    product_name: string;
    category: string;
    positioning: string;
    core_features: string[];
    target_users: string[];
    key_scenarios: string[];
    pricing: string;
    workflow_depth: CapabilityLevel;
    automation_level: CapabilityLevel;
    agent_capability: CapabilityLevel;
    collaboration_support: CapabilityLevel;
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
  opportunities: OpportunityInsight[];
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

const capabilityLevelSchema = {
  type: "string",
  enum: ["low", "medium", "high"],
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
          "product_name",
          "category",
          "positioning",
          "core_features",
          "target_users",
          "key_scenarios",
          "pricing",
          "workflow_depth",
          "automation_level",
          "agent_capability",
          "collaboration_support",
          "strengths",
          "weaknesses",
          "evidence",
        ],
        properties: {
          name: { type: "string" },
          product_name: { type: "string" },
          category: { type: "string" },
          positioning: { type: "string" },
          core_features: stringArraySchema,
          target_users: stringArraySchema,
          key_scenarios: stringArraySchema,
          pricing: { type: "string" },
          workflow_depth: capabilityLevelSchema,
          automation_level: capabilityLevelSchema,
          agent_capability: capabilityLevelSchema,
          collaboration_support: capabilityLevelSchema,
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
          "opportunity_title",
          "gap_type",
          "evidence",
          "unmet_need",
          "why_now",
          "product_direction",
          "priority",
          "priority_reason",
          "mvp_idea",
        ],
        properties: {
          opportunity_title: { type: "string" },
          gap_type: {
            type: "string",
            enum: ["用户", "场景", "流程", "agent", "商业化"],
          },
          evidence: { type: "string" },
          unmet_need: { type: "string" },
          why_now: { type: "string" },
          product_direction: { type: "string" },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
          priority_reason: { type: "string" },
          mvp_idea: { type: "string" },
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
      ? "请优先基于 Web search 获取的当前公开信息；如果公开信息不足，请明确标注“基于公开信息推断”。"
      : "本次未使用实时 Web search；请基于模型知识和公开信息推断，并在 evidence 中明确标注“基于模型知识和公开信息推断”。";

  return `
你是一个高级 AI 产品战略分析 Agent，负责生成结构化竞品分析和可执行产品机会点。
输入对象：${query}
信息来源要求：${sourceInstruction}

请先判断输入是“赛道”还是“产品名”，再选择 3-6 个最相关竞品进行分析。

每个 competitors 项必须包含这些字段：
- name：兼容旧页面的产品名，必须等于 product_name。
- product_name：产品名。
- category：产品类别。
- positioning：产品定位。
- core_features：核心功能，3-6 项。
- target_users：目标用户，2-5 项。
- key_scenarios：关键使用场景，2-5 项。
- pricing：公开价格信息；不确定时写“未公开 / 基于公开信息推断”。
- workflow_depth：工作流深度，只能是 low / medium / high。
- automation_level：自动化水平，只能是 low / medium / high。
- agent_capability：Agent 能力，只能是 low / medium / high。
- collaboration_support：协作支持，只能是 low / medium / high。
- strengths：优势，2-5 项。
- weaknesses：弱点，2-5 项。
- evidence：公开证据或判断依据，2-5 项；不确定的信息必须标注“基于公开信息推断”。

请特别关注 workflow_depth、automation_level、agent_capability、collaboration_support，因为这些字段会用于后续机会点分析。

机会点要求：
- 从竞品、功能对比、用户场景、差异分析中提炼 5-8 条机会点。
- 每条机会点必须至少满足以下条件中的两个以上：多个竞品覆盖不足、用户价值高、AI/Agent 增益明显、差异化可感知、适合作为 MVP。
- evidence 必须点名相关竞品或对比维度，例如“Notion AI 的 agent_capability=low，ChatGPT 的 workflow_depth=medium，因此跨工具自动化存在缺口”。
- 如果证据不足，evidence 写“证据不足”。
- 优先输出 AI Agent 工作流、自动化执行、复杂任务拆解相关方向。
- 所有内容用中文，字段名保持 JSON schema 规定的英文命名。
- 只返回 JSON，不要返回 Markdown 或额外解释。
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
      max_output_tokens: 6000,
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
    (/rate_limit/i.test(error.message) ||
      ("code" in error && error.code === "rate_limit_exceeded"))
  ) {
    return "OpenAI 账号请求过于频繁，已触发限流。当前页面会展示示例数据，真实分析请稍后重试。";
  }

  if (error instanceof Error && /timed? ?out/i.test(error.message)) {
    return "OpenAI 请求超时。当前页面会展示示例数据；如果使用本地代理，请确认 OPENAI_PROXY_URL 配置正确。";
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

  return {
    ...analysis,
    opportunities: await scoreOpportunities({
      competitors: analysis.competitors,
      opportunities: analysis.opportunities,
    }),
  };
}

function getCachedAnalysis(client: OpenAI, query: string, mode: AnalysisMode) {
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
