import { describe, expect, it } from "vitest";
import { validateInputDraft } from "./input-validation.js";

describe("input draft validation", () => {
  it("asks for a birth date before calculation", () => {
    expect(validateInputDraft({ birthDate: "", birthTime: "10:30", timeUnknown: false })).toContain("생년월일을 입력");
  });

  it("rejects malformed or impossible Gregorian dates", () => {
    expect(validateInputDraft({ birthDate: "1990/01/01", birthTime: "10:30", timeUnknown: false })).toContain("실제 존재하는 양력 날짜");
    expect(validateInputDraft({ birthDate: "2024-02-31", birthTime: "10:30", timeUnknown: false })).toContain("실제 존재하는 양력 날짜");
  });

  it("rejects malformed birth times when time is known", () => {
    expect(validateInputDraft({ birthDate: "1990-01-01", birthTime: "24:00", timeUnknown: false })).toContain("00:00부터 23:59");
  });

  it("allows empty birth time when time unknown is selected", () => {
    expect(validateInputDraft({ birthDate: "1990-01-01", birthTime: "", timeUnknown: true })).toBeUndefined();
  });
});
