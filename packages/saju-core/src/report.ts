import type { Confidence, ReportInput, ReportV1 } from "./types.js";
import { buildReportSections } from "./report-rules.js";

export function generateReportV1(input: ReportInput): ReportV1 {
  const timeKnown = input.input.birthTime !== undefined;
  const confidence: Confidence = timeKnown ? "medium" : "low";
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const locale = input.locale ?? "ko";
  const generatedYear = new Date(generatedAt).getUTCFullYear();
  const sections = buildReportSections({
    birthInput: input.input,
    pillars: input.pillars,
    generatedYear
  });

  return {
    meta: {
      version: "1.0",
      generatedAt,
      locale,
      timeKnown,
      confidence
    },
    input: input.input,
    pillars: input.pillars,
    ...sections
  };
}
