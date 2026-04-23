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

export default function PositioningMap({ competitors }: PositioningMapProps) {
  return (
    <section id="positioning-map" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Positioning Map"
        title="定位地图"
        description="用自动化和企业适配判断竞品分布"
      />

      <div className="mt-6 rounded-md border border-neutral-200 bg-white/70 p-5 transition duration-200 ease-out hover:border-neutral-300 hover:bg-white hover:shadow-sm">
        <div className="relative h-[420px] overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          <div className="absolute inset-x-8 top-1/2 border-t border-dashed border-neutral-300" />
          <div className="absolute inset-y-8 left-1/2 border-l border-dashed border-neutral-300" />

          <p className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-normal text-neutral-400">
            企业适配 / 使用门槛 高
          </p>
          <p className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-normal text-neutral-400">
            低
          </p>
          <p className="absolute bottom-4 right-4 text-xs font-semibold uppercase tracking-normal text-neutral-400">
            自动化程度 高
          </p>

          {competitors.map((competitor, index) => {
            const xLevel = competitor.automation_level ?? "medium";
            const yLevel = enterpriseLevel(competitor);
            const left = levelToPercent[xLevel];
            const top = 100 - levelToPercent[yLevel];

            return (
              <div
                key={competitor.product_name ?? competitor.name}
                className="absolute max-w-[180px] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="rounded-md border border-neutral-300 bg-white px-3 py-2 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="truncate text-sm font-semibold text-neutral-950">
                      {competitor.product_name ?? competitor.name}
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    自动化{levelToLabel[xLevel]} / 企业适配{levelToLabel[yLevel]}
                  </p>
                </div>
              </div>
            );
          })}
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
            X 轴表示自动化程度，Y 轴用协作支持和工作流深度近似表示企业适配与使用门槛。
          </p>
        </details>
      </div>
    </section>
  );
}
