import SectionHeader from "@/components/SectionHeader";

type AgentProgressProps = {
  isComplete: boolean;
};

const steps = [
  "识别赛道",
  "抽取竞品",
  "对比能力",
  "评分机会",
  "生成建议",
];

export default function AgentProgress({ isComplete }: AgentProgressProps) {
  return (
    <section id="agent-progress" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Agent Progress"
        title="分析进度"
        description="展示系统完成研究的关键步骤"
      />

      <div className="mt-6 border-y border-neutral-200 bg-white/50 py-5">
        <div className="grid gap-2 sm:grid-cols-5">
          {steps.map((step, index) => {
            const isActive = !isComplete && index === 2;
            const stateClass = isComplete
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : isActive
                ? "border-emerald-300 bg-white text-emerald-900 shadow-sm"
                : "border-neutral-200 bg-neutral-50 text-neutral-500";

            return (
              <div
                key={step}
                className={`rounded-md border px-3 py-2 transition duration-200 ease-out ${stateClass}`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
                    {isComplete ? "✓" : index + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
