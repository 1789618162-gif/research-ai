import SectionHeader from "@/components/SectionHeader";

export type OpportunityInsight = {
  opportunity_title: string;
  gap_type: string;
  evidence: string;
  unmet_need: string;
  product_direction: string;
  mvp_idea: string;
  priority: "High" | "Medium" | "Low";
  priority_reason?: string;
  why_now?: string;
  user_value?: number;
  differentiation?: number;
  feasibility?: number;
  agent_fit?: number;
  total_score?: number;
  recommended_priority?: "High" | "Medium" | "Low";
  recommendation_reason?: string;
};

type OpportunityInsightsProps = {
  id?: string;
  opportunities: OpportunityInsight[];
};

const priorityConfig = {
  High: {
    label: "High",
    badge: "border-red-200 bg-red-50 text-red-800",
    accent: "border-l-red-500 hover:border-l-red-600",
    bar: "bg-red-500",
  },
  Medium: {
    label: "Medium",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    accent: "border-l-amber-500 hover:border-l-amber-600",
    bar: "bg-amber-500",
  },
  Low: {
    label: "Low",
    badge: "border-neutral-200 bg-neutral-100 text-neutral-700",
    accent: "border-l-neutral-400 hover:border-l-neutral-500",
    bar: "bg-neutral-500",
  },
} satisfies Record<
  OpportunityInsight["priority"],
  { label: string; badge: string; accent: string; bar: string }
>;

const cardTone = {
  High: "bg-white border-red-200 shadow-sm",
  Medium: "bg-white/80 border-neutral-200",
  Low: "bg-white/70 border-neutral-200",
} satisfies Record<OpportunityInsight["priority"], string>;

const scoreDimensions = [
  ["用户价值", "user_value"],
  ["差异化", "differentiation"],
  ["可行性", "feasibility"],
  ["Agent 匹配", "agent_fit"],
] as const;

function clampPercent(value: number, max: number) {
  return `${Math.min(100, Math.max(0, (value / max) * 100))}%`;
}

function FieldBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-neutral-700">
        {value || "-"}
      </p>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value?: number;
  tone: string;
}) {
  const hasScore = typeof value === "number";

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        <p className="font-mono text-xs text-neutral-500">
          {hasScore ? `${value}/10` : "未评分"}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200">
        {hasScore ? (
          <div
            className={`h-full rounded-full ${tone}`}
            style={{ width: clampPercent(value, 10) }}
          />
        ) : null}
      </div>
    </div>
  );
}

function ScorePanel({ opportunity }: { opportunity: OpportunityInsight }) {
  const totalScore = opportunity.total_score;
  const priorityKey = opportunity.recommended_priority ?? opportunity.priority;
  const priority = priorityConfig[priorityKey];
  const hasTotalScore = typeof totalScore === "number";

  return (
    <div className="mt-5 border-y border-neutral-100 py-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
            二次评分
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-semibold tracking-normal text-neutral-950">
              {hasTotalScore ? totalScore : "--"}
            </p>
            <p className="text-sm font-medium text-neutral-500">/ 40</p>
          </div>
        </div>
        <span
          className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${priority.badge}`}
        >
          推荐优先级：{priority.label}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200">
        {hasTotalScore ? (
          <div
            className={`h-full rounded-full ${priority.bar}`}
            style={{ width: clampPercent(totalScore, 40) }}
          />
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {scoreDimensions.map(([label, key]) => (
          <ScoreBar
            key={key}
            label={label}
            value={opportunity[key]}
            tone={priority.bar}
          />
        ))}
      </div>
    </div>
  );
}

export default function OpportunityInsights({
  id,
  opportunities,
}: OpportunityInsightsProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <SectionHeader
        eyebrow="Opportunity Insights"
        title="机会洞察"
        description="聚焦证据、未满足需求和 MVP 行动"
      />

      {opportunities.length === 0 ? (
        <div className="mt-6 border-y border-neutral-200 bg-white/60 px-5 py-10">
          <p className="text-lg font-semibold text-neutral-950">
            暂无机会点洞察
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            当前分析结果中没有返回 opportunities 数据。你可以重新生成分析，或先检查 API
            返回结构是否包含机会点数组。
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {opportunities.map((opportunity, index) => {
            const priorityKey =
              opportunity.recommended_priority ?? opportunity.priority;
            const priority = priorityConfig[priorityKey];
            const tone = cardTone[priorityKey];

            return (
              <article
                key={`${opportunity.opportunity_title}-${index}`}
                className={`min-w-0 rounded-md border border-l-4 p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm ${priority.accent} ${tone}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    {opportunity.gap_type}
                  </span>
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${priority.badge}`}
                  >
                    {priority.label}
                  </span>
                </div>

                <h3 className="mt-4 break-words text-2xl font-semibold leading-8 text-neutral-950">
                  {opportunity.opportunity_title}
                </h3>

                <ScorePanel opportunity={opportunity} />

                <div className="mt-5 grid gap-5">
                  <FieldBlock label="证据" value={opportunity.evidence} />
                  <FieldBlock
                    label="未满足需求"
                    value={opportunity.unmet_need}
                  />
                  <FieldBlock
                    label="产品方向"
                    value={opportunity.product_direction}
                  />
                  <FieldBlock label="MVP 建议" value={opportunity.mvp_idea} />
                  <FieldBlock
                    label="优先级依据"
                    value={opportunity.priority_reason}
                  />
                </div>

                <details className="group mt-5 border-t border-neutral-100 pt-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-neutral-500 transition duration-200 ease-out hover:text-neutral-950 [&::-webkit-details-marker]:hidden">
                    查看评分补充
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
                  <div className="mt-5 grid gap-5">
                    <FieldBlock
                      label="评分理由"
                      value={
                        opportunity.recommendation_reason ||
                        "未评分：暂无二次评分理由。"
                      }
                    />
                    {opportunity.why_now ? (
                      <FieldBlock label="为什么现在做" value={opportunity.why_now} />
                    ) : null}
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
