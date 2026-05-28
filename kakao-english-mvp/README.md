# Daily Talk English Commerce MVP

웹사이트에서 영어 루틴 상품을 판매하고, 결제 완료 고객에게 매일 카카오톡 알림톡으로 짧은 영어 표현을 보내는 커머스형 MVP입니다.

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

- 1day1message 참고 구조의 웹 커머스 홈
- 상품 카드와 상품 상세 페이지
- 네이버페이/카카오페이 선택형 결제 화면
- 결제 완료 후 주문/구독/고객 정보 로컬 저장
- 카카오 알림톡 수신 동의 저장
- 결제 완료 및 마이페이지 화면
- 오늘의 영어 표현 페이지
- 표현 아카이브
- 관리자 대시보드
- 영어 메시지 작성/수정/삭제
- 카카오 채널 관리자센터에 붙여넣을 발송 문구 생성
- 수동 발송 완료 기록 (확인 모달 포함)
- 카카오 링크 유입 클릭 로그
- 고객 CSV 복사
- 개인정보 처리방침 / 이용약관 / 환불·해지 정책 페이지 (MVP 초안)
- 신청·결제 시 필수/선택 동의 분리, 동의 버전·시각·UA 기록
- 카카오 알림톡 수신거부 페이지 (고객 상태 `unsubscribed` 처리)
- 관리자 화면 클라이언트 게이트 (MVP용, 실제 보안 아님)
- 관리자 고객 검색·상태 필터·정렬
- 30일치 영어 표현 시드 콘텐츠
- SEO 메타/OG 태그, `robots.txt`, `sitemap.xml`, `404.html`

## 아직 제외한 범위

- 카카오 비즈메시지 API 실연동
- 자동 대량 발송
- 네이버페이/카카오페이 실제 승인 및 웹훅 검증
- 서버 DB
- 관리자 계정 **서버 인증** (현재는 클라이언트 게이트 `admin1234`, 출시 전 서버 세션/토큰으로 교체 필요)
- 동의 시 IP 기록 (클라이언트 불가, 서버에서 기록 필요)
- 정책 문서 법무 검토, 실제 카카오 채널 추가 URL, 운영 도메인/캐노니컬 URL (코드 내 `TODO(launch)` 표시)

초기 검증은 로컬 저장소 기반으로 동작합니다. 고객 반응이 검증되면 서버 DB, 관리자 인증, 네이버페이/카카오페이 승인 API, 공식 딜러사 기반 카카오 알림톡 API 연동 순서로 확장하는 것이 좋습니다.
