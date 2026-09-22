#!/usr/bin/env python3
"""Fetch the day pillar (일진) for Gregorian dates from the data.go.kr 음양력 API.

Source: 한국천문연구원_음양력 정보 (LrsrCldInfoService/getLunCalInfo) — the
response field `lunIljin` carries the day's 간지 in Hangul+Hanja, e.g. "병인(丙寅)".
The output is ready to paste into docs/golden/GOLDEN-PILLARS.md: the romanised
label plus the exact request URL as the 출처.

Usage:
    python scripts/fetch_golden_day_pillars.py 1990-01-01 2011-11-08

The service key is read from PUBLIC_DATA_API_KEY (or the other names the
solar-term collector accepts). The key must have this API's 활용신청 approved;
otherwise the API answers SERVICE_KEY_IS_NOT_REGISTERED_ERROR.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

ENDPOINT = "https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo"
SERVICE_KEY_ENV_NAMES = ("PUBLIC_DATA_API_KEY", "KASI_SPECIAL_DAYS_SERVICE_KEY", "DATA_GO_KR_API_KEY", "SERVICE_KEY")

STEM_BY_HANGUL = {"갑": "gap", "을": "eul", "병": "byeong", "정": "jeong", "무": "mu",
                  "기": "gi", "경": "gyeong", "신": "sin", "임": "im", "계": "gye"}
BRANCH_BY_HANGUL = {"자": "ja", "축": "chuk", "인": "in", "묘": "myo", "진": "jin", "사": "sa",
                    "오": "o", "미": "mi", "신": "sin", "유": "yu", "술": "sul", "해": "hae"}


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__)
        return 2
    key = next((os.environ[name] for name in SERVICE_KEY_ENV_NAMES if os.environ.get(name)), None)
    if key is None:
        print(f"service key not found in {', '.join(SERVICE_KEY_ENV_NAMES)}", file=sys.stderr)
        return 2

    print("| 생년월일 | 일주 | lunIljin | 출처 |")
    print("| --- | --- | --- | --- |")
    for date in argv:
        year, month, day = date.split("-")
        query = urllib.parse.urlencode({"solYear": year, "solMonth": month, "solDay": day, "_type": "json"})
        url = f"{ENDPOINT}?{query}"
        try:
            with urllib.request.urlopen(f"{url}&serviceKey={urllib.parse.quote(key, safe='')}") as response:
                payload = json.load(response)
        except urllib.error.HTTPError as error:  # data.go.kr answers 403 with a JSON/XML body for key errors
            body = error.read().decode("utf-8", "replace")
            try:
                payload = json.loads(body)
            except json.JSONDecodeError:
                payload = {"OpenAPI_ServiceResponse": {"cmmMsgHeader": {"errMsg": f"HTTP {error.code}: {body[:120]}"}}}
        item = extract_item(payload)
        if item is None:
            print(f"| {date} | ? | ? | {describe_error(payload)} |")
            continue
        iljin = item.get("lunIljin", "")
        print(f"| {date} | {romanise(iljin)} | {iljin} | data.go.kr 한국천문연구원_음양력 정보 getLunCalInfo `{url}` (조회 {today()}) |")
    return 0


def extract_item(payload: dict) -> dict | None:
    try:
        items = payload["response"]["body"]["items"]["item"]
    except (KeyError, TypeError):
        return None
    if isinstance(items, list):
        return items[0] if items else None
    return items


def describe_error(payload: dict) -> str:
    header = payload.get("OpenAPI_ServiceResponse", {}).get("cmmMsgHeader", {})
    return header.get("errMsg") or header.get("returnAuthMsg") or json.dumps(payload, ensure_ascii=False)[:120]


def romanise(iljin: str) -> str:
    """'병인(丙寅)' → 'byeong-in'."""
    hangul = iljin.split("(")[0].strip()
    if len(hangul) != 2:
        return "?"
    stem = STEM_BY_HANGUL.get(hangul[0])
    branch = BRANCH_BY_HANGUL.get(hangul[1])
    return f"{stem}-{branch}" if stem and branch else "?"


def today() -> str:
    from datetime import date

    return date.today().isoformat()


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
