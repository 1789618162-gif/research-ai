"use client";

import CompareSection from "@/components/compare/compare-section";
import CompareSelector from "@/components/compare/compare-selector";
import CompareSummary from "@/components/compare/compare-summary";
import {
  getDefaultRightCompareId,
  loadLiveCompareAnalysis,
  mockAnalyses,
  type CompareAnalysis,
} from "@/components/compare/mock-analyses";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { useEffect, useMemo, useState } from "react";

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
    `${betterEntry} 当前更适合作为切入点，因为高优先级机会更多，且 Agent 适配度更占优。`,
    `${moreCrowded} 的竞争结构更拥挤，现有玩家数量更多，差异化要求也更高。`,
    `${strongerAgent} 的 Agent 机会更强，更适合把自动化执行和任务闭环作为核心卖点。`,
  ];
}

export default function ComparePage() {
  const [liveAnalysis, setLiveAnalysis] = useState<CompareAnalysis | null>(null);
  const [leftId, setLeftId] = useState(mockAnalyses[0].id);
  const [rightId, setRightId] = useState(mockAnalyses[1].id);

  useEffect(() => {
    const storedAnalysis = loadLiveCompareAnalysis();

    if (!storedAnalysis) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setLiveAnalysis(storedAnalysis);
      setLeftId(storedAnalysis.id);
      setRightId(getDefaultRightCompareId(storedAnalysis.id));
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const leftAnalyses = useMemo(
    () => (liveAnalysis ? [liveAnalysis, ...mockAnalyses] : mockAnalyses),
    [liveAnalysis],
  );

  const rightAnalyses = mockAnalyses;

  const left = useMemo(
    () => leftAnalyses.find((analysis) => analysis.id === leftId) ?? leftAnalyses[0],
    [leftAnalyses, leftId],
  );

  const right = useMemo(() => {
    const selected =
      rightAnalyses.find((analysis) => analysis.id === rightId) ??
      rightAnalyses[0];

    if (selected.id !== left.id) {
      return selected;
    }

    return (
      rightAnalyses.find((analysis) => analysis.id !== left.id) ??
      rightAnalyses[0]
    );
  }, [left.id, rightAnalyses, rightId]);

  function handleLeftChange(nextId: string) {
    setLeftId(nextId);

    if (nextId === right.id) {
      setRightId(getDefaultRightCompareId(nextId));
    }
  }

  const conclusion = getConclusion(left, right);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="border-b border-neutral-200 pb-8">
          <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
            Research Compare
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
            <div>
              <h1 className="text-5xl font-semibold tracking-normal sm:text-6xl">
                分析对比
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600">
                对比不同研究结果的市场结构、机会点与推荐方向。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-neutral-200 bg-white/80 p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
                    Left analysis
                  </p>
                  <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    {left.source === "live" ? "当前分析" : "Mock 基准"}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-neutral-950">
                  {left.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {left.summary}
                </p>
              </div>

              <div className="rounded-md border border-neutral-200 bg-white/80 p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
                    Right analysis
                  </p>
                  <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    Mock 基准
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-neutral-950">
                  {right.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {right.summary}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-14 py-10 lg:py-12">
          <ScrollReveal delay={0}>
            <section className="space-y-6">
              <SectionHeader
                eyebrow="Compare Selector"
                title="选择研究结果"
                description="左侧可直接使用当前分析，右侧保留为 mock 基准，帮助你快速建立参照。"
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <CompareSelector
                  label="左侧分析"
                  side="left"
                  value={leftId}
                  analyses={leftAnalyses}
                  onChange={handleLeftChange}
                />
                <CompareSelector
                  label="右侧分析"
                  side="right"
                  value={right.id}
                  analyses={rightAnalyses}
                  onChange={setRightId}
                />
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <section className="space-y-6">
              <SectionHeader
                eyebrow="Comparison Summary"
                title="对比概览"
                description="快速浏览两份分析在竞争密度、机会强度和推荐方向上的差异。"
              />
              <CompareSummary
                left={{
                  sideLabel: left.source === "live" ? "当前分析" : "左侧分析",
                  title: left.title,
                  competitors: left.competitors.length,
                  features: left.featureComparison.length,
                  highPriority: countHighPriority(left),
                  direction: left.recommendedDirection,
                }}
                right={{
                  sideLabel: "右侧分析",
                  title: right.title,
                  competitors: right.competitors.length,
                  features: right.featureComparison.length,
                  highPriority: countHighPriority(right),
                  direction: right.recommendedDirection,
                }}
              />
            </section>
          </ScrollReveal>

          <ScrollReveal delay={140}>
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
                  leftEyebrow={left.source === "live" ? "当前分析" : "左侧分析"}
                  rightEyebrow="右侧分析"
                  leftContent={
                    <ul className="space-y-3">
                      {topOpportunityItems(left).map((item) => (
                        <li
                          key={item.opportunity_title}
                          className="rounded-md border border-neutral-200 bg-white p-3 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-neutral-950">
                              {item.opportunity_title}
                            </p>
                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                              {item.priority}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-neutral-600">
                            {item.mvp_idea}
                          </p>
                        </li>
                      ))}
                    </ul>
                  }
                  rightContent={
                    <ul className="space-y-3">
                      {topOpportunityItems(right).map((item) => (
                        <li
                          key={item.opportunity_title}
                          className="rounded-md border border-neutral-200 bg-white p-3 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-neutral-950">
                              {item.opportunity_title}
                            </p>
                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                              {item.priority}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-neutral-600">
                            {item.mvp_idea}
                          </p>
                        </li>
                      ))}
                    </ul>
                  }
                />

                <CompareSection
                  title="自动化程度对比"
                  description="用轻量评分条表达两条方向的自动化潜力。"
                  leftTitle={left.title}
                  rightTitle={right.title}
                  leftEyebrow={left.source === "live" ? "当前分析" : "左侧分析"}
                  rightEyebrow="右侧分析"
                  leftContent={scoreBar("Automation", left.automationScore)}
                  rightContent={scoreBar("Automation", right.automationScore)}
                />

                <CompareSection
                  title="Agent 适配度对比"
                  description="对比哪个方向更适合把 Agent 作为核心产品能力。"
                  leftTitle={left.title}
                  rightTitle={right.title}
                  leftEyebrow={left.source === "live" ? "当前分析" : "左侧分析"}
                  rightEyebrow="右侧分析"
                  leftContent={scoreBar("Agent Fit", left.agentFitScore)}
                  rightContent={scoreBar("Agent Fit", right.agentFitScore)}
                />

                <CompareSection
                  title="推荐 MVP 对比"
                  description="对比两边最适合先验证的 MVP 切入方案。"
                  leftTitle={left.title}
                  rightTitle={right.title}
                  leftEyebrow={left.source === "live" ? "当前分析" : "左侧分析"}
                  rightEyebrow="右侧分析"
                  leftContent={
                    <ul className="space-y-2 text-sm leading-6 text-neutral-700">
                      {left.mvpIdeas.map((idea) => (
                        <li key={idea} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  }
                  rightContent={
                    <ul className="space-y-2 text-sm leading-6 text-neutral-700">
                      {right.mvpIdeas.map((idea) => (
                        <li key={idea} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  }
                />
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <section className="space-y-6">
              <SectionHeader
                eyebrow="Conclusion"
                title="对比结论"
                description="基于当前分析和 mock 基准生成简短判断，帮助你快速抓住方向差异。"
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
      </section>
    </main>
  );
}
