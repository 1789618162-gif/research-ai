import Link from "next/link";
import ResultClient from "./result-client";

type ResultPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    history?: string | string[];
  }>;
};

function getFirstSearchValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const query = getFirstSearchValue(params.q).trim();
  const historyId = getFirstSearchValue(params.history).trim();

  if (!query) {
    return (
      <main className="min-h-screen bg-stone-100 px-5 py-5 text-stone-950 sm:px-8">
        <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-4xl flex-col justify-center border-y border-stone-300/70 py-16">
          <p className="text-sm font-medium uppercase text-emerald-800">
            Empty query
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-normal sm:text-6xl">
            还没有可分析的赛道或产品名。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
            返回搜索页输入一个关键词，系统会调用 API 并生成结构化竞品分析。
          </p>
          <Link
            href="/search"
            className="mt-10 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-md bg-stone-950 px-5 text-base font-semibold text-white transition hover:bg-emerald-800"
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
            返回搜索页
          </Link>
        </section>
      </main>
    );
  }

  return <ResultClient query={query} historyId={historyId || undefined} />;
}
