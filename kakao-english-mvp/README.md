# Daily Talk English MVP

고객에게 매일 카카오톡으로 짧은 영어 메시지를 보내는 서비스의 1차 MVP입니다.

## 실행

브라우저에서 `index.html`을 열면 바로 실행됩니다.

```text
kakao-english-mvp/index.html
```

## 검증

Codex 번들 런타임에 Playwright와 Chrome 실행 권한이 있는 환경에서는 아래 명령으로 핵심 흐름을 검사할 수 있습니다.

```bash
NODE_PATH=/Users/kwon-oin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules /Users/kwon-oin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node kakao-english-mvp/smoke-test.cjs
```

## 구현된 범위

- 랜딩/서비스 소개 화면
- 수신 신청 폼
- 고객 수신 동의 저장
- 오늘의 영어 표현 페이지
- 표현 아카이브
- 관리자 대시보드
- 영어 메시지 작성/수정/삭제
- 카카오 채널 관리자센터에 붙여넣을 발송 문구 생성
- 수동 발송 완료 기록
- 카카오 링크 유입 클릭 로그
- 고객 CSV 복사

## 아직 제외한 범위

- 카카오 비즈메시지 API 실연동
- 자동 대량 발송
- 실제 결제
- 서버 DB
- 관리자 계정 인증

초기 검증은 로컬 저장소 기반으로 동작합니다. 고객 반응이 검증되면 Supabase DB, 관리자 인증, Toss Payments, 공식 딜러사 기반 메시지 API 연동 순서로 확장하는 것이 좋습니다.
