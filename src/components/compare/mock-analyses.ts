import type {
  CapabilityLevel,
  CompetitorOverviewItem,
} from "@/components/CompetitorOverview";
import type { OpportunityInsight } from "@/components/OpportunityInsights";

export const COMPARE_LIVE_ANALYSIS_STORAGE_KEY = "compare:left-analysis";
export const LIVE_COMPARE_ANALYSIS_ID = "live-current";

export type CompareFeatureComparisonItem = {
  feature: string;
  importance: "high" | "medium" | "low";
  comparison: Array<{
    competitor: string;
    performance: string;
    notes: string;
  }>;
};

export type CompareAnalysis = {
  id: string;
  title: string;
  category: string;
  summary: string;
  competitors: CompetitorOverviewItem[];
  featureComparison: CompareFeatureComparisonItem[];
  opportunities: OpportunityInsight[];
  recommendedDirection: string;
  automationScore: number;
  agentFitScore: number;
  mvpIdeas: string[];
  source: "live" | "mock";
  query?: string;
};

export type CompareAnalysisInput = {
  competitors: CompetitorOverviewItem[];
  featureComparison: CompareFeatureComparisonItem[];
  opportunities: OpportunityInsight[];
};

const capabilityScoreMap: Record<CapabilityLevel, number> = {
  low: 40,
  medium: 68,
  high: 88,
};

function clampScore(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function average(values: Array<number | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number");

  if (valid.length === 0) {
    return undefined;
  }

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function capabilityToScore(value?: CapabilityLevel) {
  return value ? capabilityScoreMap[value] : undefined;
}

function capabilityToRank(value?: CapabilityLevel) {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function getClosedLoopCapability(
  competitor: CompetitorOverviewItem,
): CapabilityLevel {
  if (competitor.closed_loop_capability) {
    return competitor.closed_loop_capability;
  }

  const score =
    capabilityToRank(competitor.workflow_depth) +
    capabilityToRank(competitor.automation_level) +
    capabilityToRank(competitor.agent_capability);

  if (score >= 8) return "high";
  if (score >= 5) return "medium";
  return "low";
}

function topOpportunities(opportunities: OpportunityInsight[]) {
  return [...opportunities].sort((left, right) => {
    const leftPriority = left.recommended_priority ?? left.priority;
    const rightPriority = right.recommended_priority ?? right.priority;
    const priorityWeight = { High: 3, Medium: 2, Low: 1 } as const;

    return (
      priorityWeight[rightPriority] - priorityWeight[leftPriority] ||
      (right.total_score ?? 0) - (left.total_score ?? 0)
    );
  });
}

function deriveRecommendedDirection(opportunities: OpportunityInsight[]) {
  return (
    topOpportunities(opportunities)[0]?.product_direction ||
    "优先围绕高频任务链路建立差异化切入点。"
  );
}

function deriveAutomationScore(competitors: CompetitorOverviewItem[]) {
  const score = average(
    competitors.flatMap((competitor) => [
      capabilityToScore(competitor.automation_level),
      capabilityToScore(getClosedLoopCapability(competitor)),
    ]),
  );

  return clampScore(score ?? 60);
}

function deriveAgentFitScore(
  competitors: CompetitorOverviewItem[],
  opportunities: OpportunityInsight[],
) {
  const competitorScore = average(
    competitors.map((competitor) => capabilityToScore(competitor.agent_capability)),
  );
  const opportunityScore = average(
    opportunities.map((opportunity) =>
      typeof opportunity.agent_fit === "number"
        ? clampScore(opportunity.agent_fit * 10)
        : undefined,
    ),
  );

  if (typeof competitorScore === "number" && typeof opportunityScore === "number") {
    return clampScore((competitorScore + opportunityScore) / 2);
  }

  return clampScore(competitorScore ?? opportunityScore ?? 60);
}

function deriveCategory(query: string, competitors: CompetitorOverviewItem[]) {
  return competitors[0]?.category || `${query} 研究`;
}

function deriveSummary(
  query: string,
  analysis: CompareAnalysisInput,
  recommendedDirection: string,
) {
  return `围绕 ${query} 的当前分析，覆盖 ${analysis.competitors.length} 个核心竞品、${analysis.featureComparison.length} 个功能维度和 ${analysis.opportunities.length} 条机会判断。推荐方向：${recommendedDirection}`;
}

function deriveMvpIdeas(opportunities: OpportunityInsight[]) {
  const ideas = topOpportunities(opportunities)
    .map((opportunity) => opportunity.mvp_idea)
    .filter(Boolean)
    .slice(0, 3);

  return ideas.length > 0 ? ideas : ["优先验证一个高频任务的最小闭环。"];
}

export function createLiveCompareAnalysis(
  query: string,
  analysis: CompareAnalysisInput,
): CompareAnalysis {
  const recommendedDirection = deriveRecommendedDirection(analysis.opportunities);

  return {
    id: LIVE_COMPARE_ANALYSIS_ID,
    title: query,
    query,
    category: deriveCategory(query, analysis.competitors),
    summary: deriveSummary(query, analysis, recommendedDirection),
    competitors: analysis.competitors,
    featureComparison: analysis.featureComparison,
    opportunities: analysis.opportunities,
    recommendedDirection,
    automationScore: deriveAutomationScore(analysis.competitors),
    agentFitScore: deriveAgentFitScore(
      analysis.competitors,
      analysis.opportunities,
    ),
    mvpIdeas: deriveMvpIdeas(analysis.opportunities),
    source: "live",
  };
}

export function saveLiveCompareAnalysis(analysis: CompareAnalysis) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    COMPARE_LIVE_ANALYSIS_STORAGE_KEY,
    JSON.stringify({ ...analysis, id: LIVE_COMPARE_ANALYSIS_ID }),
  );
}

export function loadLiveCompareAnalysis(): CompareAnalysis | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(COMPARE_LIVE_ANALYSIS_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CompareAnalysis>;

    if (
      typeof parsed?.title !== "string" ||
      !Array.isArray(parsed?.competitors) ||
      !Array.isArray(parsed?.featureComparison) ||
      !Array.isArray(parsed?.opportunities)
    ) {
      window.sessionStorage.removeItem(COMPARE_LIVE_ANALYSIS_STORAGE_KEY);
      return null;
    }

    return {
      id: LIVE_COMPARE_ANALYSIS_ID,
      title: parsed.title,
      query: parsed.query,
      competitors: parsed.competitors,
      featureComparison: parsed.featureComparison,
      opportunities: parsed.opportunities,
      category: parsed.category || "实时分析",
      summary: parsed.summary || "当前分析结果已带入对比工作区。",
      recommendedDirection:
        parsed.recommendedDirection || "优先围绕高频任务链路建立差异化切入点。",
      automationScore:
        typeof parsed.automationScore === "number" ? parsed.automationScore : 60,
      agentFitScore:
        typeof parsed.agentFitScore === "number" ? parsed.agentFitScore : 60,
      mvpIdeas:
        Array.isArray(parsed.mvpIdeas) && parsed.mvpIdeas.length > 0
          ? parsed.mvpIdeas
          : ["优先验证一个高频任务的最小闭环。"],
      source: "live",
    };
  } catch {
    window.sessionStorage.removeItem(COMPARE_LIVE_ANALYSIS_STORAGE_KEY);
    return null;
  }
}

