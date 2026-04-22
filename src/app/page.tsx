"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const examples = ["AI 搜索", "AI 写作工具", "智能客服 SaaS"];
const analysisSteps = ["识别玩家", "拆解定位", "提炼机会"];

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const normalizedKeyword = keyword.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedKeyword) {
      return;
    }

    router.push(`/result?q=${encodeURIComponent(normalizedKeyword)}`);
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-stone-300/70 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-stone-950 text-sm font-semibold text-white">
              AI
            </div>
            <div>
              <h1 className="text-base font-semibold text-stone-950">
                AI 竞品分析工具
              </h1>
              <p className="text-sm text-stone-500">Competition workspace</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-stone-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Frontend prototype
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_440px] lg:py-16">
          <section className="max-w-3xl">
            <p className="text-sm font-medium uppercase text-emerald-800">
              Market scan
            </p>
            <h2 className="mt-5 max-w-4xl text-5xl font-semibold tracking-normal text-stone-950 sm:text-6xl lg:text-7xl">
              用一个关键词启动竞品分析。
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              输入赛道或产品名，先得到一份清晰的分析框架：竞品类型、差异化维度、机会点与风险提示。
            </p>

            <div className="mt-12 grid gap-4 border-y border-stone-300/70 py-6 sm:grid-cols-3">
              {analysisSteps.map((step, index) => (
                <div key={step}>
                  <p className="font-mono text-sm text-stone-400">
                    0{index + 1}
                  </p>
                  <p className="mt-2 text-base font-medium text-stone-900">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-stone-300/80 bg-white/80 p-4 shadow-[0_24px_80px_rgba(28,25,23,0.08)] backdrop-blur">
            <div className="rounded-md border border-stone-200 bg-stone-50 p-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-stone-500">
                    新建分析
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-stone-950">
                    选择研究对象
                  </h3>
                </div>
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                  Ready
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label
                    className="text-sm font-medium text-stone-700"
                    htmlFor="keyword"
                  >
                    赛道 / 产品名
                  </label>
                  <input
                    id="keyword"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="例如：AI 搜索"
                    className="mt-2 h-[52px] w-full rounded-md border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:ring-4 focus:ring-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!normalizedKeyword}
                  className="group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-md bg-stone-950 px-5 text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                >
                  开始分析
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              </form>

              <div className="mt-6">
                <p className="text-sm font-medium text-stone-500">
                  快速示例
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setKeyword(example)}
                      className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition hover:border-stone-950 hover:text-stone-950"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-stone-200 px-1 py-4 text-center">
              <div>
                <p className="text-lg font-semibold text-stone-950">5</p>
                <p className="text-xs text-stone-500">模块</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-stone-950">3</p>
                <p className="text-xs text-stone-500">竞品类型</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-stone-950">0</p>
                <p className="text-xs text-stone-500">接口依赖</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
