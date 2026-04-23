import type { CompetitorOverviewItem } from "@/components/CompetitorOverview";
import type { OpportunityInsight } from "@/components/OpportunityInsights";
import SectionHeader from "@/components/SectionHeader";

type UserScenario = {
  scenario: string;
  userType: string;
  painPoints: string[];
  currentAlternatives: string[];
};

type RecommendedProductDirectionProps = {
  competitors: CompetitorOverviewItem[];
  opportunities: OpportunityInsight[];
  userScenarios: UserScenario[];
};

function getTopOpportunity(opportunities: OpportunityInsight[]) {
  return [...opportunities].sort((a, b) => {
    const scoreA = a.total_score ?? (a.priority === "High" ? 30 : 20);
    const scoreB = b.total_score ?? (b.priority === "High" ? 30 : 20);
    return scoreB - scoreA;
  })[0];
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function DirectionRow({
  label,
  value,
}: {
  label: string;
  value: string | string[];
}) {
  const values = Array.isArray(value) ? value : [value];

  return (
    <div className="border-t border-neutral-100 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((item) => (
          <span
            key={item}
            className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-sm leading-5 text-neutral-700"
          >
            {item || "-"}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RecommendedProductDirection({
  competitors,
  opportunities,
  userScenarios,
}: RecommendedProductDirectionProps) {
  const topOpportunity = getTopOpportunity(opportunities);
  const targetUsers = unique(
    userScenarios.map((scenario) => scenario.userType).slice(0, 3),
  );
  const priorityScenarios = unique(
    userScenarios.map((scenario) => scenario.scenario).slice(0, 3),
  );
  const weakCapabilities = unique(
    competitors
      .flatMap((competitor) => competitor.weaknesses)
      .filter((item) => /自动化|Agent|闭环|协作|流程/.test(item))
      .slice(0, 3),
  );

  return (
    <section id="recommended-direction" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Recommended Direction"
        title="推荐产品方向"
        description="把机会点转成目标用户、场景和功能取舍"
      />

      <div className="mt-6 grid gap-8 border-y border-neutral-200 bg-white px-5 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h3 className="text-3xl font-semibold tracking-normal text-neutral-950">
            先做一个能交付结果的垂直 Agent，而不是泛写作工具。
          </h3>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            推荐把产品验证压缩到一个高频场景：目标明确、输入简单、产出可验收，并且能体现自动化闭环价值。
          </p>
        </div>

        <div className="rounded-md border border-neutral-200 bg-neutral-50/70 p-5">
          <DirectionRow
            label="推荐目标用户"
            value={targetUsers.length ? targetUsers : ["内容运营", "新媒体编辑"]}
          />
          <DirectionRow
            label="推荐优先场景"
            value={
              priorityScenarios.length ? priorityScenarios : ["从主题到初稿交付"]
            }
          />
          <DirectionRow
            label="MVP 功能建议"
            value={topOpportunity?.mvp_idea ?? "输入主题后生成大纲、初稿和改写建议。"}
          />
          <DirectionRow
            label="差异化方向"
            value={
              topOpportunity?.product_direction ??
              "用 Agent 串联研究、生成、校验和交付，形成流程闭环。"
            }
          />
          <DirectionRow
            label="暂不优先做的能力"
            value={
              weakCapabilities.length
                ? weakCapabilities
                : ["复杂团队权限", "全渠道发布集成", "深度品牌规则配置"]
            }
          />
        </div>
      </div>
    </section>
  );
}
