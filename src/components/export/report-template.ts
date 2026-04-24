export type ReportTypeId = "investor" | "product-manager" | "full";

export type ReportSectionId =
  | "executive-summary"
  | "core-competitors"
  | "feature-comparison"
  | "positioning-map"
  | "opportunity-insights"
  | "research-details";

export type ReportType = {
  id: ReportTypeId;
  title: string;
  description: string;
  focus: string;
  badge: string;
};

export type ReportSectionOption = {
  id: ReportSectionId;
  label: string;
  description: string;
};

export type ReportTemplateSection = {
  id: ReportSectionId;
  eyebrow: string;
  title: string;
  summary: string;
  points: string[];
};

export type PositioningMapPoint = {
  name: string;
  x: number;
  y: number;
  note: string;
};

export type PositioningMap = {
  xAxis: string;
  yAxis: string;
  quadrants: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  points: PositioningMapPoint[];
};

export type ReportTemplate = {
  reportType: ReportType;
  title: string;
  subtitle: string;
  audienceNote: string;
  metadata: string[];
  sections: ReportTemplateSection[];
  positioningMap: PositioningMap;
};

export type ExportFormat = "markdown" | "pdf" | "png";

export const reportTypes: ReportType[] = [
  {
    id: "investor",
    title: "投资人版",
    description: "更关注市场、竞争格局、机会点",
    focus: "市场空间、竞争密度、进入机会",
    badge: "Investor",
  },
  {
    id: "product-manager",
    title: "产品经理版",
    description: "更关注能力对比、切入方向、MVP",
    focus: "能力缺口、功能优先级、MVP 路径",
    badge: "PM",
  },
  {
    id: "full",
    title: "完整研究版",
    description: "保留全部分析内容",
    focus: "完整证据链、研究详情、可追溯结论",
    badge: "Full",
  },
];

export const reportSectionOptions: ReportSectionOption[] = [
  {
    id: "executive-summary",
    label: "Executive Summary",
    description: "保留报告结论、判断依据和关键数字。",
  },
  {
    id: "core-competitors",
    label: "核心竞品",
    description: "展示主要玩家、定位和优劣势摘要。",
  },
  {
    id: "feature-comparison",
    label: "功能对比",
    description: "整理关键能力维度和差异化空白。",
  },
  {
    id: "positioning-map",
    label: "定位地图",
    description: "用二维定位帮助读者快速理解竞争格局。",
  },
  {
    id: "opportunity-insights",
    label: "机会点洞察",
    description: "突出高优先级机会和可落地切入点。",
  },
  {
    id: "research-details",
    label: "研究详情",
    description: "附上场景、证据和推导过程。",
  },
];

export const defaultSelectedSections: ReportSectionId[] = [
  "executive-summary",
  "core-competitors",
  "positioning-map",
  "opportunity-insights",
];

export const allReportSections = reportSectionOptions.map((section) => section.id);

export const positioningMap: PositioningMap = {
  xAxis: "垂直场景聚焦度",
  yAxis: "流程自动化深度",
  quadrants: {
    topLeft: "通用自动化",
    topRight: "理想切入区",
    bottomLeft: "基础生成",
    bottomRight: "垂直工具",
  },
  points: [
    {
      name: "ChatGPT",
      x: 34,
      y: 55,
      note: "通用能力强，垂直流程弱",
    },
    {
      name: "Notion AI",
      x: 58,
      y: 48,
      note: "协作入口强，执行链路中等",
    },
    {
      name: "Copy.ai",
      x: 66,
      y: 36,
      note: "营销场景明确，研究深度较浅",
    },
    {
      name: "内容工作流 Agent",
      x: 82,
      y: 78,
      note: "高垂直聚焦，高流程自动化",
    },
  ],
};

