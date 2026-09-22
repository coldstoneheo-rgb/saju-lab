interface InputDraft {
  birthDate: string;
  birthTime: string;
  timeUnknown: boolean;
  /** "lunar" skips the Gregorian existence check; the core validates the lunar date itself. */
  calendar?: "solar" | "lunar";
}

export function validateInputDraft(input: InputDraft): string | undefined {
  if (input.birthDate.trim() === "") {
    return "생년월일을 입력해 주세요. 양력 기준 YYYY-MM-DD 형식이 필요합니다.";
  }

  if (input.calendar === "lunar") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
      return "음력 생년월일은 YYYY-MM-DD 형식으로 입력해 주세요.";
    }
  } else if (!isValidDateString(input.birthDate)) {
    return "생년월일을 다시 확인해 주세요. 실제 존재하는 양력 날짜만 입력할 수 있습니다.";
  }

  if (!input.timeUnknown && input.birthTime !== "" && !isValidTimeString(input.birthTime)) {
    return "출생시간은 00:00부터 23:59 사이로 입력해 주세요.";
  }

  return undefined;
}

function isValidDateString(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isValidTimeString(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, hourText, minuteText] = match;
  const hour = Number(hourText);
  const minute = Number(minuteText);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}
