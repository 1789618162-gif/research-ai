export type CapabilityLevel = "low" | "medium" | "high";

export type CompetitorRecord = {
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

export type FeatureComparisonItem = {
  feature: string;
  importance: "high" | "medium" | "low";
  comparison: Array<{
    competitor: string;
    performance: string;
    notes: string;
  }>;
};

export type UserScenarioRecord = {
  scenario: string;
  userType: string;
  painPoints: string[];
  currentAlternatives: string[];
};

export type DifferentiationRecord = {
  dimension: string;
  currentPattern: string;
  gaps: string[];
  implications: string;
};

export type OpportunityInsightRecord = {
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

export type AnalysisResult = {
  competitors: CompetitorRecord[];
  featureComparison: FeatureComparisonItem[];
  userScenarios: UserScenarioRecord[];
  differentiationAnalysis: DifferentiationRecord[];
  opportunities: OpportunityInsightRecord[];
};

export type HistoryRecordType = "competitor" | "opportunity";

export type HistoryRecordSummary = {
  id: string;
  title: string;
  query: string;
  target: string;
  type: HistoryRecordType;
  updatedAt: string;
  competitorCount: number;
  opportunityCount: number;
  summary: string;
  resultHref: string;
  isDemo?: boolean;
};

export type StoredHistoryRecord = HistoryRecordSummary & {
  analysis: AnalysisResult;
};