export function getDefaultRightCompareId(leftId: string) {
  return (
    mockAnalyses.find((analysis) => analysis.id !== leftId)?.id ??
    mockAnalyses[0]?.id ??
    ""
  );
}

export function getCompareOptions(liveAnalysis: CompareAnalysis | null) {
  return liveAnalysis ? [liveAnalysis, ...mockAnalyses] : mockAnalyses;
}

export function findCompareAnalysis(
  id: string | undefined,
  options: CompareAnalysis[],
  fallback: CompareAnalysis,
) {
  return options.find((analysis) => analysis.id === id) ?? fallback;
}

function createCompetitor(
  name: string,
  category: string,
  workflow: CapabilityLevel,
  automation: CapabilityLevel,
  agent: CapabilityLevel,
): CompetitorOverviewItem {
  return {
    name,
    product_name: name,
    category,
    positioning: `${name} 面向该赛道提供结构化 AI 工作流。`,
    core_features: ["AI 生成", "任务辅助", "内容整理"],
    target_users: ["个人用户", "团队用户"],
    key_scenarios: ["日常工作", "资料整理", "效率提升"],
    pricing: "订阅制 / 分层定价",
    workflow_depth: workflow,
    automation_level: automation,
    closed_loop_capability: getClosedLoopCapability({
      name,
      product_name: name,
      category,
      positioning: "",
      workflow_depth: workflow,
      automation_level: automation,
      agent_capability: agent,
      strengths: [],
      weaknesses: [],
      evidence: [],
    }),
    agent_capability: agent,
    collaboration_support: workflow,
    strengths: ["品牌认知较强", "已有稳定场景入口"],
    weaknesses: ["任务闭环不足", "仍需要人工接力"],
    evidence: ["Mock 数据，用于 compare 页面演示。"],
  };
}

function createOpportunity(
  title: string,
  gapType: string,
  priority: "High" | "Medium" | "Low",
  totalScore: number,
  mvpIdea: string,
  direction: string,
): OpportunityInsight {
  return {
    opportunity_title: title,
    gap_type: gapType,
    evidence:
      "多个现有产品没有完整覆盖该任务链路，mock 分析显示仍存在可切入空间。",
    unmet_need:
      "用户希望用更少步骤拿到可交付结果，而不是停留在单点生成。",
    product_direction: direction,
    mvp_idea: mvpIdea,
    priority,
    priority_reason: "机会强度、落地速度与差异化程度综合较高。",
    total_score: totalScore,
    agent_fit: Math.max(5, Math.min(10, Math.round(totalScore / 4))),
  };
}