const sectionContent: Record<ReportSectionId, ReportTemplateSection> = {
  "executive-summary": {
    id: "executive-summary",
    eyebrow: "01 / Summary",
    title: "Executive Summary",
    summary:
      "AI 内容工作流仍处在从单点生成走向流程闭环的阶段，垂直场景和团队协作是当前最清晰的机会。",
    points: [
      "通用 AI 助手覆盖面广，但在持续交付、流程治理和团队协作上仍有缺口。",
      "内容运营和增长团队对选题、研究、改写、发布准备的一体化需求更强。",
      "建议先验证单一高频工作流，再扩展为多角色协作平台。",
    ],
  },
  "core-competitors": {
    id: "core-competitors",
    eyebrow: "02 / Competitors",
    title: "核心竞品",
    summary:
      "主要竞品分布在文档协作、通用 AI 助手和营销内容工具三类，能力边界各有明显取舍。",
    points: [
      "Notion AI 强在文档上下文和团队协作入口，但自动执行链路较浅。",
      "ChatGPT 能力通用且生成质量稳定，但垂直工作流和团队交付闭环不足。",
      "Copy.ai 更贴近营销文案场景，模板丰富，但深度研究和策略规划较弱。",
    ],
  },
  "feature-comparison": {
    id: "feature-comparison",
    eyebrow: "03 / Capability",
    title: "功能对比",
    summary:
      "差异化机会不在基础生成能力，而在能否把研究、判断、生成和交付组织成稳定流程。",
    points: [
      "长文内容规划、素材研究和跨平台改写是三个高价值能力维度。",
      "现有产品普遍需要用户手动管理版本、上下文和发布检查。",
      "MVP 应优先打磨从输入主题到可交付初稿的闭环体验。",
    ],
  },
  "positioning-map": {
    id: "positioning-map",
    eyebrow: "04 / Positioning",
    title: "定位地图",
    summary:
      "定位地图建议以“自动化深度”和“垂直场景聚焦度”为坐标，识别可避开正面竞争的入口。",
    points: [
      "Notion AI 位于协作强、自动化中等区域。",
      "ChatGPT 位于通用能力强、场景聚焦较弱区域。",
      "新产品可切入高垂直聚焦、高流程自动化的空白象限。",
    ],
  },
  "opportunity-insights": {
    id: "opportunity-insights",
    eyebrow: "05 / Opportunity",
    title: "机会点洞察",
    summary:
      "最值得优先验证的是面向内容团队的写作 Agent，以及跨平台内容改写与发布准备工作流。",
    points: [
      "机会一：面向内容运营的选题到初稿 Agent，用户频次高且价值可感知。",
      "机会二：一键多平台改写，结果可直接验收，适合作为轻量 MVP。",
      "机会三：品牌语气和合规检查 Agent，更适合进入企业客户后扩展。",
    ],
  },
  "research-details": {
    id: "research-details",
    eyebrow: "06 / Evidence",
    title: "研究详情",
    summary:
      "研究详情保留用户场景、痛点、当前替代方案和差异化推导，适合完整研究版或内部复盘。",
    points: [
      "用户场景包含内容运营、新媒体编辑和增长团队的日常交付链路。",
      "核心痛点集中在资料分散、版本管理困难和重复改写耗时。",
      "推导依据来自竞品定位、能力边界和未满足需求的交叉分析。",
    ],
  },
};

const reportTypeSectionOrder: Record<ReportTypeId, ReportSectionId[]> = {
  investor: [
    "executive-summary",
    "core-competitors",
    "positioning-map",
    "opportunity-insights",
    "feature-comparison",
    "research-details",
  ],
  "product-manager": [
    "executive-summary",
    "feature-comparison",
    "opportunity-insights",
    "core-competitors",
    "positioning-map",
    "research-details",
  ],
  full: [
    "executive-summary",
    "core-competitors",
    "feature-comparison",
    "positioning-map",
    "opportunity-insights",
    "research-details",
  ],
};

function getReportType(reportTypeId: ReportTypeId) {
  return reportTypes.find((type) => type.id === reportTypeId) ?? reportTypes[0];
}

export function buildReportTemplate(
  reportTypeId: ReportTypeId,
  selectedSections: ReportSectionId[],
): ReportTemplate {
  const reportType = getReportType(reportTypeId);
  const selected = new Set(selectedSections);
  const sections = reportTypeSectionOrder[reportTypeId]
    .filter((sectionId) => selected.has(sectionId))
    .map((sectionId) => sectionContent[sectionId]);

  return {
    reportType,
    title: `${reportType.title}：AI 内容工作流竞品与机会分析`,
    subtitle: "基于 mock 分析结果生成的报告预览",
    audienceNote: `面向${reportType.title.replace("版", "")}读者，重点呈现：${reportType.focus}。`,
    metadata: [
      "分析对象：AI 内容工作流",
      "数据来源：Mock research dataset",
      "导出格式：Markdown / PDF / PNG",
    ],
    sections,
    positioningMap,
  };
}

