import { summarizeMedicalReport } from "@/services/medicalReportSummaryService";

export async function analyzeMedicalReport(reportText: string): Promise<string> {
  return summarizeMedicalReport(reportText);
}
