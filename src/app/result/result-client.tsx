"use client";

import CollapsibleSection from "@/components/CollapsibleSection";
import CompetitorOverview from "@/components/CompetitorOverview";
import AgentProgress, {
  type AgentProgressStatus,
} from "@/components/AgentProgress";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import OpportunityInsights from "@/components/OpportunityInsights";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import PositioningMap from "@/components/PositioningMap";
import RecommendedProductDirection from "@/components/RecommendedProductDirection";
import ResultTableOfContents from "@/components/ResultTableOfContents";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import {
  createLiveCompareAnalysis,
  saveLiveCompareAnalysis,
} from "@/components/compare/mock-analyses";
import {
  createStoredHistoryRecord,
  findStoredHistoryRecord,
} from "../../../lib/history/storage";
import type { AnalysisResult } from "../../../lib/history/types";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
type Analysis = AnalysisResult;

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type ResultClientProps = {
  query: string;
  historyId?: string;
};

type ResultContentShellProps = {
  children: ReactNode;
};

const requestCache = new Map<string, Promise<Analysis>>();
const transitionMs = 650;

const importanceLabels = {
  high: "高",
  medium: "中",
  low: "低",
} satisfies Record<Analysis["featureComparison"][number]["importance"], string>;

const importanceStyles = {
  high: "border-red-200 bg-red-50 text-red-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-neutral-200 bg-neutral-100 text-neutral-700",
} satisfies Record<Analysis["featureComparison"][number]["importance"], string>;

