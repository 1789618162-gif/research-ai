export type AnalysisDimensionKey =
  | "user"
  | "scenario"
  | "workflowDepth"
  | "automationLevel"
  | "agentCapability"
  | "businessModel";

export type ScoringWeightKey =
  | "userValue"
  | "differentiation"
  | "feasibility"
  | "agentFit";

export type OutputFormat = "brief" | "full";

export type AgentSettings = {
  dimensions: Record<AnalysisDimensionKey, boolean>;
  scoringWeights: Record<ScoringWeightKey, number>;
  output: {
    format: OutputFormat;
    competitorCount: number;
    generatePriority: boolean;
    showExecutionLogs: boolean;
  };
  prompt: string;
};

export const defaultAgentSettings: AgentSettings = {
  dimensions: {
    user: true,
    scenario: true,
    workflowDepth: true,
    automationLevel: true,
    agentCapability: true,
    businessModel: true,
  },
  scoringWeights: {
    userValue: 30,
    differentiation: 25,
    feasibility: 25,
    agentFit: 20,
  },
  output: {
    format: "full",
    competitorCount: 5,
    generatePriority: true,
    showExecutionLogs: false,
  },
  prompt: "",
};
