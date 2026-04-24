import type {
  AnalysisResult,
  HistoryRecordSummary,
  HistoryRecordType,
  StoredHistoryRecord,
} from "./types";

export const HISTORY_STORAGE_KEY = "research-ai.history.v1";

function canUseStorage() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function buildHistoryId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `history-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeStoredRecord(value: unknown): StoredHistoryRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<StoredHistoryRecord>;

  if (
    !candidate.id ||
    !candidate.title ||
    !candidate.query ||
    !candidate.target ||
    !candidate.type ||
    !candidate.updatedAt ||
    !candidate.summary ||
    !candidate.resultHref ||
    !candidate.analysis
  ) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    query: candidate.query,
    target: candidate.target,
    type: candidate.type,
    updatedAt: candidate.updatedAt,
    competitorCount: candidate.competitorCount ?? 0,
    opportunityCount: candidate.opportunityCount ?? 0,
    summary: candidate.summary,
    resultHref: candidate.resultHref,
    isDemo: candidate.isDemo,
    analysis: candidate.analysis,
  };
}

function rankPriority(value?: "High" | "Medium" | "Low") {
  if (value === "High") return 3;
  if (value === "Medium") return 2;
  return 1;
}

function pickLeadingOpportunity(analysis: AnalysisResult) {
  return [...analysis.opportunities].sort((a, b) => {
    const scoreDelta = (b.total_score ?? 0) - (a.total_score ?? 0);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return (
      rankPriority(b.recommended_priority ?? b.priority) -
      rankPriority(a.recommended_priority ?? a.priority)
    );
  })[0];
}

function deriveType(analysis: AnalysisResult): HistoryRecordType {
  const leadingOpportunity = pickLeadingOpportunity(analysis);

  if (!leadingOpportunity) {
    return "competitor";
  }

  return leadingOpportunity.gap_type === "商业化"
    ? "competitor"
    : "opportunity";
}

function deriveTarget(analysis: AnalysisResult) {
  const scenario = analysis.userScenarios[0];

  if (scenario) {
    return `${scenario.userType} · ${scenario.scenario}`;
  }

  return analysis.competitors[0]?.category ?? "竞品与机会研究";
}

function deriveTitle(query: string, analysis: AnalysisResult) {
  const leadingOpportunity = pickLeadingOpportunity(analysis);

  if (leadingOpportunity) {
    return `${query} ${leadingOpportunity.gap_type}机会归档`;
  }

  return `${query} 竞品分析归档`;
}

function deriveSummary(analysis: AnalysisResult) {
  const leadingOpportunity = pickLeadingOpportunity(analysis);

  if (leadingOpportunity?.product_direction) {
    return leadingOpportunity.product_direction;
  }

  if (analysis.competitors[0]?.positioning) {
    return analysis.competitors[0].positioning;
  }

  return "已生成一份新的竞品分析结果。";
}

export function readStoredHistory(): StoredHistoryRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => sanitizeStoredRecord(item))
      .filter((item): item is StoredHistoryRecord => Boolean(item))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  } catch {
    return [];
  }
}

export function writeStoredHistory(records: StoredHistoryRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
}

export function removeStoredHistoryRecord(id: string) {
  const nextRecords = readStoredHistory().filter((record) => record.id !== id);
  writeStoredHistory(nextRecords);
  return nextRecords;
}

export function findStoredHistoryRecord(id: string) {
  return readStoredHistory().find((record) => record.id === id) ?? null;
}

export function createStoredHistoryRecord({
  query,
  analysis,
  isDemo = false,
}: {
  query: string;
  analysis: AnalysisResult;
  isDemo?: boolean;
}) {
  const id = buildHistoryId();
  const updatedAt = new Date().toISOString();

  const record: StoredHistoryRecord = {
    id,
    title: deriveTitle(query, analysis),
    query,
    target: deriveTarget(analysis),
    type: deriveType(analysis),
    updatedAt,
    competitorCount: analysis.competitors.length,
    opportunityCount: analysis.opportunities.length,
    summary: deriveSummary(analysis),
    resultHref: `/result?q=${encodeURIComponent(query)}&history=${id}`,
    isDemo,
    analysis,
  };

  const nextRecords = [record, ...readStoredHistory()];
  writeStoredHistory(nextRecords);

  return record;
}

export function toHistorySummaries(
  records: StoredHistoryRecord[],
): HistoryRecordSummary[] {
  return records.map((record) => ({
    id: record.id,
    title: record.title,
    query: record.query,
    target: record.target,
    type: record.type,
    updatedAt: record.updatedAt,
    competitorCount: record.competitorCount,
    opportunityCount: record.opportunityCount,
    summary: record.summary,
    resultHref: record.resultHref,
    isDemo: record.isDemo,
  }));
}
