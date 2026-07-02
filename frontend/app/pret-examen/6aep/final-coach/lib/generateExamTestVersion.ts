import { getExamTestForDayAndVersion } from "./examQuestionBank";
import { DailyTestContent } from "./testData";

/**
 * Generates an exam-style test version for the specified day of revision.
 * Restricts all generated questions strictly to real, adapted, or generated regional exam formats.
 */
export function generateExamTestVersion(day: number, version: 'A' | 'B' | 'C'): DailyTestContent {
  return getExamTestForDayAndVersion(day, version);
}
