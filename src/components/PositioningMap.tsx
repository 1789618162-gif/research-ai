import type {
  CapabilityLevel,
  CompetitorOverviewItem,
} from "@/components/CompetitorOverview";
import SectionHeader from "@/components/SectionHeader";

type PositioningMapProps = {
  competitors: CompetitorOverviewItem[];
};

const levelToPercent = {
  low: 16,
  medium: 50,
  high: 84,
} satisfies Record<CapabilityLevel, number>;

const levelToLabel = {
  low: "低",
  medium: "中",
  high: "高",
} satisfies Record<CapabilityLevel, string>;

const agentTone = {
  high: {
    dot: "bg-emerald-700 ring-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  medium: {
    dot: "bg-amber-500 ring-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  low: {
    dot: "bg-neutral-500 ring-neutral-200",
    text: "text-neutral-700",
    border: "border-neutral-200",
  },
} satisfies Record<CapabilityLevel, { dot: string; text: string; border: string }>;

function scoreLevel(value?: CapabilityLevel) {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function enterpriseLevel(competitor: CompetitorOverviewItem): CapabilityLevel {
  const score =
    scoreLevel(competitor.collaboration_support) +
    scoreLevel(competitor.workflow_depth);

  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function offsetPoint(index: number) {
  const offsets = [
    [0, 0],
    [4, -4],
    [-4, 4],
    [5, 5],
    [-5, -5],
    [0, 6],
  ];

  return offsets[index % offsets.length];
}

function buildInsights(competitors: CompetitorOverviewItem[]) {
  const highAutomation = competitors.filter(
    (competitor) => competitor.automation_level === "high",
  ).length;
  const highAgent = competitors.filter(
    (competitor) => competitor.agent_capability === "high",
  ).length;
  const enterpriseHeavy = competitors.filter(
    (competitor) => enterpriseLevel(competitor) === "high",
  ).length;

  return [
    `当前共有 ${competitors.length} 个竞品进入地图，其中 ${highAutomation} 个具备高自动化能力。`,
    `高 Agent 能力竞品数量为 ${highAgent}，可用于判断 Agent 闭环是否已经成为主流能力。`,
    enterpriseHeavy >= competitors.length / 2
      ? "多数竞品偏企业适配，低门槛高自动化区域更适合作为轻量 MVP 切入。"
      : "企业门槛较高的竞品占比有限，仍存在面向个人或小团队的效率型机会。",
  ];
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-700">{value}</span>
    </div>
  );
}

export default function PositioningMap({ competitors }: PositioningMapProps) {
  const insights = buildInsights(competitors);

  return (
    <section id="positioning-map" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Positioning Map"
        title="定位地图"
        description="用自动化程度和企业适配判断竞品分布"
      />

      <div className="mt-6 rounded-md border border-neutral-200 bg-white/70 p-5 transition duration-200 ease-out hover:border-neutral-300 hover:bg-white hover:shadow-sm">
        <div className="relative h-[460px] overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          <div className="absolute inset-x-8 top-1/2 border-t border-dashed border-neutral-300" />
          <div className="absolute inset-y-8 left-1/2 border-l border-dashed border-neutral-300" />

          <div className="absolute left-[58%] top-[54%] h-[34%] w-[30%] rounded-lg border border-dashed border-emerald-300 bg-emerald-50/70" />
          <div className="absolute left-[60%] top-[56%] max-w-[160px] rounded-md border border-emerald-100 bg-white/90 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm">
            机会窗口：低门槛 + 高自动化闭环
          </div>

          <p className="absolute left-4 top-4 text-xs font-semibold text-neutral-400">
            企业适配 / 使用门槛 高
          </p>
          <p className="absolute bottom-4 left-4 text-xs font-semibold text-neutral-400">
            低
          </p>
          <p className="absolute bottom-4 right-4 text-xs font-semibold text-neutral-400">
            自动化程度 高
          </p>

          <span className="absolute bottom-10 left-10 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-neutral-500">
            轻量入口
          </span>
          <span className="absolute bottom-10 right-10 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-neutral-500">
            效率型工具
          </span>
          <span className="absolute left-10 top-10 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-neutral-500">
            企业协作
          </span>
          <span className="absolute right-10 top-10 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-neutral-500">
            高壁垒平台
          </span>

          {competitors.map((competitor, index) => {
            const xLevel = competitor.automation_level ?? "medium";
            const yLevel = enterpriseLevel(competitor);
            const agentLevel = competitor.agent_capability ?? "low";
            const [xOffset, yOffset] = offsetPoint(index);
            const left = levelToPercent[xLevel] + xOffset;
            const top = 100 - levelToPercent[yLevel] + yOffset;
            const tone = agentTone[agentLevel];
            const name = competitor.product_name ?? competitor.name;

            return (
              <div
                key={name}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-2.5 py-1.5 shadow-sm transition duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-neutral-400 group-hover:bg-white group-hover:shadow-md">
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ring-4 ${tone.dot}`}
                  />
                  <span className="max-w-[120px] truncate text-xs font-semibold text-neutral-950">
                    {name}
                  </span>
                </div>

                <div
                  className={`pointer-events-none absolute left-1/2 top-full z-20 mt-3 hidden w-64 -translate-x-1/2 rounded-md border bg-white p-4 text-left shadow-lg group-hover:block ${tone.border}`}
                >
                  <p className="text-sm font-semibold text-neutral-950">{name}</p>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    {competitor.positioning || "暂无定位描述"}
                  </p>
                  <div className="mt-3 grid gap-2">
                    <InfoRow label="自动化" value={levelToLabel[xLevel]} />
                    <InfoRow label="企业适配" value={levelToLabel[yLevel]} />
                    <InfoRow label="Agent 能力" value={levelToLabel[agentLevel]} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {insights.map((insight) => (
            <div
              key={insight}
              className="rounded-md border border-neutral-100 bg-neutral-50/80 p-4 text-sm leading-6 text-neutral-700"
            >
              {insight}
            </div>
          ))}
        </div>

        <details className="group mt-4 border-t border-neutral-100 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-neutral-500 transition duration-200 ease-out hover:text-neutral-950 [&::-webkit-details-marker]:hidden">
            查看坐标说明
            <svg
              aria-hidden="true"
              className="h-4 w-4 transition duration-200 ease-out group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            X 轴表示自动化程度；Y 轴用协作支持和工作流深度近似表示企业适配与使用门槛。点位颜色表示 Agent 能力，机会窗口暂以高自动化、低到中使用门槛区域作为 MVP 切入假设。
          </p>
        </details>
      </div>
    </section>
  );
}
