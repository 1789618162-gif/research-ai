import SectionHeader from "@/components/SectionHeader";

export type CapabilityLevel = "low" | "medium" | "high";

export type CompetitorOverviewItem = {
  name: string;
  product_name?: string;
  category: string;
  positioning: string;
  core_features?: string[];
  target_users?: string[];
  key_scenarios?: string[];
  pricing?: string;
  workflow_depth?: CapabilityLevel;
  automation_level?: CapabilityLevel;
  closed_loop_capability?: CapabilityLevel;
  agent_capability?: CapabilityLevel;
  collaboration_support?: CapabilityLevel;
  strengths: string[];
  weaknesses: string[];
  evidence: string[];
};

type CompetitorOverviewProps = {
  id?: string;
  competitors: CompetitorOverviewItem[];
};

const levelLabels = {
  high: "高",
  medium: "中",
  low: "低",
} satisfies Record<CapabilityLevel, string>;

const levelStyles = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-neutral-200 bg-neutral-100 text-neutral-700",
} satisfies Record<CapabilityLevel, string>;

function scoreLevel(value?: CapabilityLevel) {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function getClosedLoopCapability(competitor: CompetitorOverviewItem) {
  if (competitor.closed_loop_capability) {
    return competitor.closed_loop_capability;
  }

  const score =
    scoreLevel(competitor.workflow_depth) +
    scoreLevel(competitor.automation_level) +
    scoreLevel(competitor.agent_capability);

  if (score >= 8) return "high";
  if (score >= 5) return "medium";
  return "low";
}

function InlineTags({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <p className="mt-2 text-sm text-neutral-500">-</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function CapabilityBadge({
  label,
  value,
}: {
  label: string;
  value?: CapabilityLevel;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      {value ? (
        <span
          className={`mt-1 inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${levelStyles[value]}`}
        >
          {levelLabels[value]}
        </span>
      ) : (
        <p className="mt-1 text-sm text-neutral-500">-</p>
      )}
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
        {title}
      </p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">-</p>
      )}
    </div>
  );
}

function CapabilityMatrix({
  competitors,
}: {
  competitors: CompetitorOverviewItem[];
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-md border border-neutral-200 bg-white/70">
      <table className="min-w-[720px] w-full text-left text-sm">
        <caption className="sr-only">竞品能力对比表</caption>
        <thead className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-normal text-neutral-400">
          <tr>
            <th className="px-4 py-3">产品</th>
            <th className="px-4 py-3">Workflow Depth</th>
            <th className="px-4 py-3">Automation Level</th>
            <th className="px-4 py-3">Closed Loop</th>
            <th className="px-4 py-3">Agent Capability</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {competitors.map((competitor) => (
            <tr
              key={`matrix-${competitor.product_name ?? competitor.name}`}
              className="transition duration-200 ease-out hover:bg-white"
            >
              <td className="px-4 py-3 font-medium text-neutral-950">
                {competitor.product_name ?? competitor.name}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {competitor.workflow_depth
                  ? levelLabels[competitor.workflow_depth]
                  : "-"}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {competitor.automation_level
                  ? levelLabels[competitor.automation_level]
                  : "-"}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {levelLabels[getClosedLoopCapability(competitor)]}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {competitor.agent_capability
                  ? levelLabels[competitor.agent_capability]
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompetitorOverview({
  id,
  competitors,
}: CompetitorOverviewProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <SectionHeader
        eyebrow="Competitor Landscape"
        title="核心竞品"
        description="对比产品定位、用户和核心能力等级"
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {competitors.map((competitor, index) => (
          <article
            key={competitor.product_name ?? competitor.name}
            className="min-w-0 rounded-md border border-neutral-200 bg-white/70 p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-normal text-emerald-800">
                  {competitor.category}
                </p>
                <h3 className="mt-2 break-words text-xl font-semibold text-neutral-950">
                  {competitor.product_name ?? competitor.name}
                </h3>
              </div>
              <span className="font-mono text-sm text-neutral-400">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-600">
              {competitor.positioning}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
                  核心功能
                </p>
                <InlineTags items={competitor.core_features} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
                  目标用户
                </p>
                <InlineTags items={competitor.target_users} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
                  定价
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {competitor.pricing || "-"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-y border-neutral-100 py-4">
              <CapabilityBadge label="工作流" value={competitor.workflow_depth} />
              <CapabilityBadge label="自动化" value={competitor.automation_level} />
              <CapabilityBadge
                label="闭环"
                value={getClosedLoopCapability(competitor)}
              />
              <CapabilityBadge label="Agent" value={competitor.agent_capability} />
            </div>

            <details className="group mt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-neutral-500 transition duration-200 ease-out hover:text-neutral-950 [&::-webkit-details-marker]:hidden">
                详细判断
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
              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
                    关键场景
                  </p>
                  <InlineTags items={competitor.key_scenarios} />
                </div>
                <DetailList title="优势" items={competitor.strengths} />
                <DetailList title="弱点" items={competitor.weaknesses} />
                <DetailList title="判断依据" items={competitor.evidence} />
              </div>
            </details>
          </article>
        ))}
      </div>

      <CapabilityMatrix competitors={competitors} />
    </section>
  );
}
