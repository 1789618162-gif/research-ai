import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { ProxyAgent, fetch as undiciFetch } from "undici";
import {
  OpportunityAnalysisInputSchema,
  OpportunityAnalysisOutputSchema,
  type CompetitorInput,
  type Opportunity,
  type OpportunityAnalysisInput,
  type OpportunityAnalysisOutput,
} from "./schema";
import { scoreOpportunities } from "./scoreOpportunities";

const DEFAULT_MODEL = "gpt-5.4-mini";
const OPENAI_TIMEOUT_MS = 120_000;

export type OpportunityAnalysisErrorCode =
  | "INVALID_INPUT"
  | "OPENAI_CONFIG_MISSING"
  | "OPENAI_REQUEST_FAILED"
  | "INVALID_MODEL_OUTPUT";

export class OpportunityAnalysisError extends Error {
  code: OpportunityAnalysisErrorCode;
  status: number;

  constructor(
    code: OpportunityAnalysisErrorCode,
    message: string,
    status: number,
  ) {
    super(message);
    this.name = "OpportunityAnalysisError";
    this.code = code;
    this.status = status;
  }
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

  /**
   * Local development may depend on an HTTP proxy. The official SDK accepts a
   * custom fetch implementation, so we route requests through undici's
   * ProxyAgent when OPENAI_PROXY_URL / HTTPS_PROXY / HTTP_PROXY exists.
   */
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

async function loadPrompt(filename: string) {
  return readFile(path.join(process.cwd(), "prompts", filename), "utf8");
}

async function buildPrompt(input: OpportunityAnalysisInput) {
  const analyzerPrompt = await loadPrompt("opportunity_analyzer.md");

  return [
    analyzerPrompt,
    "",
    "以下是竞品结构化数据。请只基于这些输入做机会点分析，优先引用 workflow_depth、automation_level、agent_capability、collaboration_support 等字段作为证据：",
    JSON.stringify(input, null, 2),
  ].join("\n");
}

function stripJsonFence(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseJsonWithFallback(text: string): unknown {
  const cleaned = stripJsonFence(text);

  try {
    return JSON.parse(cleaned);
  } catch {
    /**
     * Models can occasionally wrap JSON with natural language despite explicit
     * instructions. Extracting the broadest object/array slice keeps the route
     * useful without accepting malformed downstream data.
     */
    const objectStart = cleaned.indexOf("{");
    const objectEnd = cleaned.lastIndexOf("}");

    if (objectStart >= 0 && objectEnd > objectStart) {
      return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
    }

    const arrayStart = cleaned.indexOf("[");
    const arrayEnd = cleaned.lastIndexOf("]");

    if (arrayStart >= 0 && arrayEnd > arrayStart) {
      return { opportunities: JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1)) };
    }

    throw new Error("Model output was not valid JSON.");
  }
}

function normalizeModelOutput(parsed: unknown) {
  if (Array.isArray(parsed)) {
    return { opportunities: parsed };
  }

  return parsed;
}

function getCompetitorName(competitor: CompetitorInput) {
  return competitor.product_name || competitor.name || "未知竞品";
}

function namesFromCompetitors(competitors: CompetitorInput[]) {
  return competitors.map(getCompetitorName).filter(Boolean);
}

function buildStructuredEvidence(competitors: CompetitorInput[]) {
  return competitors
    .slice(0, 4)
    .map((competitor) => {
      const name = getCompetitorName(competitor);
      const workflow = competitor.workflow_depth ?? "未知";
      const automation = competitor.automation_level ?? "未知";
      const agent = competitor.agent_capability ?? "未知";
      const collaboration = competitor.collaboration_support ?? "未知";

      return `${name}: workflow_depth=${workflow}, automation_level=${automation}, agent_capability=${agent}, collaboration_support=${collaboration}`;
    })
    .join("；");
}

function buildParseFallback(
  competitors: CompetitorInput[],
): OpportunityAnalysisOutput {
  const relatedProducts = namesFromCompetitors(competitors);
  const structuredEvidence = buildStructuredEvidence(competitors);

  const fallbackOpportunity: Opportunity = {
    opportunity_title: "基于结构化竞品字段验证 Agent 化工作流机会",
    gap_type: "agent",
    related_products: relatedProducts.length > 0 ? relatedProducts : ["证据不足"],
    evidence: `证据不足：模型返回内容不是合法 JSON。兜底分析仅参考输入字段：${structuredEvidence || "缺少可用结构化字段"}。`,
    unmet_need:
      "用户需要的不只是单点功能对比，而是能把目标拆成步骤、自动收集信息、生成可执行产物并持续迭代的完整工作流。",
    agent_leverage:
      "Agent 可以承担任务拆解、竞品信息归纳、机会评分和 MVP 建议生成，减少用户在多个工具之间切换。",
    product_direction:
      "先做一个机会点分析助手：输入竞品结构化数据后，自动输出证据、缺口、Agent 增益和 MVP 第一步。",
    mvp_idea:
      "实现单次输入 competitors 数组到机会点 JSON 的闭环，并在 UI 中明确标注证据不足时的风险。",
    priority: "Low",
    priority_reason:
      "这是 JSON 解析失败后的兜底结果，证据不足，不能作为真实策略结论；优先级设为 Low 以避免误导决策。",
  };

  return { opportunities: [fallbackOpportunity] };
}

function getOpenAIErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message || "OpenAI request failed.";
  }

  return "OpenAI request failed.";
}

export async function analyzeOpportunity(
  rawInput: unknown,
): Promise<OpportunityAnalysisOutput> {
  const inputResult = OpportunityAnalysisInputSchema.safeParse(rawInput);

  if (!inputResult.success) {
    throw new OpportunityAnalysisError(
      "INVALID_INPUT",
      inputResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
      400,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpportunityAnalysisError(
      "OPENAI_CONFIG_MISSING",
      "OPENAI_API_KEY is not configured.",
      500,
    );
  }

  const input = inputResult.data;
  const client = getOpenAIClient(apiKey);
  const prompt = await buildPrompt(input);

  let outputText = "";

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      input: prompt,
      reasoning: { effort: "medium" },
      max_output_tokens: 5000,
      text: {
        verbosity: "low",
        format: { type: "json_object" },
      },
      store: false,
    });

    outputText = response.output_text;
  } catch (error) {
    throw new OpportunityAnalysisError(
      "OPENAI_REQUEST_FAILED",
      getOpenAIErrorMessage(error),
      502,
    );
  }

  let parsed: unknown;

  try {
    parsed = normalizeModelOutput(parseJsonWithFallback(outputText));
  } catch {
    const fallback = buildParseFallback(input.competitors);
    return {
      opportunities: await scoreOpportunities({
        competitors: input.competitors,
        opportunities: fallback.opportunities,
      }),
    };
  }

  const outputResult = OpportunityAnalysisOutputSchema.safeParse(parsed);

  if (!outputResult.success) {
    const fallback = buildParseFallback(input.competitors);
    return {
      opportunities: await scoreOpportunities({
        competitors: input.competitors,
        opportunities: fallback.opportunities,
      }),
    };
  }

  return {
    opportunities: await scoreOpportunities({
      competitors: input.competitors,
      opportunities: outputResult.data.opportunities,
    }),
  };
}
