"use client";

import CompareSelector from "@/components/compare/compare-selector";
import {
  getCompareOptions,
  getDefaultRightCompareId,
  LIVE_COMPARE_ANALYSIS_ID,
  loadLiveCompareAnalysis,
  mockAnalyses,
  type CompareAnalysis,
} from "@/components/compare/mock-analyses";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ComparePageClientProps = {
  initialLeftId?: string;
  initialRightId?: string;
};

function hasMockAnalysis(id?: string) {
  return Boolean(id && mockAnalyses.some((analysis) => analysis.id === id));
}

function createResultHref(analysis: CompareAnalysis | null) {
  if (!analysis?.query) {
    return null;
  }

  return `/result?q=${encodeURIComponent(analysis.query)}`;
}

export default function ComparePageClient({
  initialLeftId,
  initialRightId,
}: ComparePageClientProps) {
  const router = useRouter();
  const [liveAnalysis, setLiveAnalysis] = useState<CompareAnalysis | null>(null);
  const [leftId, setLeftId] = useState(
    hasMockAnalysis(initialLeftId) ? initialLeftId! : mockAnalyses[0].id,
  );
  const [rightId, setRightId] = useState(
    hasMockAnalysis(initialRightId) ? initialRightId! : mockAnalyses[1].id,
  );

  useEffect(() => {
    const storedAnalysis = loadLiveCompareAnalysis();

    if (!storedAnalysis) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const shouldUseLive =
        !initialLeftId || initialLeftId === LIVE_COMPARE_ANALYSIS_ID;

      setLiveAnalysis(storedAnalysis);

      if (shouldUseLive) {
        setLeftId(LIVE_COMPARE_ANALYSIS_ID);
        setRightId(
          hasMockAnalysis(initialRightId)
            ? initialRightId!
            : getDefaultRightCompareId(LIVE_COMPARE_ANALYSIS_ID),
        );
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [initialLeftId, initialRightId]);

  const leftAnalyses = useMemo(
    () => getCompareOptions(liveAnalysis),
    [liveAnalysis],
  );
  const rightAnalyses = mockAnalyses;
  const left =
    leftAnalyses.find((analysis) => analysis.id === leftId) ?? leftAnalyses[0];
  const right =
    rightAnalyses.find((analysis) => analysis.id === rightId) ??
    rightAnalyses.find((analysis) => analysis.id !== left.id) ??
    rightAnalyses[0];
  const isSameMockSelection = left.source === "mock" && left.id === right.id;
  const fallbackHref = createResultHref(liveAnalysis) ?? "/search";

  function handleGoBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  function handleLeftChange(nextId: string) {
    setLeftId(nextId);

    if (nextId === right.id) {
      setRightId(getDefaultRightCompareId(nextId));
    }
  }

  function handleStartCompare() {
    if (isSameMockSelection) {
      return;
    }

    const params = new URLSearchParams({
      left: left.id,
      right: right.id,
    });

    router.push(`/compare/result?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
                Research Compare
              </p>
              <h1 className="mt-4 text-5xl font-semibold tracking-normal sm:text-6xl">
                分析对比
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600">
                先选择两份研究结果，再进入对比页面查看市场结构、机会点与推荐方向差异。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex h-11 w-fit items-center justify-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:border-neutral-400 hover:text-neutral-950"
              >
                返回上一级
              </button>
              <Link
                href="/search"
                className="inline-flex h-11 w-fit items-center justify-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:border-neutral-400 hover:text-neutral-950"
              >
                返回搜索页
              </Link>
            </div>
          </div>
        </header>

        <section className="py-10 lg:py-12">
          <ScrollReveal delay={0}>
            <section className="space-y-6">
              <SectionHeader
                eyebrow="Compare Selector"
                title="选择研究结果"
                description="确认分析 A 和分析 B 后，再生成完整对比视图。"
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <CompareSelector
                  label="分析 A"
                  side="left"
                  value={left.id}
                  analyses={leftAnalyses}
                  onChange={handleLeftChange}
                />
                <CompareSelector
                  label="分析 B"
                  side="right"
                  value={right.id}
                  analyses={rightAnalyses}
                  onChange={setRightId}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-neutral-500">
                  {isSameMockSelection
                    ? "请选择两个不同研究结果。"
                    : `${left.title} 将与 ${right.title} 进行对比。`}
                </p>
                <button
                  type="button"
                  onClick={handleStartCompare}
                  disabled={isSameMockSelection}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-neutral-950 px-5 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  开始对比
                </button>
              </div>
            </section>
          </ScrollReveal>
        </section>
      </section>
    </main>
  );
}
