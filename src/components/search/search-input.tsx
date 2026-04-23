"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ExampleChips from "@/components/search/example-chips";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";

const examples = [
  "智能客服 SaaS",
  "AI 写作工具",
  "面向中小企业的 CRM",
  "在线教育 Agent 产品",
];

export default function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const normalizedQuery = query.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedQuery) {
      return;
    }

    setIsTransitioning(true);
    window.setTimeout(() => {
      router.push(`/result?q=${encodeURIComponent(normalizedQuery)}`);
    }, 650);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageTransitionOverlay visible={isTransitioning} />
      <form onSubmit={handleSubmit} className="w-full">
        <label htmlFor="research-query" className="sr-only">
          输入研究主题
        </label>
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_24px_80px_rgba(23,23,23,0.08)] transition duration-200 ease-out focus-within:border-neutral-400 focus-within:shadow-[0_28px_90px_rgba(23,23,23,0.12)] sm:flex-row">
          <input
            id="research-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入赛道、产品或问题"
            className="min-h-14 flex-1 rounded-md bg-transparent px-4 text-base text-neutral-950 outline-none placeholder:text-neutral-400 sm:text-lg"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!normalizedQuery}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-950 px-5 text-base font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 sm:h-14"
          >
            开始分析
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </form>

      <ExampleChips examples={examples} onSelect={setQuery} />
    </div>
  );
}
