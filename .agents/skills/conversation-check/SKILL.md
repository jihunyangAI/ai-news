---
name: conversation-check
description: 커밋 전에 변경된 코드의 품질을 검토하는 스킬. 코딩 컨벤션 준수 여부와 코드 품질을 점검한다.
disable-model-invocation: true
allowed-tools: Bash(git *)
---

# 커밋 전 코드 품질 검토

검토 기준: [conversations.md](./conversations.md)

## 실행 순서

1. **변경된 파일 목록을 가져온다.**
   - `git branch --show-current`로 현재 브랜치를 확인한다.
   - 커밋하지 않은 변경: `git status --short`, `git diff HEAD --name-only`
   - 메인 브랜치가 아니면 메인 이후 이 브랜치에서 커밋한 변경도 포함한다: `git diff <메인>...HEAD --name-only` (메인은 `git symbolic-ref refs/remotes/origin/HEAD`로 확인)
   - 코드 파일(`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`)만 검토한다. 변경된 코드 파일이 없으면 알려주고 멈춘다.

2. **`conversations.md`의 규칙으로 변경된 코드를 검토한다.**
   - `conversations.md`를 먼저 읽는다.
   - 파일 전체가 아니라 바뀐 부분(`git diff`)을 중심으로 보되, 판단에 필요하면 파일을 읽는다.
   - 규칙마다 '✅ 통과' 또는 '⚠️ 개선필요'로 표시한다. 형식:

     | 구분 | 규칙 | 결과 | 위치 |
     |---|---|---|---|
     | 네이밍 | 변수명·함수명 카멜 케이스 | ✅ 통과 | |
     | 코드 품질 | `console.log` 제거 | ⚠️ 개선필요 | `src/lib/foo.ts:12` |

3. **'개선필요' 항목이 있으면 고치는 방법을 코드 예시와 함께 알려준다.**
   - 항목마다 `파일:줄`, 문제가 되는 현재 코드, 고친 코드를 보여준다.
   - 코드는 직접 고치지 않는다. 사용자가 요청하면 그때 고친다.

4. **모든 항목이 '통과'이면 "커밋준비가 완료되었습니다"를 출력한다.**
