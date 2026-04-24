import CompareSection from "@/components/compare/compare-section";
import CompareSummary from "@/components/compare/compare-summary";
import type { CompareAnalysis } from "@/components/compare/mock-analyses";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";

type CompareResultContentProps = {
  left: CompareAnalysis;
  right: CompareAnalysis;
};

function countHighPriority(analysis: CompareAnalysis) {
  return analysis.opportunities.filter(
    (item) => (item.recommended_priority ?? item.priority) === "High",
  ).length;
}

function scoreBar(label: string, value: number) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">{label}</p>
        <p className="font-mono text-sm text-neutral-500">{value}/100</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-emerald-700 transition duration-300 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function topOpportunityItems(analysis: CompareAnalysis) {
  return [...analysis.opportunities]
    .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0))
    .slice(0, 3);
}

function getConclusion(left: CompareAnalysis, right: CompareAnalysis) {
  const leftHigh = countHighPriority(left);
  const rightHigh = countHighPriority(right);

  const leftEntryScore =
    leftHigh * 10 +
    left.agentFitScore +
    left.automationScore -
    left.competitors.length * 3;
  const rightEntryScore =
    rightHigh * 10 +
    right.agentFitScore +
    right.automationScore -
    right.competitors.length * 3;

  const betterEntry =
    leftEntryScore >= rightEntryScore ? left.title : right.title;
  const moreCrowded =
    left.competitors.length >= right.competitors.length ? left.title : right.title;
  const strongerAgent =
    left.agentFitScore >= right.agentFitScore ? left.title : right.title;

  return [
    `${betterEntry} 当前更适合作为切入方向，因为高优先级机会、自动化潜力和 Agent 适配度综合更占优。`,
    `${moreCrowded} 的竞争结构更拥挤，现有玩家数量更多，差异化要求也更高。`,
    `${strongerAgent} 的 Agent 机会更强，更适合把自动化执行和任务闭环作为核心卖点。`,
  ];
}

function opportunityList(analysis: CompareAnalysis) {
  return (
    <ul className="space-y-3">
      {topOpportunityItems(analysis).map((item) => (
        <li
          key={item.opportunity_title}
          className="rounded-md border border-neutral-200 bg-white p-3 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-neutral-950">
              {item.opportunity_title}
            </p>
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
              {item.recommended_priority ?? item.priority}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {item.mvp_idea}
          </p>
        </li>
      ))}
    </ul>
  );
}

function mvpList(analysis: CompareAnalysis) {
  return (
    <ul className="space-y-2 text-sm leading-6 text-neutral-700">
      {analysis.mvpIdeas.map((idea) => (
        <li key={idea} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
          <span>{idea}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CompareResultContent({
  left,
  right,
}: CompareResultContentProps) {
  const leftEyebrow = left.source === "live" ? "当前分析" : "分析 A";
  const conclusion = getConclusion(left, right);

  return (
    <section className="space-y-14 py-10 lg:py-12">
      <ScrollReveal delay={0}>
        <section className="space-y-6">
          <SectionHeader
            eyebrow="Comparison Summary"
            title="对比概览"
            description="快速浏览两份分析在竞争密度、机会强度和推荐方向上的差异。"
          />
          <CompareSummary
            left={{
              sideLabel: leftEyebrow,
              title: left.title,
              competitors: left.competitors.length,
              features: left.featureComparison.length,
              highPriority: countHighPriority(left),
              direction: left.recommendedDirection,
            }}
            right={{
              sideLabel: "分析 B",
              title: right.title,
              competitors: right.competitors.length,
              features: right.featureComparison.length,
              highPriority: countHighPriority(right),
              direction: right.recommendedDirection,
            }}
          />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <section className="space-y-6">
          <SectionHeader
            eyebrow="Detailed Compare"
            title="详细对比"
            description="从机会点、自动化、Agent 适配度和 MVP 建议理解两个方向的本质差异。"
          />
          <div className="space-y-6">
            <CompareSection
              title="机会点对比"
              description="对比两边最值得关注的 Top 3 机会点。"
              leftTitle={left.title}
              rightTitle={right.title}
              leftEyebrow={leftEyebrow}
              rightEyebrow="分析 B"
              leftContent={opportunityList(left)}
              rightContent={opportunityList(right)}
            />

            <CompareSection
              title="自动化程度对比"
              description="用轻量评分条表达两条方向的自动化潜力。"
              leftTitle={left.title}
              rightTitle={right.title}
              leftEyebrow={leftEyebrow}
              rightEyebrow="分析 B"
              leftContent={scoreBar("Automation", left.automationScore)}
              rightContent={scoreBar("Automation", right.automationScore)}
            />

            <CompareSection
              title="Agent 适配度对比"
              description="对比哪个方向更适合把 Agent 作为核心产品能力。"
              leftTitle={left.title}
              rightTitle={right.title}
              leftEyebrow={leftEyebrow}
              rightEyebrow="分析 B"
              leftContent={scoreBar("Agent Fit", left.agentFitScore)}
              rightContent={scoreBar("Agent Fit", right.agentFitScore)}
            />

            <CompareSection
              title="推荐 MVP 对比"
              description="对比两边最适合先验证的 MVP 切入方案。"
              leftTitle={left.title}
              rightTitle={right.title}
              leftEyebrow={leftEyebrow}
              rightEyebrow="分析 B"
              leftContent={mvpList(left)}
              rightContent={mvpList(right)}
            />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={160}>
        <section className="space-y-6">
          <SectionHeader
            eyebrow="Conclusion"
            title="对比结论"
            description="基于当前选择生成简短判断，帮助你快速抓住方向差异。"
          />
          <section className="rounded-lg border border-neutral-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(23,23,23,0.05)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm">
            <div className="grid gap-3">
              {conclusion.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 border-t border-neutral-100 pt-3 first:border-t-0 first:pt-0"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                  <p className="text-sm leading-6 text-neutral-700">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </ScrollReveal>
    </section>
  );
}
