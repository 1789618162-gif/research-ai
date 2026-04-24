import type { HistoryRecordSummary } from "../history/types";

export const historyRecords: HistoryRecordSummary[] = [
  {
    id: "history-ai-writing",
    title: "AI 写作工具竞品扫描",
    query: "AI 写作工具",
    target: "内容生产与多平台分发",
    type: "competitor",
    updatedAt: "2026-04-23T16:30:00+08:00",
    competitorCount: 5,
    opportunityCount: 7,
    summary:
      "通用写作能力已经趋同，真正的机会在于把选题、资料整理、初稿和多平台改写串成可执行工作流。",
    resultHref: `/result?q=${encodeURIComponent("AI 写作工具")}`,
  },
  {
    id: "history-ai-search",
    title: "AI 搜索机会点洞察",
    query: "AI 搜索",
    target: "知识检索与研究助理",
    type: "opportunity",
    updatedAt: "2026-04-22T21:18:00+08:00",
    competitorCount: 6,
    opportunityCount: 8,
    summary:
      "AI 搜索的差异化不只在答案质量，而在可追溯研究链、持续监控和面向岗位的交付物生成。",
    resultHref: `/result?q=${encodeURIComponent("AI 搜索")}`,
  },
  {
    id: "history-customer-service-saas",
    title: "智能客服 SaaS 分析",
    query: "智能客服 SaaS",
    target: "客服自动化与企业服务",
    type: "competitor",
    updatedAt: "2026-04-19T10:05:00+08:00",
    competitorCount: 4,
    opportunityCount: 5,
    summary:
      "现有客服工具强调对话自动化，但在工单闭环、知识库维护和跨部门协作上仍有明显缺口。",
    resultHref: `/result?q=${encodeURIComponent("智能客服 SaaS")}`,
  },
  {
    id: "history-education-agent",
    title: "在线教育 Agent 产品机会",
    query: "在线教育 Agent 产品",
    target: "学习陪伴与课程运营",
    type: "opportunity",
    updatedAt: "2026-04-12T18:42:00+08:00",
    competitorCount: 3,
    opportunityCount: 6,
    summary:
      "教育 Agent 的 MVP 更适合从学习计划、错题复盘和课程提醒切入，而不是一开始做全能老师。",
    resultHref: `/result?q=${encodeURIComponent("在线教育 Agent 产品")}`,
  },
  {
    id: "history-crm-smb",
    title: "中小企业 CRM 竞品分析",
    query: "面向中小企业的 CRM",
    target: "销售管理与客户运营",
    type: "competitor",
    updatedAt: "2026-03-29T09:12:00+08:00",
    competitorCount: 5,
    opportunityCount: 4,
    summary:
      "中小企业 CRM 的核心矛盾是配置成本和使用习惯，轻量化线索跟进与自动提醒比复杂报表更适合切入。",
    resultHref: `/result?q=${encodeURIComponent("面向中小企业的 CRM")}`,
  },
];
