export function toFriendlyError(caught: unknown): string {
  const message = caught instanceof Error ? caught.message : "";

  if (message.includes("birthTime is required")) {
    return "절기 경계일에는 출생시간이 필요합니다. 현재 MVP에서는 이 날짜를 시간 미상으로 계산할 수 없으니, 가능한 정확한 시간을 입력해 주세요.";
  }

  if (message.includes("No upper solar month boundary") || message.includes("No solar month boundary") || message.includes("No Ipchun boundary")) {
    return "현재 MVP 계산 범위를 벗어난 날짜입니다. 검증된 절기 데이터 범위가 확장되면 지원할 예정입니다.";
  }

  if (message.includes("valid Gregorian date")) {
    return "생년월일을 다시 확인해 주세요. 실제 존재하는 양력 날짜만 입력할 수 있습니다.";
  }

  if (message.includes("HH:mm")) {
    return "출생시간은 00:00부터 23:59 사이로 입력해 주세요.";
  }

  if (message.includes("Asia/Seoul")) {
    return "현재 MVP는 Asia/Seoul 타임존만 지원합니다.";
  }

  return "리포트를 생성하지 못했습니다. 입력값을 다시 확인해 주세요.";
}
