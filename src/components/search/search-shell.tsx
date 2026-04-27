"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppTopNav from "@/components/AppTopNav";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import SearchInput from "@/components/search/search-input";
import { readStoredHistory } from "../../../lib/history/storage";

const sampleReportHref = `/result?q=${encodeURIComponent("AI 写作工具")}`;
const transitionMs = 650;
const searchBootMs = 900;

function isReloadNavigation() {
  if (typeof performance === "undefined") {
    return false;
  }

  const [navigation] = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[];

  return navigation?.type === "reload";
}

export default function SearchShell() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBootLoading, setIsBootLoading] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [transitionLabel, setTransitionLabel] = useState("Competition workspace");

  useEffect(() => {
    const countTimer = window.setTimeout(() => {
      setHistoryCount(readStoredHistory().length);
    }, 0);

    if (!isReloadNavigation()) {
      return () => {
        window.clearTimeout(countTimer);
      };
    }

    const startTimer = window.setTimeout(() => {
      setTransitionLabel("Loading search workspace");
      setIsBootLoading(true);
    }, 0);

    const endTimer = window.setTimeout(() => {
      setIsBootLoading(false);
    }, searchBootMs);

    return () => {
      window.clearTimeout(countTimer);
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, []);

  function navigateWithTransition(
    href: string,
    label = "Competition workspace",
  ) {
    setTransitionLabel(label);
    setIsTransitioning(true);
    window.setTimeout(() => {
      router.push(href);
    }, transitionMs);
  }

  return (
    <>
      <PageTransitionOverlay
        visible={isTransitioning || isBootLoading}
        label={transitionLabel}
      />

      <main className="min-h-screen bg-neutral-50 text-neutral-950">
        <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <header>
            <AppTopNav current="search" />
          </header>

          <div className="flex flex-1 items-center justify-center py-16 sm:py-20">
            <section className="w-full text-center">
              <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
                Competitive research
              </p>
              <h1 className="group mx-auto mt-5 inline-flex max-w-3xl flex-col items-center text-5xl font-semibold tracking-normal text-neutral-950 transition duration-300 ease-out hover:-translate-y-0.5 hover:text-emerald-900 sm:text-6xl">
                <span>你想研究什么？</span>
                <span
                  aria-hidden="true"
                  className="mt-3 h-px w-10 origin-center scale-x-0 bg-emerald-800/70 transition duration-300 ease-out group-hover:scale-x-100"
                />
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
                输入一个赛道、产品或问题，开始生成竞品与机会分析。
              </p>

              <div className="mt-10">
                <SearchInput />
              </div>
            </section>
          </div>

          <footer
            id="recent-analysis"
            className="grid gap-3 border-t border-neutral-200 py-5 text-sm text-neutral-500 md:grid-cols-3"
          >
            <button
              type="button"
              onClick={() =>
                navigateWithTransition("/history", "Opening research archive")
              }
              className="flex items-center justify-between rounded-md px-1 py-2 text-left transition duration-200 ease-out hover:text-neutral-950"
            >
              <span>最近分析</span>
              <span className="text-neutral-400">打开</span>
            </button>
            <Link
              href={sampleReportHref}
              className="flex items-center justify-between rounded-md px-1 py-2 transition duration-200 ease-out hover:text-neutral-950"
            >
              <span>示例报告</span>
              <span aria-hidden="true">打开</span>
            </Link>
            <div className="rounded-md px-1 py-2">
              <span className="block font-semibold text-neutral-700">
                本地工作区
              </span>
              <span className="mt-1 block text-xs leading-5 text-neutral-400">
                {historyCount > 0
                  ? `本地已沉淀 ${historyCount} 条研究记录`
                  : "历史与设置保存在当前浏览器"}
              </span>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}
