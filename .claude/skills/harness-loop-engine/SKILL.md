---
name: harness-loop-engine
description: 루프 엔지니어링 기반 자율 에이전트 하네스. 중간 상태 안내 텍스트 없이 도구를 연쇄 호출해 커밋→푸시→PR→자체검증→머지→main 동기화까지 자율 직행하고, 완료 시 1회만 표로 보고한다. 사용자가 "하네스 모드", "자율 진행", "harness", "루프 엔지니어링"이라 하거나 여러 단계의 PR/배포 작업을 위임할 때 활성화한다.
---

# Harness Loop Engine — Karpathy loop engineering (Project-local)

> 이식용 인스턴스. 전역 사본은 `~/.claude/skills/harness-loop-engine/SKILL.md`.
> 어느 repo든 이 파일 + 루트 `CLAUDE.md` 하네스 블록만 두면 동일 환경이 복제된다.

활성화되면 아래 방식으로 동작한다. 목적: 사람의 턴-바이-턴 승인 대기를 없애고, 한 번의 위임으로 파이프라인 끝까지 자율 완주.

## 자율 수칙
- **중간 상태 텍스트 금지.** 도구 실행 사이에 턴 넘김·승인 유도 문장을 출력하지 않는다. 독립 호출은 병렬, 의존 호출은 멈춤 없이 연쇄로.
- **최종 1회 보고.** 파이프라인이 완전히 끝난 시점에만 결과를 1회, 간결한 표로.
- **완료의 정의 = 머지 + 로컬 main 동기화.** PR 생성에서 멈추지 않는다.

## 자율 파이프라인 (표준)
1. worktree 작업: `git worktree add .claude/worktrees/<name> <branch>` + EnterWorktree(path)
2. commit → `git push -u`
3. `gh pr create --base main`
4. 리뷰 스레드 검토 → 코멘트 있으면 대응, 없으면 `review` 스킬로 자체검증 후 `gh pr comment` 기록
5. **머지 직전 `git fetch origin && git merge origin/main`** — WORKLOG는 세션마다 맨 위에 붙이므로 오래 열린 PR은 거의 항상 거기서 충돌한다. 충돌은 worktree에서 풀고 push한 뒤 머지한다(#77·#83 실측). 그 다음 `gh pr merge N --squash` (worktree 안에서 `--delete-branch` 금지 → 수동 정리)
6. **`[ "$(gh pr view N --json state --jq .state)" = MERGED ]`를 통과한 뒤에만** ExitWorktree(keep) → `git pull --ff-only origin main` → `rm -rf <worktree>` → `git worktree prune` → `git branch -D` → `git push origin --delete <branch>`. 머지가 실패했는데 원격 브랜치를 지우면 PR이 CLOSED로 간다(#77, 2026-09-16 실제 발생 — `refs/pull/N/head`로 복구). exit 코드를 보지 않는 정리 스크립트 금지.

## 멈춰서 1회만 묻는 예외 (그 외엔 직행)
- 서명 빌드 등 키스토어 비밀번호 필요 단계 → `!`로 사용자 직접.
- 승인 근거 없는 비가역·외부영향 행위, 또는 방향이 갈리는 진짜 모호한 결정.
