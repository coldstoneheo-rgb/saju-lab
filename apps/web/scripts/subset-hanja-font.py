"""한자 서브셋 woff2 재생성 — 지금 서브셋에 든 글자 + 인자로 준 글자를 원본 폰트에서 다시 뽑는다.

원본: Noto Serif KR SemiBold 2.003 (OFL, notofonts/noto-cjk Serif/SubsetOTF/KR/NotoSerifKR-SemiBold.otf).
옵션 `--layout-features=*`는 기존 59자 파일(#89)을 바이트 동일하게 재현한다(2026-11-10 sha256 대조).
사용: python apps/web/scripts/subset-hanja-font.py <NotoSerifKR-SemiBold.otf> "<추가할 글자>"
필요: pip install fonttools brotli
"""
import subprocess
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

FONT = Path(__file__).resolve().parent.parent / "public" / "fonts" / "noto-serif-kr-hanja-600.woff2"


def main() -> None:
    source, extra = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "")
    points = set(TTFont(FONT).getBestCmap()) | {ord(char) for char in extra if not char.isspace()}
    unicodes = ",".join(f"U+{point:04X}" for point in sorted(points))
    subprocess.run(
        [sys.executable, "-m", "fontTools.subset", source, f"--unicodes={unicodes}", "--layout-features=*", "--flavor=woff2", f"--output-file={FONT}"],
        check=True,
    )
    print(f"{FONT.name}: {len(points)} code points, {FONT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
