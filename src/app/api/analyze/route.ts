import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  createAiClient,
  getAiConfig,
  getAiConfigMissingMessage,
  type AiConfig,
} from "../../../../lib/ai/provider";
import { scoreOpportunities } from "../../../../lib/opportunity/scoreOpportunities";
import { consumeOpenAIDailyQuota } from "../../../../lib/quota/openaiDailyQuota";

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 120;
const DEFAULT_MODEL = "gpt-5.4-mini";
const OPENAI_TIMEOUT_MS = 120_000;
const DASHSCOPE_WEB_SEARCH_TIMEOUT_MS = 120_000;
const CACHE_TTL_MS = 5 * 60_000;

type ErrorCode =
  | "INVALID_INPUT"
  | "OPENAI_CONFIG_MISSING"
  | "OPENAI_DAILY_QUOTA_EXCEEDED"
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

function unwrapAnalysisOutput(value: unknown): unknown {
  if (!isPlainObject(value)) {
    return value;
  }

  for (const key of ["analysis", "result", "data"]) {
    const nested = value[key];

    if (hasAnalysisShape(nested)) {
      return nested;
    }
  }

  return value;
}

function getArrayField(
  value: Record<string, unknown>,
  keys: string[],
): unknown[] {
  for (const key of keys) {
    const field = value[key];

    if (Array.isArray(field)) {
      return field;
    }
  }

  return [];
}

function getStringField(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const field = value[key];

    if (typeof field === "string" && field.trim()) {
      return field.trim();
    }
  }

  return "";
}

function getCapability(value: string): CapabilityLevel {
  return value === "low" || value === "medium" || value === "high"
    ? value
    : "medium";
}

function toStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    const strings = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    return strings.length > 0 ? strings : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return fallback;
}

function normalizeCompetitors(rawItems: unknown[], query: string) {
  const competitors = rawItems
    .filter(isPlainObject)
    .map((item, index) => {
      const name =
        getStringField(item, ["product_name", "productName", "name", "title"]) ||
        `${query} 相关竞品 ${index + 1}`;

      return {
        name,
        product_name: name,
        category:
          getStringField(item, ["category", "type", "segment"]) ||
          "AI 产品",
        positioning:
          getStringField(item, ["positioning", "position", "description"]) ||
          "基于模型输出整理的产品定位。",
        core_features: toStringArray(item.core_features ?? item.coreFeatures, [
          "核心功能待进一步核实",
        ]),
        target_users: toStringArray(item.target_users ?? item.targetUsers, [
          "目标用户待进一步核实",
        ]),
        key_scenarios: toStringArray(item.key_scenarios ?? item.keyScenarios, [
          "关键场景待进一步核实",
        ]),
        pricing:
          getStringField(item, ["pricing", "price", "business_model"]) ||
          "未公开 / 基于公开信息推断",
        workflow_depth: getCapability(String(item.workflow_depth ?? item.workflowDepth ?? "")),
        automation_level: getCapability(String(item.automation_level ?? item.automationLevel ?? "")),
        agent_capability: getCapability(String(item.agent_capability ?? item.agentCapability ?? "")),
        collaboration_support: getCapability(String(item.collaboration_support ?? item.collaborationSupport ?? "")),
        strengths: toStringArray(item.strengths, ["优势待进一步核实"]),
        weaknesses: toStringArray(item.weaknesses, ["弱点待进一步核实"]),
        evidence: toStringArray(item.evidence, [
          "证据不足：基于模型输出和公开信息推断",
        ]),
      };
    });

  return competitors.length > 0
    ? competitors
    : [
        {
          name: query,
          product_name: query,
          category: "AI 产品",
          positioning: "模型未返回完整竞品结构，使用输入对象生成兜底分析。",
          core_features: ["核心功能待进一步核实"],
          target_users: ["目标用户待进一步核实"],
          key_scenarios: ["关键场景待进一步核实"],
          pricing: "未公开 / 基于公开信息推断",
          workflow_depth: "medium" as const,
          automation_level: "medium" as const,
          agent_capability: "medium" as const,
          collaboration_support: "medium" as const,
          strengths: ["优势待进一步核实"],
          weaknesses: ["弱点待进一步核实"],
          evidence: ["证据不足：模型返回结构不完整"],
        },
      ];
}

