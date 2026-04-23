"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Analysis = {
  competitors: Array<{
    name: string;
    category: string;
    positioning: string;
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
  opportunities: Array<{
    title: string;
    rationale: string;
    targetUsers: string[];
    suggestedMoves: string[];
    priority: "high" | "medium" | "low";
  }>;
};

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type ResultClientProps = {
  query: string;
};

const priorityLabels = {
  high: "高优先级",
  medium: "中优先级",
  low: "低优先级",
} satisfies Record<Analysis["opportunities"][number]["priority"], string>;

const importanceLabels = {
  high: "高",
  medium: "中",
  low: "低",
} satisfies Record<Analysis["featureComparison"][number]["importance"], string>;

function getErrorMessage(error: ApiError) {
  if (error.error?.code === "OPENAI_CONFIG_MISSING") {
    return "还没有配置 OPENAI_API_KEY。请在 .env.local 中配置后重启开发服务器。";
  }

  return error.error?.message ?? "分析失败，请稍后重试。";
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ResultClient({ query }: ResultClientProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function analyze() {
      setIsLoading(true);
      setError(null);
      setAnalysis(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as Analysis | ApiError;

        if (!response.ok) {
          setError(getErrorMessage(payload as ApiError));
          return;
        }

        setAnalysis(payload as Analysis);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError("网络请求失败，请确认开发服务器正在运行。");
      } finally {
        setIsLoading(false);
      }
    }

    analyze();

    return () => controller.abort();
  }, [query]);

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
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="border-b border-stone-300/70 pb-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-950"
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
            </Link>
            <span className="rounded-md border border-stone-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-stone-600">
              {isLoading ? "Analyzing" : analysis ? "Live result" : "Action needed"}
            </span>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase text-emerald-800">
                Analysis result
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-normal sm:text-6xl">
                {query}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
                页面会调用 <code className="font-mono">POST /api/analyze</code>{" "}
                获取结构化竞品分析，包含竞品、功能、场景、差异和机会点。
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-stone-300/70 border-y border-stone-300/70 py-5 text-center lg:grid-cols-1 lg:divide-x-0 lg:divide-y lg:border-y-0 lg:border-l lg:py-0 lg:pl-6 lg:text-left">
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">{summary.competitors}</p>
                <p className="mt-1 text-sm text-stone-500">竞品数量</p>
              </div>
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">{summary.features}</p>
                <p className="mt-1 text-sm text-stone-500">功能维度</p>
              </div>
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">
                  {summary.opportunities}
                </p>
                <p className="mt-1 text-sm text-stone-500">机会点</p>
              </div>
            </div>
          </div>
        </header>

        {isLoading && (
          <section className="py-16">
            <div className="border-y border-stone-300/70 py-10">
              <p className="text-sm font-medium uppercase text-emerald-800">
                Calling OpenAI
              </p>
              <h2 className="mt-4 text-3xl font-semibold">正在分析公开信息...</h2>
              <p className="mt-4 max-w-2xl leading-7 text-stone-600">
                开启 Web search 后通常需要多等几秒。完成后这里会替换为真实分析结果。
              </p>
            </div>
          </section>
        )}

        {error && (
          <section className="py-16">
            <div className="border-y border-red-200 bg-red-50/70 px-5 py-10 text-red-950">
              <p className="text-sm font-medium uppercase text-red-700">
                Request failed
              </p>
              <h2 className="mt-4 text-3xl font-semibold">暂时无法生成分析</h2>
              <p className="mt-4 max-w-2xl leading-7">{error}</p>
            </div>
          </section>
        )}

        {analysis && (
          <section className="grid gap-12 py-10 lg:grid-cols-[360px_1fr] lg:py-12">
            <aside>
              <div className="sticky top-6">
                <p className="text-sm font-medium text-stone-500">核心竞品</p>
                <div className="mt-5 divide-y divide-stone-300/70 border-y border-stone-300/70">
                  {analysis.competitors.map((item, index) => (
                    <article key={item.name} className="py-6">
                      <div className="flex items-start gap-4">
                        <span className="font-mono text-sm text-stone-400">
                          0{index + 1}
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase text-emerald-800">
                            {item.category}
                          </p>
                          <h2 className="mt-2 text-lg font-semibold text-stone-950">
                            {item.name}
                          </h2>
                          <p className="mt-3 text-base leading-7 text-stone-600">
                            {item.positioning}
                          </p>
                          <List items={item.evidence} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </aside>

            <section className="space-y-12">
              <section>
                <div className="border-b border-stone-300/70 pb-5">
                  <p className="text-sm font-medium text-stone-500">功能对比</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950">
                    Feature comparison
                  </h2>
                </div>
                <div className="divide-y divide-stone-300/70">
                  {analysis.featureComparison.map((feature) => (
                    <article key={feature.feature} className="py-7">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-semibold text-stone-950">
                          {feature.feature}
                        </h3>
                        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          重要性：{importanceLabels[feature.importance]}
                        </span>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {feature.comparison.map((item) => (
                          <div
                            key={`${feature.feature}-${item.competitor}`}
                            className="rounded-md border border-stone-300 bg-white/70 p-4"
                          >
                            <h4 className="font-semibold text-stone-950">
                              {item.competitor}
                            </h4>
                            <p className="mt-2 text-sm font-medium text-stone-700">
                              {item.performance}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                              {item.notes}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid gap-8 xl:grid-cols-2">
                <div>
                  <div className="border-b border-stone-300/70 pb-5">
                    <p className="text-sm font-medium text-stone-500">用户场景</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                      User scenarios
                    </h2>
                  </div>
                  <div className="divide-y divide-stone-300/70">
                    {analysis.userScenarios.map((scenario) => (
                      <article key={scenario.scenario} className="py-6">
                        <p className="text-sm font-medium text-emerald-800">
                          {scenario.userType}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">
                          {scenario.scenario}
                        </h3>
                        <List items={scenario.painPoints} />
                      </article>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="border-b border-stone-300/70 pb-5">
                    <p className="text-sm font-medium text-stone-500">机会点</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                      Opportunities
                    </h2>
                  </div>
                  <div className="divide-y divide-stone-300/70">
                    {analysis.opportunities.map((opportunity) => (
                      <article key={opportunity.title} className="py-6">
                        <span className="rounded-md bg-stone-950 px-2.5 py-1 text-xs font-medium text-white">
                          {priorityLabels[opportunity.priority]}
                        </span>
                        <h3 className="mt-4 text-xl font-semibold">
                          {opportunity.title}
                        </h3>
                        <p className="mt-3 text-base leading-7 text-stone-600">
                          {opportunity.rationale}
                        </p>
                        <List items={opportunity.suggestedMoves} />
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <div className="border-b border-stone-300/70 pb-5">
                  <p className="text-sm font-medium text-stone-500">差异分析</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                    Differentiation analysis
                  </h2>
                </div>
                <div className="divide-y divide-stone-300/70">
                  {analysis.differentiationAnalysis.map((item) => (
                    <article
                      key={item.dimension}
                      className="grid gap-4 py-7 md:grid-cols-[180px_1fr]"
                    >
                      <h3 className="text-xl font-semibold">{item.dimension}</h3>
                      <div>
                        <p className="leading-7 text-stone-700">
                          {item.currentPattern}
                        </p>
                        <List items={item.gaps} />
                        <p className="mt-4 leading-7 text-stone-600">
                          {item.implications}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}