export function reportTemplateToMarkdown(template: ReportTemplate) {
  const metadata = template.metadata.map((item) => `- ${item}`).join("\n");
  const sections = template.sections
    .map(
      (section) => `## ${section.title}

${section.summary}

${section.points.map((point) => `- ${point}`).join("\n")}`,
    )
    .join("\n\n");

  return `# ${template.title}

${template.subtitle}

> ${template.audienceNote}

${metadata}

${sections}`;
}

export function createReportFileName(
  template: ReportTemplate,
  extension: "md" | "png",
) {
  const safeName = template.reportType.title
    .replace(/版/g, "")
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeName || "research"}-export-report.${extension}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function createPrintableReportHtml(template: ReportTemplate) {
  const metadata = template.metadata
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const sections = template.sections
    .map(
      (section) => `<section>
        <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.summary)}</p>
        ${section.id === "positioning-map" ? createPrintablePositioningMapHtml(template.positioningMap) : ""}
        <ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      </section>`,
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(template.title)}</title>
    <style>
      @page { margin: 24mm; }
      body {
        color: #171717;
        font-family: Arial, "Microsoft YaHei", sans-serif;
        line-height: 1.68;
        margin: 0;
      }
      main { max-width: 760px; margin: 0 auto; }
      h1 { font-size: 30px; line-height: 1.25; margin: 0 0 12px; }
      h2 { font-size: 20px; margin: 8px 0 10px; }
      p { color: #404040; margin: 0 0 12px; }
      ul { margin: 0 0 0 20px; padding: 0; }
      li { margin: 4px 0; }
      header {
        border-bottom: 1px solid #d4d4d4;
        margin-bottom: 28px;
        padding-bottom: 22px;
      }
      section {
        break-inside: avoid;
        border-bottom: 1px solid #e5e5e5;
        margin-bottom: 24px;
        padding-bottom: 20px;
      }
      .eyebrow {
        color: #047857;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        margin-bottom: 4px;
        text-transform: uppercase;
      }
      .note {
        border-left: 3px solid #047857;
        color: #262626;
        margin-top: 18px;
        padding-left: 12px;
      }
      .metadata {
        border-top: 1px solid #e5e5e5;
        margin-top: 18px;
        padding-top: 14px;
      }
      .map {
        background: #fafafa;
        border: 1px solid #d4d4d4;
        height: 330px;
        margin: 18px 0;
        position: relative;
      }
      .map::before,
      .map::after {
        background: #a3a3a3;
        content: "";
        position: absolute;
      }
      .map::before {
        height: 1px;
        left: 40px;
        right: 40px;
        top: 50%;
      }
      .map::after {
        bottom: 36px;
        left: 50%;
        top: 36px;
        width: 1px;
      }
      .quadrant {
        color: #737373;
        font-size: 11px;
        font-weight: 700;
        position: absolute;
      }
      .point {
        background: #047857;
        border: 3px solid #fff;
        border-radius: 999px;
        box-shadow: 0 6px 18px rgba(4,120,87,0.18);
        height: 14px;
        position: absolute;
        width: 14px;
      }
      .point span {
        color: #171717;
        font-size: 11px;
        font-weight: 700;
        left: 14px;
        position: absolute;
        top: -4px;
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">${escapeHtml(template.reportType.badge)} report</p>
        <h1>${escapeHtml(template.title)}</h1>
        <p>${escapeHtml(template.subtitle)}</p>
        <p class="note">${escapeHtml(template.audienceNote)}</p>
        <ul class="metadata">${metadata}</ul>
      </header>
      ${sections}
    </main>
  </body>
</html>`;
}

function createPrintablePositioningMapHtml(map: PositioningMap) {
  const points = map.points
    .map(
      (point) => `<div class="point" style="left:${point.x}%; top:${100 - point.y}%;">
        <span>${escapeHtml(point.name)}</span>
      </div>`,
    )
    .join("");

  return `<div class="map" aria-label="${escapeHtml(map.xAxis)} / ${escapeHtml(map.yAxis)}">
    <span class="quadrant" style="left:18px; top:16px;">${escapeHtml(map.quadrants.topLeft)}</span>
    <span class="quadrant" style="right:18px; top:16px;">${escapeHtml(map.quadrants.topRight)}</span>
    <span class="quadrant" style="left:18px; bottom:16px;">${escapeHtml(map.quadrants.bottomLeft)}</span>
    <span class="quadrant" style="right:18px; bottom:16px;">${escapeHtml(map.quadrants.bottomRight)}</span>
    ${points}
  </div>`;
}
