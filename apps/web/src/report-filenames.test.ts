import { describe, expect, it } from "vitest";
import { buildFreeReportFilename } from "./report-filenames.js";

describe("report filenames", () => {
  it("uses generated date instead of birth data for free report downloads", () => {
    const filename = buildFreeReportFilename("2026-05-16T00:00:00.000Z");

    expect(filename).toBe("saju-lab-report-20260516.html");
    expect(filename).not.toContain("1990");
    expect(filename).not.toContain("01-01");
    expect(filename).not.toContain("10:30");
  });
});
