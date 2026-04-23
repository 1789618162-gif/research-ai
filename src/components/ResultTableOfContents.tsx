const tocItems = [
  { href: "#agent-progress", label: "分析进度" },
  { href: "#executive-summary", label: "决策摘要" },
  { href: "#competitors", label: "核心竞品" },
  { href: "#positioning-map", label: "定位地图" },
  { href: "#feature-comparison", label: "功能对比" },
  { href: "#opportunity-insights", label: "机会洞察" },
  { href: "#recommended-direction", label: "推荐方向" },
  { href: "#research-details", label: "研究详情" },
];

export default function ResultTableOfContents() {
  return (
    <nav
      aria-label="结果页目录"
      className="sticky top-0 z-10 -mx-5 border-b border-neutral-200 bg-neutral-50/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 overflow-x-auto">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-normal text-neutral-400">
          目录
        </p>
        <div className="flex min-w-max items-center gap-2">
          {tocItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-neutral-500 transition duration-200 ease-out hover:border-neutral-200 hover:bg-white hover:text-neutral-950"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
