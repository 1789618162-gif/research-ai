import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  createAiClient,
  getAiConfig,
  getAiConfigMissingMessage,
} from "../ai/provider";
import {
  OpportunityScoringOutputSchema,
  type CompetitorInput,
  type OpportunityScoreItem,
  type Priority,
} from "./schema";

const DEFAULT_MODEL = "gpt-5.4-mini";
const OPENAI_TIMEOUT_MS = 90_000;

const scoringSchema = {
  type: "object",
  additionalProperties: false,
  required: ["scores"],
  properties: {
    scores: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "opportunity_title",
          "user_value",
          "differentiation",
          "feasibility",
          "agent_fit",
          "total_score",
          "recommended_priority",
          "recommendation_reason",
        ],
        properties: {
          opportunity_title: { type: "string" },
          user_value: { type: "integer", minimum: 1, maximum: 10 },
          differentiation: { type: "integer", minimum: 1, maximum: 10 },
          feasibility: { type: "integer", minimum: 1, maximum: 10 },
          agent_fit: { type: "integer", minimum: 1, maximum: 10 },
          total_score: { type: "integer", minimum: 4, maximum: 40 },
          recommended_priority: {
            type: "string",
            enum: ["High", "Medium", "Low"],
          },
          recommendation_reason: { type: "string" },
        },
      },
    },
  },
} as const;

type ScoreOpportunitiesInput<T extends ScorableOpportunity> = {
  competitors: CompetitorInput[];
  opportunities: T[];
};

type ScorableOpportunity = {
  opportunity_title: string;
  gap_type: string;
  priority: Priority;
};

type ScoreFields = Omit<OpportunityScoreItem, "opportunity_title">;

async function loadScorerPrompt() {
  return readFile(
    path.join(process.cwd(), "prompts", "opportunity_scorer.md"),
    "utf8",
  );
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(10, Math.max(1, Math.round(value)));
}

function priorityFromScore(
  totalScore: number,
  userValue: number,
  agentFit: number,
): Priority {
  if (totalScore >= 32 && userValue >= 8 && agentFit >= 8) {
    return "High";
  }

  if (totalScore >= 22) {
    return "Medium";
  }

  return "Low";
}

function normalizeScore(score: OpportunityScoreItem): OpportunityScoreItem {
  const userValue = clampScore(score.user_value);
  const differentiation = clampScore(score.differentiation);
  const feasibility = clampScore(score.feasibility);
  const agentFit = clampScore(score.agent_fit);
  const totalScore = userValue + differentiation + feasibility + agentFit;

  return {
    opportunity_title: score.opportunity_title,
    user_value: userValue,
    differentiation,
    feasibility,
    agent_fit: agentFit,
    total_score: totalScore,
    recommended_priority: priorityFromScore(totalScore, userValue, agentFit),
    recommendation_reason: score.recommendation_reason,
  };
}

function fallbackScore(opportunity: ScorableOpportunity): OpportunityScoreItem {
  const base = {
    High: {
      user_value: 8,
      differentiation: 8,
      feasibility: 8,
      agent_fit: opportunity.gap_type === "agent" ? 9 : 8,
    },
    Medium: {
      user_value: 6,
      differentiation: 6,
      feasibility: 7,
      agent_fit: opportunity.gap_type === "agent" ? 7 : 6,
    },
    Low: {
      user_value: 4,
      differentiation: 4,
      feasibility: 6,
      agent_fit: opportunity.gap_type === "agent" ? 5 : 4,
    },
  }[opportunity.priority];

  const totalScore =
    base.user_value + base.differentiation + base.feasibility + base.agent_fit;

  return {
    opportunity_title: opportunity.opportunity_title,
    ...base,
    total_score: totalScore,
    recommended_priority: priorityFromScore(
      totalScore,
      base.user_value,
      base.agent_fit,
    ),
    recommendation_reason:
      "评分模型暂不可用，使用本地兜底评分；请以原始机会点证据和优先级为主要参考。",
  };
}

function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }

    throw new Error("Scoring output was not valid JSON.");
  }
}

function mergeScores<T extends ScorableOpportunity>(
  opportunities: T[],
  scores: OpportunityScoreItem[],
): Array<T & ScoreFields> {
  const scoreMap = new Map(
    scores.map((score) => [score.opportunity_title, normalizeScore(score)]),
  );

  return opportunities.map((opportunity) => ({
    ...opportunity,
    ...(scoreMap.get(opportunity.opportunity_title) ??
      fallbackScore(opportunity)),
  }));
}

async function requestModelScores<T extends ScorableOpportunity>(
  input: ScoreOpportunitiesInput<T>,
) {
  const config = getAiConfig(DEFAULT_MODEL);

  if (!config) {
    throw new Error(getAiConfigMissingMessage());
  }

  const prompt = await loadScorerPrompt();
  const client = createAiClient(config, OPENAI_TIMEOUT_MS);

  if (config.provider === "dashscope") {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "user",
          content: [prompt, "", JSON.stringify(input, null, 2)].join("\n"),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
    });
    const parsed = parseJson(response.choices[0]?.message?.content ?? "");
    const result = OpportunityScoringOutputSchema.safeParse(parsed);

    if (!result.success) {
      throw new Error("Scoring output did not match the expected schema.");
    }

    return result.data.scores;
  }

  const response = await client.responses.create({
    model: config.model,
    input: [
      prompt,
      "",
      "请对以下机会点进行二次评分，只返回符合 schema 的 JSON：",
      JSON.stringify(input, null, 2),
    ].join("\n"),
    reasoning: { effort: "low" },
    max_output_tokens: 3000,
    text: {
      verbosity: "low",
      format: {
        type: "json_schema",
        name: "opportunity_scores",
        strict: true,
        schema: scoringSchema,
      },
    },
    store: false,
  });

  const parsed = parseJson(response.output_text);
  const result = OpportunityScoringOutputSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error("Scoring output did not match the expected schema.");
  }

  return result.data.scores;
}

export async function scoreOpportunities<T extends ScorableOpportunity>(
  input: ScoreOpportunitiesInput<T>,
): Promise<Array<T & ScoreFields>> {
  if (input.opportunities.length === 0) {
    return [];
  }

  try {
    const scores = await requestModelScores(input);
    return mergeScores(input.opportunities, scores);
  } catch {
    return input.opportunities.map((opportunity) => ({
      ...opportunity,
      ...fallbackScore(opportunity),
    }));
  }
}
