import Link from "next/link";
import SearchInput from "@/components/search/search-input";

const sampleReportHref = `/result?q=${encodeURIComponent("AI 写作工具")}`;

export default function SearchShell() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-3 text-neutral-950"
            aria-label="Research AI 首页"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-neutral-950 text-xs font-semibold text-white">
              AI
            </span>
            <span className="text-sm font-semibold tracking-normal">
              Research AI
            </span>
          </Link>

          <Link
            href="#recent-analysis"
            className="text-sm font-medium text-neutral-500 transition duration-200 ease-out hover:text-neutral-950"
          >
            History
          </Link>
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
          className="grid gap-3 border-t border-neutral-200 py-5 text-sm text-neutral-500 sm:grid-cols-2"
        >
          <Link
            href="#recent-analysis"
            className="flex items-center justify-between rounded-md px-1 py-2 transition duration-200 ease-out hover:text-neutral-950"
          >
            <span>最近分析</span>
            <span className="text-neutral-400">待接入</span>
          </Link>
          <Link
            href={sampleReportHref}
            className="flex items-center justify-between rounded-md px-1 py-2 transition duration-200 ease-out hover:text-neutral-950"
          >
            <span>示例报告</span>
            <span aria-hidden="true">打开</span>
          </Link>
        </footer>
      </section>
    </main>
  );
}