function ResultContentShell({ children }: ResultContentShellProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={`transition duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

const demoAnalysis: Analysis = {
  competitors: [
    {
      name: "Notion AI",
      product_name: "Notion AI",
      category: "文档协作型 AI 写作",
      positioning: "嵌入知识库和团队文档的写作助手。",
      core_features: ["写作", "总结", "知识库结合"],
      target_users: ["个人创作者", "团队协作用户"],
      key_scenarios: ["文档写作", "知识管理", "会议总结"],
      pricing: "约 10 USD / month",
      workflow_depth: "medium",
      automation_level: "medium",
      closed_loop_capability: "medium",
      agent_capability: "low",
      collaboration_support: "high",
      strengths: ["文档上下文强", "协作场景自然", "模板入口清晰"],
      weaknesses: ["跨工具自动化弱", "复杂任务拆解不足"],
      evidence: [
        "示例数据：Notion AI 强在文档和知识库场景，但跨工具自动化和 Agent 执行较弱。",
      ],
    },
    {
      name: "ChatGPT",
      product_name: "ChatGPT",
      category: "通用 AI 助手",
      positioning: "覆盖写作、分析、代码和通用问答的多能力入口。",
      core_features: ["问答", "写作", "分析", "代码辅助"],
      target_users: ["个人用户", "开发者", "知识工作者"],
      key_scenarios: ["内容生成", "知识检索", "编程辅助"],
      pricing: "免费 / Plus 订阅",
      workflow_depth: "medium",
      automation_level: "medium",
      closed_loop_capability: "low",
      agent_capability: "medium",
      collaboration_support: "low",
      strengths: ["能力覆盖广", "创作质量稳定", "对话式改稿自然"],
      weaknesses: ["岗位流程不够行业化", "团队协作和交付闭环较弱"],
      evidence: [
        "示例数据：ChatGPT 能生成内容，但面向团队流程和结构化交付仍需要人工推进。",
      ],
    },
    {
      name: "Copy.ai",
      product_name: "Copy.ai",
      category: "营销写作工具",
      positioning: "面向营销团队的内容生成和文案模板平台。",
      core_features: ["营销文案", "模板生成", "批量改写"],
      target_users: ["市场团队", "增长团队", "销售团队"],
      key_scenarios: ["广告文案", "邮件营销", "销售触达"],
      pricing: "免费 / 付费订阅",
      workflow_depth: "medium",
      automation_level: "medium",
      closed_loop_capability: "medium",
      agent_capability: "low",
      collaboration_support: "medium",
      strengths: ["营销模板丰富", "批量生成方便", "上手成本低"],
      weaknesses: ["深度研究弱", "长链路内容策略不足"],
      evidence: [
        "示例数据：Copy.ai 覆盖营销文案，但从研究到发布的链路支持有限。",
      ],
    },
  ],
  featureComparison: [
    {
      feature: "长文内容规划",
      importance: "high",
      comparison: [
        { competitor: "Notion AI", performance: "中", notes: "依赖文档结构" },
        {
          competitor: "ChatGPT",
          performance: "高",
          notes: "规划强但需要人工管理版本",
        },
        {
          competitor: "Copy.ai",
          performance: "中",
          notes: "更偏短文案模板",
        },
      ],
    },
    {
      feature: "素材研究",
      importance: "high",
      comparison: [
        { competitor: "Notion AI", performance: "中", notes: "偏内部知识" },
        {
          competitor: "ChatGPT",
          performance: "中",
          notes: "需要外部资料配合",
        },
        { competitor: "Copy.ai", performance: "低", notes: "研究链路较浅" },
      ],
    },
    {
      feature: "跨平台发布准备",
      importance: "medium",
      comparison: [
        { competitor: "Notion AI", performance: "低", notes: "主要停留在文档内" },
        { competitor: "ChatGPT", performance: "低", notes: "需要人工复制分发" },
        {
          competitor: "Copy.ai",
          performance: "中",
          notes: "营销场景集成较多",
        },
      ],
    },
  ],
  userScenarios: [
    {
      scenario: "从选题到初稿",
      userType: "内容运营",
      painPoints: ["选题研究分散", "初稿结构反复调整"],
      currentAlternatives: ["搜索资料", "ChatGPT 起草", "人工整理大纲"],
    },
    {
      scenario: "长文改写成多平台内容",
      userType: "新媒体编辑",
      painPoints: ["平台口吻不同", "重复改写耗时"],
      currentAlternatives: ["手工改写", "多个模板工具"],
    },
  ],
  differentiationAnalysis: [
    {
      dimension: "流程闭环",
      currentPattern: "多数工具停留在生成内容。",
      gaps: ["缺少从研究、写作、审批到发布的闭环"],
      implications: "可以用 Agent 串起完整写作任务链。",
    },
    {
      dimension: "岗位化深度",
      currentPattern: "通用助手强，岗位流程弱。",
      gaps: ["内容运营、市场、销售话术缺少专属流程"],
      implications: "垂直工作流比单点生成更容易差异化。",
    },
  ],
  opportunities: [
    {
      opportunity_title: "面向内容运营的选题到初稿 Agent",
      gap_type: "流程",
      evidence:
        "Notion AI 的 agent_capability=low，ChatGPT 的 collaboration_support=low，Copy.ai 的 workflow_depth=medium，三者都未完整覆盖选题研究到初稿交付。",
      unmet_need:
        "内容运营需要把资料收集、角度判断、大纲生成和初稿写作压缩成一个连续流程。",
      why_now:
        "长文本模型和工具调用能力已经能承担资料整理、结构规划和多轮改稿。",
      product_direction:
        "构建写作 Agent，将选题、资料摘要、大纲、初稿和改稿建议串成任务流。",
      priority: "High",
      priority_reason:
        "用户频次高、节省时间明显，并且适合作为 MVP 单场景切入。",
      mvp_idea: "先支持输入主题后生成资料清单、大纲和一版公众号初稿。",
      user_value: 9,
      differentiation: 8,
      feasibility: 8,
      agent_fit: 9,
      total_score: 34,
      recommended_priority: "High",
      recommendation_reason:
        "用户价值和 Agent 匹配度都很高，且可以用单一写作工作流快速验证 MVP。",
    },
    {
      opportunity_title: "一键多平台改写与发布准备",
      gap_type: "场景",
      evidence:
        "ChatGPT 能改写但 collaboration_support=low，Notion AI 停留在文档场景，Copy.ai 更偏广告文案，跨平台内容适配覆盖不足。",
      unmet_need:
        "编辑希望把一篇长文快速拆成小红书、公众号、LinkedIn 等不同版本。",
      why_now:
        "模型能识别语气、长度、标题和 CTA 差异，适合做平台化变体生成。",
      product_direction:
        "提供多平台内容适配器，自动生成标题、正文、摘要、标签和发布检查项。",
      priority: "High",
      priority_reason: "价值直观、结果可立即验收，差异化强。",
      mvp_idea: "先支持将一篇长文改写成 3 个平台版本，并给出修改原因。",
      user_value: 8,
      differentiation: 8,
      feasibility: 9,
      agent_fit: 8,
      total_score: 33,
      recommended_priority: "High",
      recommendation_reason:
        "结果可直接验收，跨平台适配痛点明确，适合作为高优先级切入点。",
    },
    {
      opportunity_title: "品牌语气和合规检查 Agent",
      gap_type: "agent",
      evidence:
        "Notion AI 的 collaboration_support=high 但 agent_capability=low，ChatGPT 缺少稳定品牌规则记忆，Copy.ai 更强调生成，品牌一致性审查不足。",
      unmet_need:
        "团队需要在发布前自动检查品牌语气、禁用词、事实风险和合规问题。",
      why_now:
        "RAG 和规则化检查可以结合模型判断，降低人工审核成本。",
      product_direction:
        "建立品牌规则库，让 Agent 对内容逐段标注风险并给出修订建议。",
      priority: "Medium",
      priority_reason:
        "企业价值高，但需要配置品牌规则，MVP 复杂度中等。",
      mvp_idea: "先支持上传品牌规范，检查一篇文章并输出风险清单。",
      user_value: 7,
      differentiation: 7,
      feasibility: 6,
      agent_fit: 8,
      total_score: 28,
      recommended_priority: "Medium",
      recommendation_reason:
        "企业价值明确，Agent 匹配度较高，但需要品牌规则配置，MVP 落地复杂度中等。",
    },
  ],
};

function createDemoAnalysis(query: string) {
  return {
    ...demoAnalysis,
    competitors: demoAnalysis.competitors.map((competitor) => ({
      ...competitor,
      evidence: competitor.evidence.map((item) => `${item}（查询：${query}）`),
    })),
  };
}

function historySnapshotNotice(isDemo: boolean) {
  return isDemo
    ? "当前查看的是已保存的示例分析快照。"
    : "当前查看的是已保存的分析快照。";
}

function getErrorMessage(error: ApiError) {
  if (error.error?.code === "OPENAI_CONFIG_MISSING") {
    return "还没有配置 OPENAI_API_KEY。请在 .env.local 中配置后重启开发服务器。";
  }

  return error.error?.message ?? "真实 AI 分析暂不可用，已切换为示例数据。";
}

function fetchAnalysis(query: string) {
  const cached = requestCache.get(query);

  if (cached) {
    return cached;
  }

  const request = fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
    .then(async (response) => {
      const payload = (await response.json()) as Analysis | ApiError;

      if (!response.ok) {
        throw new Error(getErrorMessage(payload as ApiError));
      }

      return payload as Analysis;
    })
    .catch((error) => {
      requestCache.delete(query);
      throw error;
    });

  requestCache.set(query, request);
  return request;
}

function FeatureComparison({
  features,
}: {
  features: Analysis["featureComparison"];
}) {
  return (
    <section id="feature-comparison" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Feature Comparison"
        title="功能对比"
        description="快速定位能力差异和优先补强项"
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.feature}
            className="rounded-md border border-neutral-200 bg-white/60 p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-neutral-950">
                {feature.feature}
              </h3>
              <span
                className={`rounded-md border px-2 py-1 text-xs font-semibold ${importanceStyles[feature.importance]}`}
              >
                {importanceLabels[feature.importance]}
              </span>
            </div>
            <div className="mt-5 divide-y divide-neutral-100">
              {feature.comparison.map((item) => (
                <div
                  key={`${feature.feature}-${item.competitor}`}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-neutral-900">
                      {item.competitor}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {item.performance}
                    </p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-600">
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ResearchDetails({ analysis }: { analysis: Analysis }) {
  return (
    <CollapsibleSection
      id="research-details"
      title="研究详情"
      eyebrow="Supporting analysis"
      description="展开查看用户场景和差异分析"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-neutral-950">用户场景</h3>
          <div className="mt-4 divide-y divide-neutral-200">
            {analysis.userScenarios.map((scenario) => (
              <article key={scenario.scenario} className="py-5 first:pt-0">
                <p className="text-sm font-medium text-emerald-800">
                  {scenario.userType}
                </p>
                <h4 className="mt-2 text-lg font-semibold text-neutral-950">
                  {scenario.scenario}
                </h4>
                <DetailList items={scenario.painPoints} />
              </article>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-neutral-950">差异分析</h3>
          <div className="mt-4 divide-y divide-neutral-200">
            {analysis.differentiationAnalysis.map((item) => (
              <article key={item.dimension} className="py-5 first:pt-0">
                <h4 className="text-lg font-semibold text-neutral-950">
                  {item.dimension}
                </h4>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {item.currentPattern}
                </p>
                <DetailList items={item.gaps} />
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {item.implications}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}

export default function ResultClient({
  query,
  historyId,
}: ResultClientProps) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionLabel, setTransitionLabel] = useState("Competition workspace");
  const [showAgentProgress, setShowAgentProgress] = useState(true);
  const [agentProgressStatus, setAgentProgressStatus] =
    useState<AgentProgressStatus>("loading");
  const [showResultsContent, setShowResultsContent] = useState(false);

  function navigateWithTransition(
    href: string,
    label = "Competition workspace",
  ) {
    if (isTransitioning) {
      return;
    }

    setTransitionLabel(label);
    setIsTransitioning(true);
    window.setTimeout(() => {
      router.push(href);
    }, transitionMs);
  }

  function handleReturnHome() {
    navigateWithTransition("/search", "Returning to search");
  }

  function handleOpenHistory() {
    navigateWithTransition("/history", "Opening research archive");
  }

  function handleOpenCompare() {
    if (isLoading || !analysis) {
      return;
    }

    saveLiveCompareAnalysis(createLiveCompareAnalysis(query, analysis));
    navigateWithTransition("/compare", "Opening compare workspace");
  }

  useEffect(() => {
    let isActive = true;

    async function analyze() {
      setIsLoading(true);
      setAnalysis(null);
      setNotice(null);
      setIsDemo(false);
      setIsTransitioning(false);
      setShowAgentProgress(true);
      setShowResultsContent(false);
      setAgentProgressStatus("loading");

      if (historyId) {
        const storedRecord = findStoredHistoryRecord(historyId);

        if (storedRecord) {
          if (!isActive) {
            return;
          }

          setAnalysis(storedRecord.analysis);
          setIsDemo(Boolean(storedRecord.isDemo));
          setNotice(historySnapshotNotice(Boolean(storedRecord.isDemo)));
          setIsLoading(false);
          setAgentProgressStatus("complete");
          return;
        }
      }

      try {
        const result = await fetchAnalysis(query);

        if (!isActive) {
          return;
        }

        setAnalysis(result);
        const historyRecord = createStoredHistoryRecord({
          query,
          analysis: result,
        });
        window.history.replaceState(null, "", historyRecord.resultHref);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        const fallback = createDemoAnalysis(query);
        setAnalysis(fallback);
        setIsDemo(true);
        setNotice(
          requestError instanceof Error
            ? requestError.message
            : "真实 AI 分析暂不可用，已切换为示例数据。",
        );
        const historyRecord = createStoredHistoryRecord({
          query,
          analysis: fallback,
          isDemo: true,
        });
        window.history.replaceState(null, "", historyRecord.resultHref);
      } finally {
        if (isActive) {
          setIsLoading(false);
          setAgentProgressStatus("complete");
        }
      }
    }

    analyze();

    return () => {
      isActive = false;
    };
  }, [historyId, query]);

  const summary = useMemo(() => {
    if (!analysis) {
      return { competitors: "-", features: "-", opportunities: "-" };
    }

    return {
      competitors: analysis.competitors.length.toString(),
      features: analysis.featureComparison.length.toString(),
      opportunities: analysis.opportunities.length.toString(),
    };
  }, [analysis]);

  return (
    <main className="min-h-screen scroll-smooth bg-neutral-50 text-neutral-950">
      <PageTransitionOverlay
        visible={isTransitioning}
        label={transitionLabel}
      />
      <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleReturnHome}
              aria-label="返回输入首页"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition duration-200 ease-out hover:text-neutral-950"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              重新输入
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenHistory}
                disabled={isTransitioning}
                className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 transition duration-200 ease-out hover:border-neutral-400 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                历史记录
              </button>
              <span className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600">
                {isLoading ? "分析中" : isDemo ? "示例数据" : "实时结果"}
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
                Analysis result
              </p>
              <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-normal sm:text-6xl">
                {query}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
                聚焦核心竞品与可执行机会，详细研究信息已收进折叠区。
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-neutral-200 border-y border-neutral-200 py-4 text-center lg:grid-cols-1 lg:divide-x-0 lg:divide-y lg:border-y-0 lg:border-l lg:py-0 lg:pl-6 lg:text-left">
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">{summary.competitors}</p>
                <p className="mt-1 text-sm text-neutral-500">竞品</p>
              </div>
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">{summary.features}</p>
                <p className="mt-1 text-sm text-neutral-500">功能</p>
              </div>
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">
                  {summary.opportunities}
                </p>
                <p className="mt-1 text-sm text-neutral-500">机会</p>
              </div>
            </div>
          </div>
        </header>

        {isLoading && (
          <section className="py-16">
            <div className="border-y border-neutral-200 py-10">
              <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
                Calling OpenAI
              </p>
              <h2 className="mt-4 text-3xl font-semibold">
                正在生成分析...
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-neutral-600">
                完成后将展示核心竞品、功能对比和机会洞察。
              </p>
            </div>
          </section>
        )}

        {showAgentProgress && (
          <section className={isLoading ? "pb-16" : "pt-10"}>
            <AgentProgress
              key={historyId ? `${query}-${historyId}` : query}
              status={agentProgressStatus}
              onDone={() => {
                setShowAgentProgress(false);
                setShowResultsContent(true);
              }}
            />
          </section>
        )}

        {analysis && !isLoading && showResultsContent && (
          <ResultContentShell key={historyId ? `history-${historyId}` : `results-${query}`}>
            <ResultTableOfContents
              canCompare={Boolean(analysis) && !isTransitioning}
              onCompareClick={handleOpenCompare}
            />

            {notice && (
              <section className="pt-6">
                <div className="border-y border-amber-200 bg-amber-50/80 px-5 py-4 text-amber-950">
                  <p className="text-sm font-semibold">
                    {isDemo ? "当前为示例数据" : "当前为已保存快照"}
                  </p>
                  <p className="mt-2 text-sm leading-6">{notice}</p>
                </div>
              </section>
            )}

            <section className="space-y-14 py-10 lg:py-12">
              <ScrollReveal delay={0}>
                <ExecutiveSummary
                  query={query}
                  competitors={analysis.competitors}
                  opportunities={analysis.opportunities}
                  featureCount={analysis.featureComparison.length}
                />
              </ScrollReveal>
              <ScrollReveal delay={80}>
                <CompetitorOverview
                  id="competitors"
                  competitors={analysis.competitors}
                />
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <PositioningMap competitors={analysis.competitors} />
              </ScrollReveal>
              <ScrollReveal delay={160}>
                <FeatureComparison features={analysis.featureComparison} />
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <OpportunityInsights
                  id="opportunity-insights"
                  opportunities={analysis.opportunities}
                />
              </ScrollReveal>
              <ScrollReveal delay={240}>
                <RecommendedProductDirection
                  competitors={analysis.competitors}
                  opportunities={analysis.opportunities}
                  userScenarios={analysis.userScenarios}
                />
              </ScrollReveal>
              <ScrollReveal delay={280}>
                <ResearchDetails analysis={analysis} />
              </ScrollReveal>
              <ScrollReveal delay={320}>
                <section className="grid gap-4 rounded-lg border border-neutral-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(23,23,23,0.05)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-normal text-emerald-800">
                      Final Step
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-neutral-950">
                      最后一步：把当前分析放进对比工作台
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      将当前结果作为分析 A，选择另一个研究结果生成横向对比判断。
                      {isDemo ? " 当前会使用示例数据进入对比。" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCompare}
                    disabled={isTransitioning}
                    className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-neutral-950 px-5 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                  >
                    进入对比分析
                  </button>
                </section>
              </ScrollReveal>
            </section>
          </ResultContentShell>
        )}
      </section>
    </main>
  );
}
