"use client";

import AppTopNav from "@/components/AppTopNav";
import CompareResultContent from "@/components/compare/compare-result-content";
import {
  findCompareAnalysis,
  getCompareOptions,
  loadLiveCompareAnalysis,
  mockAnalyses,
  type CompareAnalysis,
} from "@/components/compare/mock-analyses";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CompareResultPageClientProps = {
  initialLeftId?: string;
  initialRightId?: string;
};

function createResultHref(analysis: CompareAnalysis | null) {
  if (!analysis?.query) {
    return null;
  }

  return `/result?q=${encodeURIComponent(analysis.query)}`;
}

export default function CompareResultPageClient({
  initialLeftId,
  initialRightId,
}: CompareResultPageClientProps) {
  const router = useRouter();
  const [liveAnalysis, setLiveAnalysis] = useState<CompareAnalysis | null>(null);
  const [hasCheckedLiveAnalysis, setHasCheckedLiveAnalysis] = useState(false);

  useEffect(() => {
    const storedAnalysis = loadLiveCompareAnalysis();
    const frame = window.requestAnimationFrame(() => {
      setLiveAnalysis(storedAnalysis);
      setHasCheckedLiveAnalysis(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const { left, right } = useMemo(() => {
    const leftOptions = getCompareOptions(liveAnalysis);
    const fallbackLeft = liveAnalysis ?? mockAnalyses[0];
    const selectedLeft = findCompareAnalysis(
      initialLeftId,
      leftOptions,
      fallbackLeft,
    );
    const selectedRightBase = findCompareAnalysis(
      initialRightId,
      mockAnalyses,
      mockAnalyses.find((analysis) => analysis.id !== selectedLeft.id) ??
        mockAnalyses[0],
    );
    const selectedRight =
      selectedRightBase.id === selectedLeft.id
        ? mockAnalyses.find((analysis) => analysis.id !== selectedLeft.id) ??
          selectedRightBase
        : selectedRightBase;

    return { left: selectedLeft, right: selectedRight };
  }, [initialLeftId, initialRightId, liveAnalysis]);

  const backHref = `/compare?${new URLSearchParams({
    left: left.id,
    right: right.id,
  }).toString()}`;
  const fallbackHref = createResultHref(liveAnalysis) ?? "/search";

  function handleGoBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  if (!hasCheckedLiveAnalysis) {
    return (
      <main className="min-h-screen bg-neutral-50 text-neutral-950">
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <AppTopNav current="compare" />
          <div className="flex flex-1 items-center">
            <div>
            <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
              Loading Compare
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal">
              正在读取对比对象
            </h1>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="border-b border-neutral-200 pb-8">
          <AppTopNav current="compare" />

          <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
                Research Compare
              </p>
              <h1 className="mt-4 text-5xl font-semibold tracking-normal sm:text-6xl">
                对比结果
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600">
                对比 {left.title} 与 {right.title} 的市场结构、机会点与推荐方向。
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
                href={backHref}
                className="inline-flex h-11 w-fit items-center justify-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:border-neutral-400 hover:text-neutral-950"
              >
                重新选择
              </Link>
              <Link
                href="/search"
                className="inline-flex h-11 w-fit items-center justify-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:border-neutral-400 hover:text-neutral-950"
              >
                返回搜索页
              </Link>
            </div>
          </div>
        </header>

        <CompareResultContent left={left} right={right} />
      </section>
    </main>
  );
}
