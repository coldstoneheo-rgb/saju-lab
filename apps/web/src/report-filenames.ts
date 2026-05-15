export function buildFreeReportFilename(generatedAt: string): string {
  return `saju-lab-report-${formatGeneratedDate(generatedAt)}.html`;
}

export function formatGeneratedDate(generatedAt: string): string {
  return generatedAt.slice(0, 10).replaceAll("-", "");
}
