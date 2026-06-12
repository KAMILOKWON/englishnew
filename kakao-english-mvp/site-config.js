/**
 * 운영 설정 — 출시 전 이 파일만 수정하면 됩니다.
 * kakaoChannelUrl: 카카오톡 채널 "채널 추가" 링크 (비어 있으면 안내 문구 표시)
 * launchMode: "pilot" = 무료 체험 신청만 | "commerce" = 결제 UI (PG 연동 전 데모)
 */
window.SITE_CONFIG = {
  siteUrl: "https://kamilokwon.github.io/englishnew/",
  brandNameKo: "데일리톡잉글리시",
  brandNameEn: "Daily Talk English",
  kakaoChannelUrl: "",
  supportEmail: "hello@dailytalkenglish.kr",
  supportPhone: "",
  launchMode: "pilot",
  pilotTrialDays: 7,
  showAdminNav: false,
  seedSampleData: false,
  defaultPreferredTime: "08:30",
  // 백엔드 API 주소. 비어 있으면 데모 모드(저장만 하고 발송 안 함).
  // server/index.js 로 서빙하면 자동으로 "/api"가 주입되고,
  // GitHub Pages 등 정적 호스팅이면 배포한 백엔드 URL을 직접 넣는다.
  apiBaseUrl: "",
};