function normalizeFeatureComparison(
  rawItems: unknown[],
  competitors: CompetitorAnalysis["competitors"],
) {
  const normalized = rawItems.filter(isPlainObject).map((item) => ({
    feature:
      getStringField(item, ["feature", "dimension", "name"]) ||
      "核心能力",
    importance:
      getStringField(item, ["importance", "priority"]) === "low"
        ? "low"
        : getStringField(item, ["importance", "priority"]) === "medium"
          ? "medium"
          : "high",
    comparison:
      getArrayField(item, ["comparison", "comparisons", "items"])
        .filter(isPlainObject)
        .map((entry) => ({
          competitor:
            getStringField(entry, ["competitor", "product", "name"]) ||
            competitors[0].product_name,
          performance:
            getStringField(entry, ["performance", "level", "score"]) ||
            "待核实",
          notes:
            getStringField(entry, ["notes", "note", "summary"]) ||
            "基于模型输出整理。",
        })),
  }));

  return normalized.length > 0
    ? normalized.map((item) => ({
        ...item,
        comparison:
          item.comparison.length > 0
            ? item.comparison
            : competitors.map((competitor) => ({
                competitor: competitor.product_name,
                performance: competitor.agent_capability,
                notes: "基于能力字段自动补全。",
              })),
      }))
    : [
        {
          feature: "Agent 能力",
          importance: "high" as const,
          comparison: competitors.map((competitor) => ({
            competitor: competitor.product_name,
            performance: competitor.agent_capability,
            notes: "基于 agent_capability 字段自动补全。",
          })),
        },
      ];
}

function normalizeUserScenarios(rawItems: unknown[]) {
  const scenarios = rawItems.filter(isPlainObject).map((item) => ({
    scenario:
      getStringField(item, ["scenario", "name", "title"]) ||
      "AI 辅助完成复杂任务",
    userType:
      getStringField(item, ["userType", "user_type", "user"]) ||
      "目标用户",
    painPoints: toStringArray(item.painPoints ?? item.pain_points, [
      "需要在多个工具之间切换",
    ]),
    currentAlternatives: toStringArray(
      item.currentAlternatives ?? item.current_alternatives,
      ["手动搜索、表格整理、通用聊天工具"],
    ),
  }));

  return scenarios.length > 0
    ? scenarios
    : [
        {
          scenario: "AI 辅助完成复杂任务",
          userType: "目标用户",
          painPoints: ["需要在多个工具之间切换"],
          currentAlternatives: ["手动搜索、表格整理、通用聊天工具"],
        },
      ];
}

function normalizeDifferentiation(rawItems: unknown[]) {
  const items = rawItems.filter(isPlainObject).map((item) => ({
    dimension:
      getStringField(item, ["dimension", "name", "title"]) ||
      "工作流深度",
    currentPattern:
      getStringField(item, ["currentPattern", "current_pattern", "pattern"]) ||
      "多数产品仍以单点功能或通用助手为主。",
    gaps: toStringArray(item.gaps, ["跨工具自动化和结果可解释性仍有缺口"]),
    implications:
      getStringField(item, ["implications", "implication", "insight"]) ||
      "可以通过更完整的 Agent 工作流形成差异化。",
  }));

  return items.length > 0
    ? items
    : [
        {
          dimension: "工作流深度",
          currentPattern: "多数产品仍以单点功能或通用助手为主。",
          gaps: ["跨工具自动化和结果可解释性仍有缺口"],
          implications: "可以通过更完整的 Agent 工作流形成差异化。",
        },
      ];
}

