type CompareSummaryProps = {
  left: {
    title: string;
    competitors: number;
    features: number;
    highPriority: number;
    direction: string;
    sideLabel: string;
  };
  right: {
    title: string;
    competitors: number;
    features: number;
    highPriority: number;
    direction: string;
    sideLabel: string;
  };
};

function SummaryCard({
  sideLabel,
  title,
  competitors,
  features,
  highPriority,
  direction,
}: CompareSummaryProps["left"]) {
  const metrics = [
    { label: "竞品数量", value: competitors },
    { label: "功能维度数", value: features },
    { label: "高优先级机会", value: highPriority },
  ];

  return (
    <article className="rounded-lg border border-neutral-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(23,23,23,0.05)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm">
      <div className="mb-4 h-1 w-16 rounded-full bg-emerald-700/80" />
      <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
        {sideLabel}
      </p>
      <h3 className="mt-1 text-xl font-semibold text-neutral-950">{title}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-md border border-neutral-100 bg-neutral-50/70 px-4 py-3 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-neutral-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
          推荐切入方向
        </p>
        <p className="mt-2 text-sm leading-6 text-neutral-700">{direction}</p>
      </div>
    </article>
  );
}

export default function CompareSummary({
  left,
  right,
}: CompareSummaryProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SummaryCard {...left} />
      <SummaryCard {...right} />
    </div>
  );
}
