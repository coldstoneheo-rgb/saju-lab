---
description: saju-lab 검증 게이트(npm run verify)를 실행하고 PASS/FAIL을 보고한다
---

`npm run verify`를 실행한다 — typecheck && test && build && `npm audit --audit-level=moderate` && `git diff --check`.

- 실패하면: 어느 단계에서 깨졌는지, 관련 출력, 가장 가능성 높은 원인을 보고한다. 통과할 때까지 고친다.
- 통과하면: 한 줄로 PASS를 보고한다. 통과를 가정하지 말고 실제 출력으로 확인한다.