function normalizeOpportunities(rawItems: unknown[], query: string) {
  const opportunities = rawItems.filter(isPlainObject).map((item) => ({
    opportunity_title:
      getStringField(item, ["opportunity_title", "title", "name"]) ||
      `${query} 的 Agent 工作流机会`,
    gap_type:
      getStringField(item, ["gap_type", "gapType", "type"]) || "agent",
    evidence:
      getStringField(item, ["evidence", "reason", "proof"]) ||
      "证据不足：基于模型输出和公开信息推断",
    unmet_need:
      getStringField(item, ["unmet_need", "unmetNeed", "need"]) ||
      "用户需要更低成本地完成信息收集、比较和决策。",
    why_now:
      getStringField(item, ["why_now", "whyNow"]) ||
      "大模型和工具调用能力降低了自动化分析的实现门槛。",
    product_direction:
      getStringField(item, ["product_direction", "productDirection", "direction"]) ||
      "构建面向具体任务的 Agent 分析工作流。",
    priority:
      getStringField(item, ["priority"]) === "Low"
        ? "Low"
        : getStringField(item, ["priority"]) === "Medium"
          ? "Medium"
          : "High",
    priority_reason:
      getStringField(item, ["priority_reason", "priorityReason"]) ||
      "用户价值明确，适合作为 MVP 方向验证。",
    mvp_idea:
      getStringField(item, ["mvp_idea", "mvpIdea", "mvp"]) ||
      "先实现输入关键词后自动生成结构化竞品分析。",
  }));

  return opportunities.length > 0
    ? opportunities
    : [
        {
          opportunity_title: `${query} 的 Agent 工作流机会`,
          gap_type: "agent",
          evidence: "证据不足：模型返回结构不完整",
          unmet_need: "用户需要更低成本地完成信息收集、比较和决策。",
          why_now: "大模型和工具调用能力降低了自动化分析的实现门槛。",
          product_direction: "构建面向具体任务的 Agent 分析工作流。",
          priority: "Medium" as const,
          priority_reason: "适合作为 MVP 方向验证。",
          mvp_idea: "先实现输入关键词后自动生成结构化竞品分析。",
        },
      ];
}

function normalizeAnalysisOutput(
  value: unknown,
  query: string,
): CompetitorAnalysis | unknown {
  if (!isPlainObject(value)) {
    return value;
  }

  const competitors = normalizeCompetitors(
    getArrayField(value, [
      "competitors",
      "products",
      "productAnalysis",
      "competitorAnalysis",
      "competitor_analysis",
    ]),
    query,
  );

  return {
    competitors,
    featureComparison: normalizeFeatureComparison(
      getArrayField(value, [
        "featureComparison",
        "feature_comparison",
        "features",
        "comparison",
        "featureMatrix",
      ]),
      competitors,
    ),
    userScenarios: normalizeUserScenarios(
      getArrayField(value, [
        "userScenarios",
        "user_scenarios",
        "scenarios",
        "useCases",
      ]),
    ),
    differentiationAnalysis: normalizeDifferentiation(
      getArrayField(value, [
        "differentiationAnalysis",
        "differentiation_analysis",
        "differentiation",
        "positioning",
      ]),
    ),
    opportunities: normalizeOpportunities(
      getArrayField(value, [
        "opportunities",
        "opportunity_points",
        "opportunityPoints",
        "insights",
      ]),
      query,
    ),
  };
}