export const mockAnalyses: CompareAnalysis[] = [
  {
    id: "ai-writing",
    title: "AI 写作工具",
    category: "内容生产",
    summary: "关注从选题、起稿到多平台改写的内容工作流。",
    competitors: [
      createCompetitor("Notion AI", "文档协作 AI", "medium", "medium", "low"),
      createCompetitor("ChatGPT", "通用 AI 助手", "medium", "medium", "medium"),
      createCompetitor("Copy.ai", "营销写作平台", "medium", "medium", "low"),
    ],
    featureComparison: [
      { feature: "长文规划", importance: "high", comparison: [] },
      { feature: "多平台改写", importance: "high", comparison: [] },
      { feature: "品牌语气约束", importance: "medium", comparison: [] },
    ],
    opportunities: [
      createOpportunity(
        "选题到初稿 Agent",
        "流程",
        "High",
        34,
        "输入主题后生成资料清单、大纲和第一版初稿。",
        "围绕内容运营建立研究到写作闭环。",
      ),
      createOpportunity(
        "一键多平台改写",
        "场景",
        "High",
        33,
        "把一篇长文改成 3 个平台版本，并解释改写原因。",
        "把内容复用效率变成核心价值主张。",
      ),
      createOpportunity(
        "品牌与合规检查 Agent",
        "agent",
        "Medium",
        28,
        "上传品牌规范并输出风险清单。",
        "把生成后的质检做成稳定流程。",
      ),
    ],
    recommendedDirection: "优先切入内容运营的研究到交付闭环。",
    automationScore: 72,
    agentFitScore: 81,
    mvpIdeas: ["选题研究清单", "大纲生成", "多平台改写"],
    source: "mock",
  },
  {
    id: "ai-search",
    title: "AI 搜索",
    category: "信息获取",
    summary: "关注检索、答案整合、来源可信度与行动建议。",
    competitors: [
      createCompetitor("Perplexity", "答案引擎", "medium", "medium", "medium"),
      createCompetitor("ChatGPT Search", "对话搜索", "medium", "medium", "medium"),
      createCompetitor("Arc Search", "浏览器搜索", "low", "low", "low"),
      createCompetitor("Google AI Overviews", "搜索增强", "medium", "low", "low"),
    ],
    featureComparison: [
      { feature: "答案整合", importance: "high", comparison: [] },
      { feature: "来源可信度", importance: "high", comparison: [] },
      { feature: "后续行动建议", importance: "medium", comparison: [] },
      { feature: "研究链路记忆", importance: "medium", comparison: [] },
    ],
    opportunities: [
      createOpportunity(
        "面向专业研究的可验证搜索工作台",
        "用户",
        "High",
        36,
        "先做问题拆解、来源评分和结论摘要的单页工作台。",
        "把可信度、证据链和可追溯结论作为核心卖点。",
      ),
      createOpportunity(
        "搜索到行动的决策 Agent",
        "agent",
        "High",
        35,
        "围绕单一任务输出建议动作、风险和下一步。",
        "把搜索结果直接转成任务建议和行动框架。",
      ),
      createOpportunity(
        "持续研究项目记忆",
        "流程",
        "Medium",
        29,
        "保留主题上下文并生成阶段性研究笔记。",
        "把一次性搜索扩展为可持续的研究项目。",
      ),
    ],
    recommendedDirection: "优先服务需要证据链和结论可信度的专业研究场景。",
    automationScore: 78,
    agentFitScore: 88,
    mvpIdeas: ["来源评分", "证据引用", "行动建议生成"],
    source: "mock",
  },
  {
    id: "customer-service-saas",
    title: "智能客服 SaaS",
    category: "客户服务",
    summary: "关注客户意图识别、自动回复、工单协同与闭环运营。",
    competitors: [
      createCompetitor("Intercom Fin", "客服 Agent", "high", "high", "high"),
      createCompetitor("Zendesk AI", "工单平台 AI", "high", "medium", "medium"),
      createCompetitor("Ada", "自动客服", "high", "high", "medium"),
    ],
    featureComparison: [
      { feature: "自动回复", importance: "high", comparison: [] },
      { feature: "人工接管协同", importance: "high", comparison: [] },
      { feature: "知识库联动", importance: "medium", comparison: [] },
    ],
    opportunities: [
      createOpportunity(
        "中小团队客服闭环 Agent",
        "商业化",
        "Medium",
        27,
        "先做 FAQ 自动回复和升级工单联动。",
        "从轻量客服团队切入，强调低配置快速上线。",
      ),
      createOpportunity(
        "售后问题归因面板",
        "场景",
        "Medium",
        25,
        "自动聚类高频问题并生成改进建议。",
        "把客服从响应工具扩展到运营洞察工具。",
      ),
      createOpportunity(
        "客服训练反馈闭环",
        "流程",
        "Low",
        21,
        "生成回复评分和培训建议。",
        "把客服质量控制做成连续训练机制。",
      ),
    ],
    recommendedDirection: "优先从轻量客服自动化切入，再逐步扩展到运营闭环。",
    automationScore: 84,
    agentFitScore: 74,
    mvpIdeas: ["FAQ 自动回复", "升级工单", "问题聚类"],
    source: "mock",
  },
];
