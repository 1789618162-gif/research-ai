import Link from "next/link";

type ResultPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

const competitors = [
  {
    name: "头部平台型产品",
    position: "完整工作流、强品牌认知、生态入口优势明显。",
  },
  {
    name: "垂直场景产品",
    position: "聚焦高频任务，交互更轻，适合用效率和准确性切入。",
  },
  {
    name: "开源或插件方案",
    position: "成本低、可定制，但交付体验和稳定性差异较大。",
  },
];

const modules = [
  {
    title: "概览",
    label: "Market context",
    content:
      "从目标用户、核心任务、付费意愿和替代方案判断竞争密度与切入价值。",
  },
  {
    title: "差异化维度",
    label: "Positioning",
    content:
      "比较数据质量、交互效率、结果可解释性、协作能力、行业模板和集成能力。",
  },
  {
    title: "机会点",
    label: "Openings",
    content: "寻找头部产品尚未充分覆盖的细分人群、垂直流程或强交付场景。",
  },
  {
    title: "风险提示",
    label: "Risk",
    content: "关注模型成本、同质化功能、获客渠道依赖、数据合规和企业采购周期。",
  },
];

function getFirstSearchValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const query = getFirstSearchValue(params.q).trim();

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
            返回首页输入一个关键词，即可查看竞品分析结果页的基础结构。
          </p>
          <Link
            href="/"
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
            返回首页
          </Link>
        </section>
      </main>
    );
  }

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
              Prototype
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
                以下是面向产品定位与机会判断的竞品分析骨架，可作为后续接入真实
                AI 输出的页面基础。
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-stone-300/70 border-y border-stone-300/70 py-5 text-center lg:grid-cols-1 lg:divide-x-0 lg:divide-y lg:border-y-0 lg:border-l lg:py-0 lg:pl-6 lg:text-left">
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">5</p>
                <p className="mt-1 text-sm text-stone-500">分析模块</p>
              </div>
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">3</p>
                <p className="mt-1 text-sm text-stone-500">竞品类型</p>
              </div>
              <div className="py-0 lg:py-4">
                <p className="text-2xl font-semibold">Demo</p>
                <p className="mt-1 text-sm text-stone-500">当前状态</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-12 py-10 lg:grid-cols-[360px_1fr] lg:py-12">
          <aside>
            <div className="sticky top-6">
              <p className="text-sm font-medium text-stone-500">核心竞品</p>
              <div className="mt-5 divide-y divide-stone-300/70 border-y border-stone-300/70">
                {competitors.map((item, index) => (
                  <article key={item.name} className="py-6">
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-sm text-stone-400">
                        0{index + 1}
                      </span>
                      <div>
                        <h2 className="text-lg font-semibold text-stone-950">
                          {item.name}
                        </h2>
                        <p className="mt-3 text-base leading-7 text-stone-600">
                          {item.position}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="flex items-end justify-between gap-6 border-b border-stone-300/70 pb-5">
              <div>
                <p className="text-sm font-medium text-stone-500">分析模块</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950">
                  决策视角
                </h2>
              </div>
              <p className="hidden max-w-xs text-right text-sm leading-6 text-stone-500 sm:block">
                保持模块简洁，便于未来替换为真实模型输出。
              </p>
            </div>

            <div className="divide-y divide-stone-300/70">
              {modules.map((module, index) => (
                <article
                  key={module.title}
                  className="grid gap-4 py-7 transition hover:bg-white/50 sm:grid-cols-[120px_1fr]"
                >
                  <div className="flex items-center gap-3 sm:block">
                    <p className="font-mono text-sm text-stone-400">
                      0{index + 1}
                    </p>
                    <p className="text-sm font-medium text-emerald-800 sm:mt-3">
                      {module.label}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-stone-950">
                      {module.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
                      {module.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