function buildStrictPrompt(query: string, mode: AnalysisMode) {
  const sourceInstruction =
    mode === "web_search"
      ? "优先基于联网搜索获得的当前公开信息；公开信息不足时，请在 evidence 中标注“基于公开信息推断”。"
      : "本次未使用实时联网搜索；请基于模型知识和公开信息推断，并在 evidence 中标注“基于模型知识和公开信息推断”。";

  return `
你是一个高级 AI 产品战略分析 Agent，负责生成结构化竞品分析和可执行产品机会点。

输入对象：${query}
信息来源要求：${sourceInstruction}

请先判断输入是“赛道”还是“产品名”，再选择 3-6 个最相关竞品进行分析。

必须只返回一个 JSON object，不要返回 Markdown、解释文字或代码块。
顶层 JSON 必须且只能包含这些字段：
- competitors: array，3-6 个竞品
- featureComparison: array，3-6 个功能维度
- userScenarios: array，2-5 个用户场景
- differentiationAnalysis: array，3-5 个差异化维度
- opportunities: array，5-8 个机会点

competitors 每项必须包含：
name, product_name, category, positioning, core_features, target_users,
key_scenarios, pricing, workflow_depth, automation_level, agent_capability,
collaboration_support, strengths, weaknesses, evidence。

字段规则：
- name 必须等于 product_name。
- core_features、target_users、key_scenarios、strengths、weaknesses、evidence 都必须是字符串数组。
- workflow_depth、automation_level、agent_capability、collaboration_support 只能是 low / medium / high。
- pricing 不确定时写“未公开 / 基于公开信息推断”。

featureComparison 每项必须包含：
feature, importance, comparison。
importance 只能是 high / medium / low。
comparison 必须是数组，每项包含 competitor, performance, notes。

userScenarios 每项必须包含：
scenario, userType, painPoints, currentAlternatives。
painPoints 和 currentAlternatives 必须是字符串数组。

differentiationAnalysis 每项必须包含：
dimension, currentPattern, gaps, implications。
gaps 必须是字符串数组。

opportunities 每项必须包含：
opportunity_title, gap_type, evidence, unmet_need, why_now,
product_direction, priority, priority_reason, mvp_idea。
gap_type 只能是 用户 / 场景 / 流程 / agent / 商业化。
priority 只能是 High / Medium / Low。

机会点要求：
- 优先输出 AI Agent 工作流、自动化执行、复杂任务拆解相关方向。
- evidence 必须点名相关竞品或对比维度。
- 如果证据不足，evidence 写“证据不足：基于公开信息推断”。
- 所有内容用中文，字段名保持英文。
`.trim();
}

