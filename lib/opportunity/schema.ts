import { z } from "zod";

export const CapabilityLevelSchema = z.enum(["low", "medium", "high"]);
export const PrioritySchema = z.enum(["High", "Medium", "Low"]);

const scoreValueSchema = z.number().int().min(1).max(10);

/**
 * Standard competitor input for opportunity analysis.
 *
 * The snake_case fields are the preferred shape. Legacy camelCase fields stay
 * optional so existing callers can still post older /api/analyze results or
 * hand-written competitor lists without breaking the route.
 */
export const CompetitorInputSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    product_name: z.string().trim().min(1).optional(),
    category: z.string().optional(),
    positioning: z.string().optional(),
    core_features: z.array(z.string()).optional(),
    target_users: z.array(z.string()).optional(),
    key_scenarios: z.array(z.string()).optional(),
    pricing: z.string().optional(),
    workflow_depth: CapabilityLevelSchema.optional(),
    automation_level: CapabilityLevelSchema.optional(),
    agent_capability: CapabilityLevelSchema.optional(),
    collaboration_support: CapabilityLevelSchema.optional(),
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    evidence: z.array(z.string()).optional(),
    coreFeatures: z.array(z.string()).optional(),
    users: z.array(z.string()).optional(),
    scenarios: z.array(z.string()).optional(),
  })
  .passthrough()
  .refine((value) => Boolean(value.product_name || value.name), {
    message: "competitor requires product_name or name",
  });

export const OpportunityAnalysisInputSchema = z.object({
  competitors: z
    .array(CompetitorInputSchema)
    .min(1, "competitors must contain at least one product")
    .max(12, "competitors must contain no more than 12 products"),
});

export const GapTypeSchema = z.enum([
  "用户",
  "场景",
  "流程",
  "agent",
  "商业化",
]);

export const OpportunityScoreSchema = z.object({
  user_value: scoreValueSchema,
  differentiation: scoreValueSchema,
  feasibility: scoreValueSchema,
  agent_fit: scoreValueSchema,
  total_score: z.number().int().min(4).max(40),
  recommended_priority: PrioritySchema,
  recommendation_reason: z.string().trim().min(1),
});

export const OpportunitySchema = z
  .object({
    opportunity_title: z.string().trim().min(1),
    gap_type: GapTypeSchema,
    related_products: z.array(z.string().trim().min(1)).min(1),
    evidence: z.string().trim().min(1),
    unmet_need: z.string().trim().min(1),
    agent_leverage: z.string().trim().min(1),
    product_direction: z.string().trim().min(1),
    mvp_idea: z.string().trim().min(1),
    priority: PrioritySchema,
    priority_reason: z.string().trim().min(1),
  })
  .merge(OpportunityScoreSchema.partial());

export const OpportunityAnalysisOutputSchema = z.object({
  opportunities: z.array(OpportunitySchema).min(1).max(8),
});

export const OpportunityScoreItemSchema = OpportunityScoreSchema.extend({
  opportunity_title: z.string().trim().min(1),
});

export const OpportunityScoringOutputSchema = z.object({
  scores: z.array(OpportunityScoreItemSchema).min(1).max(8),
});

export type CapabilityLevel = z.infer<typeof CapabilityLevelSchema>;
export type CompetitorInput = z.infer<typeof CompetitorInputSchema>;
export type OpportunityAnalysisInput = z.infer<
  typeof OpportunityAnalysisInputSchema
>;
export type GapType = z.infer<typeof GapTypeSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type OpportunityScore = z.infer<typeof OpportunityScoreSchema>;
export type OpportunityScoreItem = z.infer<typeof OpportunityScoreItemSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type OpportunityAnalysisOutput = z.infer<
  typeof OpportunityAnalysisOutputSchema
>;
