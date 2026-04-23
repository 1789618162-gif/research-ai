import type { CompetitorOverviewItem } from "@/components/CompetitorOverview";
import type { OpportunityInsight } from "@/components/OpportunityInsights";
import SectionHeader from "@/components/SectionHeader";

type ExecutiveSummaryProps = {
  query: string;
  competitors: CompetitorOverviewItem[];
  opportunities: OpportunityInsight[];
  featureCount: number;
};

function getTopOpportunity(opportunities: OpportunityInsight[]) {
  return [...opportunities].sort((a, b) => {
    const scoreA = a.total_score ?? (a.priority === "High" ? 30 : 20);
    const scoreB = b.total_score ?? (b.priority === "High" ? 30 : 20);
    return scoreB - scoreA;
  })[0];
}

export default function ExecutiveSummary({
  query,
  competitors,
  opportunities,
  featureCount,
}: ExecutiveSummaryProps) {
  const topOpportunity = getTopOpportunity(opportunities);
  const topCompetitors = competitors
    .slice(0, 3)
    .map((item) => item.product_name ?? item.name)
    .join("、");
  const highPriorityCount = opportunities.filter(
    (item) => (item.recommended_priority ?? item.priority) === "High",
  ).length;

  const findings = [
    `已识别 ${competitors.length} 个核心竞品：${topCompetitors || "暂无竞品数据"}。`,
    `共完成 ${featureCount} 个关键能力对比，重点关注自动化、Agent 和流程闭环。`,
    `${highPriorityCount || opportunities.length} 个机会点值得进入验证池，优先看可快速 MVP 化的工作流。`,
  ];

  return (
    <section id="executive-summary" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Executive Summary"
        title="决策摘要"
        description="先看结论、关键发现和优先验证方向"
      />

      <div className="mt-6 border-y border-neutral-200 bg-white px-5 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-normal text-neutral-950">
              {query} 的机会不在单点生成，而在把研究、写作、改写和交付串成可执行工作流。
            </h2>

            <div className="mt-6 grid gap-3">
              {findings.map((finding, index) => (
                <div
                  key={finding}
                  className="flex gap-3 border-t border-neutral-100 pt-3 first:border-t-0 first:pt-0"
                >
                  <span className="font-mono text-sm text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-6 text-neutral-700">
                    {finding}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
              Priority Bet
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-neutral-950">
              {topOpportunity?.opportunity_title ?? "先验证最高频用户流程"}
            </h3>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              {topOpportunity?.priority_reason ??
                "优先选择用户频次高、结果可验收、能够体现 Agent 自动化价值的场景。"}
            </p>

            <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-emerald-900">
                Recommended Entry
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-950">
                {topOpportunity?.product_direction ??
                  "以单一岗位工作流切入，先做从输入目标到交付物生成的一条闭环。"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