function buildPrompt(query: string, mode: AnalysisMode) {
  const strictPrompt = buildStrictPrompt(query, mode);

  if (strictPrompt) {
    return strictPrompt;
  }

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
  config: AiConfig,
  query: string,
  mode: AnalysisMode,
) {
  if (config.provider === "dashscope") {
    return client.chat.completions.create(
      ({
        model: config.model,
        messages: [{ role: "user", content: buildPrompt(query, mode) }],
        enable_search: mode === "web_search",
        response_format: { type: "json_object" },
        max_tokens: 6000,
      } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
        enable_search: boolean;
      }),
      {
        timeout:
          mode === "web_search"
            ? DASHSCOPE_WEB_SEARCH_TIMEOUT_MS
            : OPENAI_TIMEOUT_MS,
      },
    );
  }

  return client.responses.create(
    {
      model: config.model,
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

function getAnalysisMode(config: AiConfig): AnalysisMode {
  return config.enableWebSearch ? "web_search" : "model_only";
}

function isTimeoutError(error: unknown) {
  return error instanceof Error && /timed? ?out/i.test(error.message);
}

function getOpenAIErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const status = "status" in Object(error) ? String(Object(error).status) : "";
  const code = "code" in Object(error) ? String(Object(error).code) : "";
  const type = "type" in Object(error) ? String(Object(error).type) : "";

  if (
    status === "401" ||
    code === "invalid_api_key" ||
    /invalid_api_key|incorrect api key/i.test(message)
  ) {
    return "OpenAI API Key 无效或已过期，请在 Vercel 环境变量中更新 OPENAI_API_KEY 后重新部署。";
  }

  if (
    /rate_limit/i.test(message) ||
    code === "rate_limit_exceeded"
  ) {
    return "OpenAI 账号请求过于频繁，已触发限流。当前页面会展示示例数据，真实分析请稍后重试。";
  }

  if (/insufficient_quota|billing|quota/i.test(message)) {
    return "OpenAI 账号额度不足或计费状态不可用。当前页面会展示示例数据，请检查 OpenAI 账户余额和 Billing 设置。";
  }

  if (/timed? ?out/i.test(message)) {
    return "AI 请求超时。当前页面会展示示例数据；如果使用 DashScope 联网搜索，请稍后重试或暂时关闭 QWEN_ENABLE_SEARCH。";
  }

  if (status || code || type) {
    const details = [status ? `status=${status}` : null, code ? `code=${code}` : null, type ? `type=${type}` : null]
      .filter(Boolean)
      .join(", ");

    return `OpenAI request failed (${details}). 当前页面会展示示例数据，请检查 Vercel 环境变量和 OpenAI 账户状态。`;
  }

  return "Failed to generate competitor analysis.";
}

function getResponseText(response: Awaited<ReturnType<typeof createAnalysis>>) {
  if ("output_text" in response) {
    return response.output_text;
  }

  return response.choices[0]?.message?.content ?? "";
}

async function generateAnalysis(
  client: OpenAI,
  config: AiConfig,
  query: string,
  mode: AnalysisMode,
) {
  const response = await createAnalysis(client, config, query, mode);
  const outputText = getResponseText(response);
  const analysis = normalizeAnalysisOutput(
    unwrapAnalysisOutput(JSON.parse(outputText ?? "")),
    query,
  );

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

function getCachedAnalysis(
  client: OpenAI,
  config: AiConfig,
  query: string,
  mode: AnalysisMode,
) {
  const now = Date.now();
  const cacheKey = `${mode}:${query}`;
  const cached = analysisCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = generateAnalysis(client, config, query, mode).catch((error) => {
    analysisCache.delete(cacheKey);
    throw error;
  });

  analysisCache.set(cacheKey, {
    expiresAt: now + CACHE_TTL_MS,
    promise,
  });

  return promise;
}

function getFreshCachedAnalysis(query: string, mode: AnalysisMode) {
  const cacheKey = `${mode}:${query}`;
  const cached = analysisCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  return null;
}

async function getAnalysisWithSearchFallback(
  client: OpenAI,
  config: AiConfig,
  query: string,
  mode: AnalysisMode,
) {
  try {
    return await getCachedAnalysis(client, config, query, mode);
  } catch (error) {
    if (
      config.provider === "dashscope" &&
      mode === "web_search" &&
      isTimeoutError(error)
    ) {
      return getCachedAnalysis(client, config, query, "model_only");
    }

    throw error;
  }
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

  const config = getAiConfig(DEFAULT_MODEL);

  if (!config) {
    return errorResponse(
      "OPENAI_CONFIG_MISSING",
      getAiConfigMissingMessage(),
      500,
    );
  }

  const client = createAiClient(config, OPENAI_TIMEOUT_MS);
  const mode = getAnalysisMode(config);

  try {
    const cachedAnalysis = getFreshCachedAnalysis(query, mode);

    if (cachedAnalysis) {
      return NextResponse.json(await cachedAnalysis);
    }

    const quota = await consumeOpenAIDailyQuota();

    if (!quota.allowed) {
      return errorResponse(
        "OPENAI_DAILY_QUOTA_EXCEEDED",
        `Daily public OpenAI quota exceeded. Limit is ${quota.limit} analyses per day.`,
        429,
      );
    }

    const analysis = await getAnalysisWithSearchFallback(
      client,
      config,
      query,
      mode,
    );
    const quotaHeaders: Record<string, string> =
      quota.mode === "enabled"
        ? {
            "X-OpenAI-Daily-Quota-Mode": "enabled",
            "X-OpenAI-Daily-Quota-Limit": String(quota.limit),
            "X-OpenAI-Daily-Quota-Remaining": String(quota.remaining),
            "X-OpenAI-Daily-Quota-Reset": quota.resetAt,
          }
        : {
            "X-OpenAI-Daily-Quota-Mode": "disabled",
          };

    return NextResponse.json(analysis, {
      headers: quotaHeaders,
    });
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
