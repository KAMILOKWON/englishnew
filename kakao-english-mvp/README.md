# 데일리톡잉글리시 (Daily Talk English) MVP

매일 아침 카카오 알림톡으로 영어 표현을 받는 웹 서비스 MVP입니다.

**공개 URL:** https://kamilokwon.github.io/englishnew/

## 실행

**실서비스 모드(알림톡 발송 포함)** — 쏘다(ssodaa) API 연동 백엔드와 함께 실행:

```bash
node server/index.js   # 저장소 루트에서. 설정은 server/.env (server/README.md 참고)
# http://localhost:8765/ — 신청/구매 시 서버 등록 + 매일 정해진 시간에 알림톡 발송
```

**데모 모드(정적, 발송 없음)**:

```bash
cd kakao-english-mvp
python3 -m http.server 8765
# http://127.0.0.1:8765/
```

## 출시 전 설정 (`site-config.js`)

| 항목 | 설명 |
|------|------|
| `kakaoChannelUrl` | 카카오톡 채널 **채널 추가** 링크 (필수) |
| `supportEmail` / `supportPhone` | 고객 문의·정책 문서 표시 |
| `launchMode` | `pilot` = 7일 무료 체험(결제 없음) · `commerce` = 결제 UI 데모 |
| `siteUrl` | 운영 도메인 (SEO·발송 링크 기준) |

## 검증

```bash
cd kakao-english-mvp
npm install
npx playwright install chromium
npm run smoke
```

## 구현 범위

- 커머스형 랜딩·상품·체험 신청(파일럿) / 결제 UI(커머스 모드)
- 오늘의 표현·아카이브·마이페이지
- 관리자: 메시지 CRUD, 발송 문구 복사, 고객 CSV, 수신거부
- 개인정보·약관·환불·수신거부 페이지
- SEO(`robots.txt`, `sitemap.xml`, OG), GitHub Pages 배포

## 백엔드 연동 (`server/`)

쏘다(ssodaa) 알림톡 API 기반 백엔드가 `server/`에 있습니다. 구매/신청 등록, 동의 IP 기록, 환영 알림톡, **매일 희망 시각 자동 발송**, 수신거부, 관리자 API를 처리합니다. 자세한 설정은 [server/README.md](../server/README.md) 참고.

## 아직 서버가 필요한 항목

- PG(네이버페이/카카오페이) 실결제 연동 (현재는 데모 결제)
- 웹훅 수신·오류 추적(Sentry 등)

파일럿은 `localStorage` + 수동 발송으로도 운영 가능합니다.
