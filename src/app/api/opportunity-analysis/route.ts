import { NextResponse } from "next/server";
import {
  analyzeOpportunity,
  OpportunityAnalysisError,
  type OpportunityAnalysisErrorCode,
} from "../../../../lib/opportunity/analyzeOpportunity";

export const runtime = "nodejs";

type ErrorResponse = {
  error: {
    code: OpportunityAnalysisErrorCode;
    message: string;
  };
};

function errorResponse(
  code: OpportunityAnalysisErrorCode,
  message: string,
  status: number,
) {
  return NextResponse.json<ErrorResponse>(
    { error: { code, message } },
    { status },
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_INPUT",
      "Request body must be valid JSON.",
      400,
    );
  }

  try {
    /**
     * Public contract:
     *   POST /api/opportunity-analysis
     *   body: { competitors: [...] }
     *   response: { opportunities: [...] }
     *
     * Validation, model execution, JSON parsing, and fallback handling live in
     * lib/opportunity/analyzeOpportunity.ts so the same logic can be reused by
     * server actions, scripts, or future routes.
     */
    const result = await analyzeOpportunity(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OpportunityAnalysisError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "OPENAI_REQUEST_FAILED",
      "Failed to generate opportunity analysis.",
      500,
    );
  }
}
