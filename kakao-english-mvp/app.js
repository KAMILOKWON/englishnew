const STORAGE_KEYS = {
  customers: "daily-talk-customers",
  messages: "daily-talk-messages",
  deliveries: "daily-talk-deliveries",
  clicks: "daily-talk-clicks",
  adminTab: "daily-talk-admin-tab",
};

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const memoryStore = new Map();

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readStore(key, fallback) {
  try {
    if (storageAvailable()) {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    }
    return memoryStore.has(key) ? memoryStore.get(key) : fallback;
  } catch {
    return memoryStore.has(key) ? memoryStore.get(key) : fallback;
  }
}

function writeStore(key, value) {
  memoryStore.set(key, value);
  try {
    if (storageAvailable()) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Some embedded browsers block localStorage on file:// pages.
  }
}

function getItem(key) {
  try {
    if (storageAvailable()) {
      return localStorage.getItem(key);
    }
  } catch {
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  }
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}

function setItem(key, value) {
  try {
    if (storageAvailable()) {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Fall back below.
  }
  memoryStore.set(key, value);
}

function storageAvailable() {
  try {
    const key = "__daily_talk_storage_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function seedData() {
  const messages = readStore(STORAGE_KEYS.messages, []);
  const customers = readStore(STORAGE_KEYS.customers, []);

  if (messages.length === 0) {
    writeStore(STORAGE_KEYS.messages, [
      {
        id: uid("msg"),
        sendDate: todayISO(),
        title: "오늘의 1분 영어",
        englishPhrase: "I'm tied up right now.",
        koreanMeaning: "지금 좀 바빠요.",
        pronunciation: "아임 타이드 업 라잇 나우",
        explanation:
          "회의, 통화, 업무 중 바로 응답하기 어려울 때 쓰는 자연스러운 표현입니다.",
        exampleSentence1:
          "I'm tied up right now, but I'll call you back in 10 minutes.",
        exampleSentence2:
          "Can we talk later? I'm tied up with a client.",
        quizQuestion: '"지금 좀 바빠요"를 영어로 고르면?',
        quizAnswer: "I'm tied up right now.",
        ctaLabel: "예문과 퀴즈 보기",
        ctaUrl: "",
        status: "ready",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uid("msg"),
        sendDate: offsetDate(1),
        title: "내일의 1분 영어",
        englishPhrase: "Let me get back to you.",
        koreanMeaning: "확인하고 다시 말씀드릴게요.",
        pronunciation: "렛 미 겟 백 투 유",
        explanation:
          "즉답하기 어렵지만 책임 있게 다시 답하겠다는 인상을 주는 업무 영어입니다.",
        exampleSentence1:
          "Let me get back to you after I check the schedule.",
        exampleSentence2: "That's a good question. Let me get back to you.",
        quizQuestion: '"확인하고 다시 말씀드릴게요"에 가까운 표현은?',
        quizAnswer: "Let me get back to you.",
        ctaLabel: "복습하기",
        ctaUrl: "",
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }

  if (customers.length === 0) {
    writeStore(STORAGE_KEYS.customers, [
      {
        id: uid("cus"),
        name: "샘플 고객",
        phone: "010-0000-0000",
        email: "sample@example.com",
        kakaoChannelAdded: true,
        consentMarketing: true,
        consentReceivedAt: new Date().toISOString(),
        level: "beginner",
        interest: "business",
        preferredTime: "08:30",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  if (!getItem(STORAGE_KEYS.deliveries)) {
    writeStore(STORAGE_KEYS.deliveries, []);
  }

  if (!getItem(STORAGE_KEYS.clicks)) {
    writeStore(STORAGE_KEYS.clicks, []);
  }
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function routeInfo() {
  const raw = window.location.hash.replace(/^#/, "") || "home";
  const [name, queryString = ""] = raw.split("?");
  const params = new URLSearchParams(queryString);
  return { name, params };
}

function navigate(hash) {
  window.location.hash = hash;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getMessages() {
  return readStore(STORAGE_KEYS.messages, []).sort((a, b) =>
    a.sendDate.localeCompare(b.sendDate),
  );
}

function getCustomers() {
  return readStore(STORAGE_KEYS.customers, []).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

function getDeliveries() {
  return readStore(STORAGE_KEYS.deliveries, []);
}

function getClicks() {
  return readStore(STORAGE_KEYS.clicks, []);
}

function findMessageByDate(date) {
  const messages = getMessages();
  return (
    messages.find((message) => message.sendDate === date) ||
    messages.find((message) => message.status === "ready") ||
    messages[0]
  );
}

function publicDailyUrl(message) {
  const base = window.location.href.split("#")[0];
  return `${base}#today?date=${encodeURIComponent(message.sendDate)}&from=kakao`;
}

function buildKakaoCopy(message) {
  return `${message.title}

${message.englishPhrase}
${message.koreanMeaning}

${message.explanation}

${message.ctaLabel || "예문과 퀴즈 보기"}
${publicDailyUrl(message)}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function statSummary() {
  const customers = getCustomers();
  const messages = getMessages();
  const deliveries = getDeliveries();
  const clicks = getClicks();
  return {
    activeCustomers: customers.filter((customer) => customer.status === "active")
      .length,
    messages: messages.length,
    deliveries: deliveries.length,
    clicks: clicks.length,
  };
}

const productSections = [
  {
    title: "추천합니다!",
    id: "recommended",
    products: [
      {
        title: "매일 아침, 카톡으로 받는 BBC 팟캐스트 영어",
        original: "42,000원",
        discount: "30%",
        price: "29,400원",
        countdown: "종료까지 01:48:47 남음",
        theme: "red",
        tag: "BBC",
      },
      {
        title: "매일 아침, 카톡으로 받는 미드 프렌즈 영어",
        original: "42,000원",
        discount: "30%",
        price: "29,400원",
        countdown: "종료까지 01:48:47 남음",
        theme: "yellow",
        tag: "FRIENDS",
      },
      {
        title: "출근길에 바로 쓰는 실전 비즈니스 영어",
        original: "42,000원",
        discount: "30%",
        price: "29,400원",
        countdown: "종료까지 01:48:47 남음",
        theme: "black",
        tag: "WORK",
      },
      {
        title: "90일 완성 여행 영어 회화",
        original: "28,000원",
        discount: "30%",
        price: "19,600원",
        countdown: "종료까지 01:48:47 남음",
        theme: "blue",
        tag: "TRIP",
      },
    ],
  },
  {
    title: "영어",
    id: "english-products",
    products: [
      {
        title: "글로벌 뉴스로 배우는 고급 실용 영어",
        original: "42,000원",
        discount: "30%",
        price: "29,400원",
        countdown: "종료까지 01:48:47 남음",
        theme: "mint",
        tag: "NEWS",
      },
      {
        title: "하루에 한 문장 초급 영어 루틴",
        original: "28,000원",
        discount: "30%",
        price: "19,600원",
        countdown: "종료까지 01:48:47 남음",
        theme: "cream",
        tag: "BASIC",
      },
      {
        title: "고객 응대에 바로 쓰는 영어 표현",
        original: "42,000원",
        discount: "30%",
        price: "29,400원",
        countdown: "종료까지 01:48:47 남음",
        theme: "green",
        tag: "CS",
      },
      {
        title: "토익스피킹 아침 5문장 챌린지",
        original: "42,000원",
        discount: "30%",
        price: "29,400원",
        countdown: "종료까지 01:48:47 남음",
        theme: "purple",
        tag: "TEST",
      },
    ],
  },
  {
    title: "SET",
    id: "set-products",
    products: [
      {
        title: "직장인 영어 루틴 3종 패키지",
        original: "126,000원",
        discount: "50%",
        price: "63,000원",
        countdown: "종료까지 01:48:47 남음",
        theme: "black",
        tag: "SET",
      },
      {
        title: "여행 영어와 일상 회화 완성 패키지",
        original: "84,000원",
        discount: "45%",
        price: "46,200원",
        countdown: "종료까지 01:48:47 남음",
        theme: "blue",
        tag: "PACK",
      },
      {
        title: "초급부터 비즈니스까지 180일 영어",
        original: "152,000원",
        discount: "50%",
        price: "76,000원",
        countdown: "종료까지 01:48:47 남음",
        theme: "red",
        tag: "180일",
      },
    ],
  },
];

function shell(content) {
  const current = routeInfo().name;
  return `
    <div class="app-shell">
      <header class="store-header">
        <div class="store-header-main">
          <a class="menu-button" href="#home" aria-label="메뉴">☰</a>
          <a class="store-logo" href="#home" aria-label="Daily Talk English 홈">DAILY TALK ENGLISH</a>
          <a class="cart-button" href="#subscribe" aria-label="신청">♡</a>
        </div>
        <nav class="store-nav" aria-label="상품 카테고리">
          ${navLink("home", "All")}
          <a href="#recommended">추천</a>
          <a href="#english-products">영어</a>
          <a href="#set-products">SET</a>
          ${navLink("subscribe", "수신신청")}
          ${navLink("archive", "아카이브")}
          ${navLink("admin", "관리자")}
        </nav>
      </header>
      ${content}
      <a class="cs-button" href="#subscribe" aria-label="고객 문의">CS</a>
      <footer class="footer">
        <div class="container">
          <strong>Daily Talk English</strong>
          <span class="muted"> · 매일 아침, 카톡으로 받는 영어 루틴</span>
          <nav class="footer-links" aria-label="정책 및 고객 안내">
            <a href="#privacy">개인정보처리방침</a>
            <a href="#terms">이용약관</a>
            <a href="#refund">환불/해지 정책</a>
            <a href="#unsubscribe">알림톡 수신거부</a>
          </nav>
        </div>
      </footer>
    </div>
  `;

  function navLink(view, label) {
    const isActive =
      current === view ||
      (view === "home" && current === "") ||
      (view === "today" && current === "thanks");
    return `<a class="${isActive ? "active" : ""}" href="#${view}">${label}</a>`;
  }
}

function renderHome() {
  const stats = statSummary();
  return shell(`
    <main class="store-main">
      <section class="store-hero">
        <div class="hero-kicker">DAILY TALK ENGLISH × KAKAO ROUTINE</div>
        <div class="hero-stage" aria-hidden="true">
          <div class="mock-phone phone-left">
            <div class="mock-notch"></div>
            <div class="mock-bar">1day english</div>
            <div class="mock-card">오늘의 표현<br /><strong>I'm tied up right now.</strong></div>
            <div class="mock-card soft">쉽게 이해하기<br />바쁜 상황을 정중하게 말해요.</div>
          </div>
          <div class="mock-phone phone-right">
            <div class="mock-notch"></div>
            <div class="mock-news">Daily English Plus</div>
            <div class="mock-photo"></div>
            <div class="mock-caption">카톡 링크로 바로 복습</div>
          </div>
        </div>
        <div class="store-hero-copy">
          <h1>국내 최다 카톡 영어 루틴<br />데일리톡잉글리시와 시작하다</h1>
          <p>매일 아침, 카톡으로 도착하는 영어 표현 · 해설 · 복습 퀴즈</p>
          <a href="#subscribe">첫 메시지 받아보기</a>
        </div>
      </section>

      <section class="store-strip">
        <div><strong>${stats.activeCustomers}</strong><span>수신 대기</span></div>
        <div><strong>${stats.messages}</strong><span>예약 메시지</span></div>
        <div><strong>${stats.clicks}</strong><span>복습 클릭</span></div>
      </section>

      ${productSections.map(renderProductSection).join("")}
    </main>
  `);
}

function renderProductSection(section) {
  return `
    <section class="product-section" id="${section.id}">
      <h2>${escapeHtml(section.title)}</h2>
      <div class="product-grid">
        ${section.products.map(renderProductCard).join("")}
      </div>
    </section>
  `;
}

function renderProductCard(product) {
  return `
    <article class="product-card">
      <a class="product-visual ${product.theme}" href="#subscribe" aria-label="${escapeHtml(product.title)}">
        <span class="product-mini">매일 아침, 카톡으로 받는</span>
        <strong>${escapeHtml(product.title)}</strong>
        <span class="product-tag">${escapeHtml(product.tag)}</span>
        <span class="talk-bubbles"><b>180일</b><b>365일</b></span>
      </a>
      <a class="product-info" href="#subscribe">
        <h3>${escapeHtml(product.title)}</h3>
        <p class="original-price">${escapeHtml(product.original)}</p>
        <p class="sale-price"><span>${escapeHtml(product.discount)}</span> ${escapeHtml(product.price)}</p>
        <p class="time-left">◷ ${escapeHtml(product.countdown)}</p>
        <p class="pay-mark">N pay</p>
      </a>
    </article>
  `;
}

function legacyHome() {
  const stats = statSummary();
  const message = findMessageByDate(todayISO());
  return `
      <section class="container hero-grid">
        <div>
          <div class="eyebrow"><span class="pulse-dot"></span>매일 아침 도착하는 1분 영어 루틴</div>
          <h1>카톡으로 받으면 영어가 하루에 한 문장은 남습니다.</h1>
          <p class="lead">
            앱을 또 열게 만들지 않고, 고객이 이미 매일 확인하는 카카오톡 채널로 짧은 영어 표현과 복습 링크를 보냅니다.
          </p>
          <div class="button-row">
            <a class="btn primary" href="#subscribe">무료 수신 신청</a>
            <a class="btn secondary" href="#today?date=${encodeURIComponent(message.sendDate)}">샘플 표현 보기</a>
            <a class="btn ghost" href="#admin">운영 화면 확인</a>
          </div>
          <div class="metric-strip">
            <div class="metric"><strong>${stats.activeCustomers}</strong><span>활성 수신자</span></div>
            <div class="metric"><strong>${stats.messages}</strong><span>예약 콘텐츠</span></div>
            <div class="metric"><strong>${stats.clicks}</strong><span>링크 클릭 기록</span></div>
          </div>
        </div>
        <div class="phone-wrap">
          ${phonePreview(message)}
        </div>
      </section>
  `;
}

function phonePreview(message) {
  return `
    <div class="phone" aria-label="카카오톡 메시지 미리보기">
      <div class="phone-screen">
        <div class="chat-head">
          <div class="avatar">E</div>
          <div>
            <div class="chat-title">1분 영어 루틴</div>
            <div class="chat-subtitle">오늘 오전 8:30</div>
          </div>
        </div>
        <div class="bubble">
          <div class="bubble-title">${escapeHtml(message.title)}</div>
          <div class="phrase">${escapeHtml(message.englishPhrase)}</div>
          <div class="meaning">${escapeHtml(message.koreanMeaning)}</div>
          <p class="mini-note">${escapeHtml(message.explanation)}</p>
          <a class="btn primary" href="#today?date=${encodeURIComponent(message.sendDate)}">${escapeHtml(message.ctaLabel || "예문과 퀴즈 보기")}</a>
        </div>
        <div class="bubble">
          <div class="bubble-title">내일 예약</div>
          <p class="muted">관리자 화면에서 다음 메시지를 작성하고 채널 발송 문구를 복사할 수 있습니다.</p>
        </div>
      </div>
    </div>
  `;
}

function renderSubscribe() {
  return shell(`
    <main class="page">
      <section class="container">
        <div class="page-title">
          <div class="eyebrow"><span class="pulse-dot"></span>수신 신청</div>
          <h1>내일 아침부터 영어 한 문장을 받아보세요.</h1>
          <p class="lead">카카오 채널 친구 추가 후, 수신 신청 정보를 남기면 매일 짧은 영어 표현과 복습 링크를 받을 수 있습니다.</p>
        </div>
        <div class="admin-grid">
          <form class="panel form" id="subscribe-form">
            <div class="form-grid two">
              <div class="field">
                <label for="name">이름</label>
                <input id="name" name="name" required placeholder="권오인" />
              </div>
              <div class="field">
                <label for="phone">휴대폰 번호</label>
                <input id="phone" name="phone" required placeholder="010-1234-5678" />
              </div>
            </div>
            <div class="form-grid two">
              <div class="field">
                <label for="email">이메일</label>
                <input id="email" name="email" type="email" placeholder="you@example.com" />
              </div>
              <div class="field">
                <label for="preferredTime">받고 싶은 시간</label>
                <input id="preferredTime" name="preferredTime" type="time" value="08:30" />
              </div>
            </div>
            <div class="form-grid two">
              <div class="field">
                <label for="level">영어 레벨</label>
                <select id="level" name="level">
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="work">업무 영어 필요</option>
                </select>
              </div>
              <div class="field">
                <label for="interest">관심 분야</label>
                <select id="interest" name="interest">
                  <option value="business">비즈니스</option>
                  <option value="travel">여행</option>
                  <option value="daily">일상 회화</option>
                  <option value="customer">고객 응대</option>
                </select>
              </div>
            </div>
            <label class="checkbox-row">
              <input type="checkbox" name="kakaoChannelAdded" required />
              <span>
                카카오톡 채널을 추가했거나, 추가 후 메시지를 수신할 예정입니다.
              </span>
            </label>
            <label class="checkbox-row">
              <input type="checkbox" name="consentMarketing" required />
              <span>
                매일 영어 메시지와 서비스 안내를 카카오톡으로 받는 데 동의합니다. 실제 서비스에서는 수신 거부 방법을 함께 제공합니다.
              </span>
            </label>
            <button class="btn primary" type="submit">수신 신청 완료</button>
          </form>

          <aside class="panel">
            <h3>신청 후 흐름</h3>
            <p class="muted">초기 운영은 수동 검증에 최적화합니다.</p>
            <ol class="example-list">
              <li>1. 고객이 채널 추가와 수신 신청을 완료합니다.</li>
              <li>2. 관리자가 오늘의 영어 메시지를 준비합니다.</li>
              <li>3. 카카오 채널 관리자센터에서 예약 발송합니다.</li>
              <li>4. 고객은 링크를 눌러 예문과 퀴즈를 확인합니다.</li>
            </ol>
          </aside>
        </div>
      </section>
    </main>
  `);
}

function renderThanks() {
  const message = findMessageByDate(todayISO());
  return shell(`
    <main class="page">
      <section class="container hero-grid">
        <div>
          <div class="eyebrow"><span class="pulse-dot"></span>신청 완료</div>
          <h1>이제 매일 한 문장씩 쌓아가면 됩니다.</h1>
          <p class="lead">실제 서비스에서는 이 화면에 카카오톡 채널 추가 버튼과 수신 거부 안내를 연결합니다.</p>
          <div class="button-row">
            <a class="btn primary" href="#today?date=${encodeURIComponent(message.sendDate)}">첫 표현 보기</a>
            <a class="btn secondary" href="#archive">지난 표현 둘러보기</a>
          </div>
        </div>
        <div class="phone-wrap">${phonePreview(message)}</div>
      </section>
    </main>
  `);
}

function renderToday() {
  const { params } = routeInfo();
  const date = params.get("date") || todayISO();
  const message = findMessageByDate(date);

  if (params.get("from") === "kakao") {
    recordClick(message.id, "kakao-message");
    const cleanHash = `#today?date=${encodeURIComponent(message.sendDate)}`;
    history.replaceState(null, "", cleanHash);
  }

  const wrongOptions = [
    "I made it up.",
    "I'm on my way.",
    "It slipped my mind.",
  ];
  const options = shuffle([message.quizAnswer, ...wrongOptions]).slice(0, 4);

  return shell(`
    <main class="page">
      <section class="container expression-layout">
        <article class="expression-main">
          <span class="status-pill">${formatDate(message.sendDate)}</span>
          <h1 class="big-phrase">${escapeHtml(message.englishPhrase)}</h1>
          <p class="pronunciation">${escapeHtml(message.pronunciation)}</p>
          <h2>${escapeHtml(message.koreanMeaning)}</h2>
          <p class="lead">${escapeHtml(message.explanation)}</p>
          <ul class="example-list">
            <li>${escapeHtml(message.exampleSentence1)}</li>
            <li>${escapeHtml(message.exampleSentence2)}</li>
          </ul>
          <div class="button-row section">
            <a class="btn primary" href="#subscribe">매일 받아보기</a>
            <a class="btn secondary" href="#archive">지난 표현 보기</a>
          </div>
        </article>
        <aside class="quiz-card">
          <h3>짧은 복습 퀴즈</h3>
          <p class="muted">${escapeHtml(message.quizQuestion)}</p>
          <div class="quiz-options">
            ${options
              .map(
                (option) => `
                  <button class="quiz-option" data-action="quiz" data-answer="${escapeHtml(message.quizAnswer)}">
                    ${escapeHtml(option)}
                  </button>
                `,
              )
              .join("")}
          </div>
          <p class="muted" id="quiz-result"></p>
        </aside>
      </section>
    </main>
  `);
}

function renderArchive() {
  const messages = getMessages();
  return shell(`
    <main class="page">
      <section class="container">
        <div class="section-head">
          <div>
            <div class="eyebrow"><span class="pulse-dot"></span>표현 아카이브</div>
            <h1>지난 영어 표현을 다시 봅니다.</h1>
            <p class="lead">MVP에서는 공개 아카이브로 두고, 유료화 시 지난 표현 전체 보기와 주간 복습을 잠금 해제할 수 있습니다.</p>
          </div>
        </div>
        <div class="archive-grid">
          ${messages
            .map(
              (message) => `
                <article class="message-card">
                  <span class="date">${formatDate(message.sendDate)}</span>
                  <span class="status-pill ${message.status}">${statusLabel(message.status)}</span>
                  <h3>${escapeHtml(message.englishPhrase)}</h3>
                  <p class="muted">${escapeHtml(message.koreanMeaning)}</p>
                  <a class="btn secondary small" href="#today?date=${encodeURIComponent(message.sendDate)}">표현 보기</a>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </main>
  `);
}

function renderAdmin() {
  const tab = getItem(STORAGE_KEYS.adminTab) || "dashboard";
  const content = {
    dashboard: adminDashboard(),
    messages: adminMessages(),
    customers: adminCustomers(),
    logs: adminLogs(),
  }[tab];

  return shell(`
    <main class="page">
      <section class="container">
        <div class="toolbar">
          <div>
            <div class="eyebrow"><span class="pulse-dot"></span>운영 관리자</div>
            <h1>콘텐츠를 만들고, 카카오 채널 발송 문구를 준비합니다.</h1>
          </div>
          <div class="admin-tabs">
            ${adminTabButton("dashboard", "대시보드", tab)}
            ${adminTabButton("messages", "콘텐츠", tab)}
            ${adminTabButton("customers", "고객", tab)}
            ${adminTabButton("logs", "로그", tab)}
          </div>
        </div>
        ${content}
      </section>
    </main>
  `);
}

function adminTabButton(name, label, current) {
  return `<button class="admin-tab ${current === name ? "active" : ""}" data-action="admin-tab" data-tab="${name}">${label}</button>`;
}

function adminDashboard() {
  const stats = statSummary();
  const message = findMessageByDate(todayISO());
  return `
    <div class="insight-row">
      <div class="insight"><strong>${stats.activeCustomers}</strong><span>활성 수신자</span></div>
      <div class="insight"><strong>${stats.messages}</strong><span>콘텐츠 수</span></div>
      <div class="insight"><strong>${stats.deliveries}</strong><span>발송 기록</span></div>
      <div class="insight"><strong>${stats.clicks}</strong><span>클릭 기록</span></div>
    </div>
    <div class="admin-grid">
      <article class="panel">
        <h3>오늘 발송할 메시지</h3>
        <p class="muted">${formatDate(message.sendDate)}</p>
        <h2>${escapeHtml(message.englishPhrase)}</h2>
        <p>${escapeHtml(message.koreanMeaning)}</p>
        <div class="button-row">
          <button class="btn primary" data-action="copy-message" data-id="${message.id}">발송 문구 복사</button>
          <button class="btn secondary" data-action="mark-sent" data-id="${message.id}">발송 완료 기록</button>
        </div>
      </article>
      <article class="panel">
        <h3>카카오 채널 발송 문구</h3>
        <textarea class="copy-box" readonly>${escapeHtml(buildKakaoCopy(message))}</textarea>
      </article>
    </div>
  `;
}

function adminMessages() {
  const messages = getMessages();
  const editId = routeInfo().params.get("edit");
  const editing =
    messages.find((message) => message.id === editId) || emptyMessage();
  return `
    <div class="admin-grid">
      <form class="panel form" id="message-form">
        <input type="hidden" name="id" value="${escapeHtml(editing.id || "")}" />
        <div class="form-grid two">
          <div class="field">
            <label for="sendDate">발송일</label>
            <input id="sendDate" name="sendDate" type="date" required value="${escapeHtml(editing.sendDate)}" />
          </div>
          <div class="field">
            <label for="status">상태</label>
            <select id="status" name="status">
              ${option("draft", "초안", editing.status)}
              ${option("ready", "발송 준비", editing.status)}
              ${option("sent", "발송 완료", editing.status)}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="title">메시지 제목</label>
          <input id="title" name="title" required value="${escapeHtml(editing.title)}" />
        </div>
        <div class="form-grid two">
          <div class="field">
            <label for="englishPhrase">영어 표현</label>
            <input id="englishPhrase" name="englishPhrase" required value="${escapeHtml(editing.englishPhrase)}" />
          </div>
          <div class="field">
            <label for="koreanMeaning">한국어 뜻</label>
            <input id="koreanMeaning" name="koreanMeaning" required value="${escapeHtml(editing.koreanMeaning)}" />
          </div>
        </div>
        <div class="field">
          <label for="pronunciation">발음 힌트</label>
          <input id="pronunciation" name="pronunciation" value="${escapeHtml(editing.pronunciation)}" />
        </div>
        <div class="field">
          <label for="explanation">짧은 해설</label>
          <textarea id="explanation" name="explanation" required>${escapeHtml(editing.explanation)}</textarea>
        </div>
        <div class="field">
          <label for="exampleSentence1">예문 1</label>
          <input id="exampleSentence1" name="exampleSentence1" required value="${escapeHtml(editing.exampleSentence1)}" />
        </div>
        <div class="field">
          <label for="exampleSentence2">예문 2</label>
          <input id="exampleSentence2" name="exampleSentence2" required value="${escapeHtml(editing.exampleSentence2)}" />
        </div>
        <div class="form-grid two">
          <div class="field">
            <label for="quizQuestion">퀴즈 질문</label>
            <input id="quizQuestion" name="quizQuestion" required value="${escapeHtml(editing.quizQuestion)}" />
          </div>
          <div class="field">
            <label for="quizAnswer">퀴즈 정답</label>
            <input id="quizAnswer" name="quizAnswer" required value="${escapeHtml(editing.quizAnswer)}" />
          </div>
        </div>
        <div class="field">
          <label for="ctaLabel">CTA 문구</label>
          <input id="ctaLabel" name="ctaLabel" value="${escapeHtml(editing.ctaLabel)}" />
        </div>
        <button class="btn primary" type="submit">${editing.id ? "콘텐츠 수정" : "콘텐츠 추가"}</button>
      </form>
      <div>
        <div class="toolbar">
          <h3>발송 캘린더</h3>
          <button class="btn secondary small" data-action="new-message">새 콘텐츠</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>발송일</th>
                <th>표현</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              ${messages
                .map(
                  (message) => `
                    <tr>
                      <td>${formatDate(message.sendDate)}</td>
                      <td>
                        <strong>${escapeHtml(message.englishPhrase)}</strong><br />
                        <span class="muted">${escapeHtml(message.koreanMeaning)}</span>
                      </td>
                      <td><span class="status-pill ${message.status}">${statusLabel(message.status)}</span></td>
                      <td>
                        <div class="inline-actions">
                          <button class="btn secondary small" data-action="edit-message" data-id="${message.id}">수정</button>
                          <button class="btn secondary small" data-action="copy-message" data-id="${message.id}">복사</button>
                          <button class="btn danger small" data-action="delete-message" data-id="${message.id}">삭제</button>
                        </div>
                      </td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function adminCustomers() {
  const customers = getCustomers();
  if (customers.length === 0) {
    return `<div class="empty-state">아직 수신 신청 고객이 없습니다.</div>`;
  }
  return `
    <div class="toolbar">
      <h3>수신자 목록</h3>
      <button class="btn secondary small" data-action="export-customers">CSV 복사</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>연락처</th>
            <th>관심사</th>
            <th>상태</th>
            <th>신청일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          ${customers
            .map(
              (customer) => `
                <tr>
                  <td><strong>${escapeHtml(customer.name)}</strong><br /><span class="muted">${escapeHtml(customer.email || "-")}</span></td>
                  <td>${escapeHtml(customer.phone)}</td>
                  <td>${levelLabel(customer.level)} · ${interestLabel(customer.interest)}<br /><span class="muted">${escapeHtml(customer.preferredTime || "08:30")} 수신 희망</span></td>
                  <td><span class="status-pill ${customer.status === "inactive" ? "inactive" : ""}">${customer.status === "active" ? "수신중" : "중지"}</span></td>
                  <td>${formatDateTime(customer.createdAt)}</td>
                  <td>
                    <button class="btn secondary small" data-action="toggle-customer" data-id="${customer.id}">
                      ${customer.status === "active" ? "중지" : "재개"}
                    </button>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function adminLogs() {
  const deliveries = getDeliveries().slice().reverse();
  const clicks = getClicks().slice().reverse();
  return `
    <div class="admin-grid">
      <section>
        <div class="toolbar"><h3>발송 기록</h3></div>
        ${
          deliveries.length
            ? `<div class="table-wrap">
                <table>
                  <thead><tr><th>시간</th><th>메시지</th><th>대상</th><th>상태</th></tr></thead>
                  <tbody>
                    ${deliveries
                      .map((delivery) => {
                        const message = getMessages().find(
                          (item) => item.id === delivery.dailyMessageId,
                        );
                        return `
                          <tr>
                            <td>${formatDateTime(delivery.sentAt)}</td>
                            <td>${escapeHtml(message?.englishPhrase || "-")}</td>
                            <td>${delivery.customerCount}명</td>
                            <td><span class="status-pill">${escapeHtml(delivery.status)}</span></td>
                          </tr>
                        `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>`
            : `<div class="empty-state">아직 발송 완료 기록이 없습니다.</div>`
        }
      </section>
      <section>
        <div class="toolbar"><h3>클릭 기록</h3></div>
        ${
          clicks.length
            ? `<div class="table-wrap">
                <table>
                  <thead><tr><th>시간</th><th>메시지</th><th>출처</th></tr></thead>
                  <tbody>
                    ${clicks
                      .map((click) => {
                        const message = getMessages().find(
                          (item) => item.id === click.dailyMessageId,
                        );
                        return `
                          <tr>
                            <td>${formatDateTime(click.clickedAt)}</td>
                            <td>${escapeHtml(message?.englishPhrase || "-")}</td>
                            <td>${escapeHtml(click.source)}</td>
                          </tr>
                        `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>`
            : `<div class="empty-state">카카오 메시지 링크로 들어오면 클릭이 기록됩니다.</div>`
        }
      </section>
    </div>
  `;
}

function emptyMessage() {
  return {
    id: "",
    sendDate: todayISO(),
    title: "오늘의 1분 영어",
    englishPhrase: "",
    koreanMeaning: "",
    pronunciation: "",
    explanation: "",
    exampleSentence1: "",
    exampleSentence2: "",
    quizQuestion: "",
    quizAnswer: "",
    ctaLabel: "예문과 퀴즈 보기",
    status: "draft",
  };
}

function option(value, label, current) {
  return `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`;
}

function statusLabel(status) {
  return (
    {
      draft: "초안",
      ready: "발송 준비",
      sent: "발송 완료",
    }[status] || status
  );
}

function levelLabel(level) {
  return (
    {
      beginner: "초급",
      intermediate: "중급",
      work: "업무 영어",
    }[level] || level
  );
}

function interestLabel(interest) {
  return (
    {
      business: "비즈니스",
      travel: "여행",
      daily: "일상 회화",
      customer: "고객 응대",
    }[interest] || interest
  );
}

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function recordClick(dailyMessageId, source) {
  const clicks = getClicks();
  const recent = clicks.find(
    (click) =>
      click.dailyMessageId === dailyMessageId &&
      click.source === source &&
      Date.now() - new Date(click.clickedAt).getTime() < 1500,
  );
  if (recent) return;
  clicks.push({
    id: uid("clk"),
    customerId: null,
    dailyMessageId,
    source,
    clickedAt: new Date().toISOString(),
  });
  writeStore(STORAGE_KEYS.clicks, clicks);
}

function render() {
  try {
    seedData();
    const { name } = routeInfo();
    const views = {
      home: renderHome,
      subscribe: renderSubscribe,
      thanks: renderThanks,
      today: renderToday,
      archive: renderArchive,
      admin: renderAdmin,
      privacy: renderPrivacy,
      terms: renderTerms,
      refund: renderRefund,
      unsubscribe: renderUnsubscribe,
    };
    app.innerHTML = (views[name] || renderHome)();
    bindForms();
  } catch (error) {
    app.innerHTML = `
      <main class="page">
        <section class="container">
          <div class="panel">
            <h1>화면을 불러오지 못했습니다.</h1>
            <p class="lead">브라우저 실행 환경에서 일시적인 제한이 걸렸을 수 있습니다. 로컬 서버 주소로 다시 열어주세요.</p>
            <pre>${escapeHtml(error.message)}</pre>
          </div>
        </section>
      </main>
    `;
  }
}

function bindForms() {
  const subscribeForm = document.querySelector("#subscribe-form");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", handleSubscribe);
  }

  const messageForm = document.querySelector("#message-form");
  if (messageForm) {
    messageForm.addEventListener("submit", handleMessageSave);
  }

  const unsubscribeForm = document.querySelector("#unsubscribe-form");
  if (unsubscribeForm) {
    unsubscribeForm.addEventListener("submit", handleUnsubscribe);
  }
}

function handleSubscribe(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const customers = getCustomers();
  customers.push({
    id: uid("cus"),
    name: form.get("name").trim(),
    phone: form.get("phone").trim(),
    email: form.get("email").trim(),
    kakaoChannelAdded: form.get("kakaoChannelAdded") === "on",
    consentMarketing: form.get("consentMarketing") === "on",
    consentReceivedAt: new Date().toISOString(),
    level: form.get("level"),
    interest: form.get("interest"),
    preferredTime: form.get("preferredTime"),
    status: "active",
    createdAt: new Date().toISOString(),
  });
  writeStore(STORAGE_KEYS.customers, customers);
  showToast("수신 신청이 저장되었습니다.");
  navigate("thanks");
}

function handleMessageSave(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const messages = getMessages();
  const id = form.get("id") || uid("msg");
  const existing = messages.find((message) => message.id === id);
  const next = {
    id,
    sendDate: form.get("sendDate"),
    title: form.get("title").trim(),
    englishPhrase: form.get("englishPhrase").trim(),
    koreanMeaning: form.get("koreanMeaning").trim(),
    pronunciation: form.get("pronunciation").trim(),
    explanation: form.get("explanation").trim(),
    exampleSentence1: form.get("exampleSentence1").trim(),
    exampleSentence2: form.get("exampleSentence2").trim(),
    quizQuestion: form.get("quizQuestion").trim(),
    quizAnswer: form.get("quizAnswer").trim(),
    ctaLabel: form.get("ctaLabel").trim() || "예문과 퀴즈 보기",
    ctaUrl: "",
    status: form.get("status"),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = existing
    ? messages.map((message) => (message.id === id ? next : message))
    : [...messages, next];
  writeStore(STORAGE_KEYS.messages, updated);
  showToast(existing ? "콘텐츠가 수정되었습니다." : "콘텐츠가 추가되었습니다.");
  navigate("admin");
  setItem(STORAGE_KEYS.adminTab, "messages");
  render();
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === "admin-tab") {
    setItem(STORAGE_KEYS.adminTab, target.dataset.tab);
    render();
  }

  if (action === "new-message") {
    navigate("admin");
    setItem(STORAGE_KEYS.adminTab, "messages");
    render();
  }

  if (action === "edit-message") {
    setItem(STORAGE_KEYS.adminTab, "messages");
    navigate(`admin?edit=${encodeURIComponent(id)}`);
  }

  if (action === "delete-message") {
    const messages = getMessages().filter((message) => message.id !== id);
    writeStore(STORAGE_KEYS.messages, messages);
    showToast("콘텐츠가 삭제되었습니다.");
    render();
  }

  if (action === "copy-message") {
    const message = getMessages().find((item) => item.id === id);
    await copyText(buildKakaoCopy(message));
    showToast("카카오 채널 발송 문구를 복사했습니다.");
  }

  if (action === "mark-sent") {
    markSent(id);
    showToast("발송 완료 기록을 남겼습니다.");
    render();
  }

  if (action === "toggle-customer") {
    const customers = getCustomers().map((customer) =>
      customer.id === id
        ? {
            ...customer,
            status: customer.status === "active" ? "inactive" : "active",
          }
        : customer,
    );
    writeStore(STORAGE_KEYS.customers, customers);
    render();
  }

  if (action === "export-customers") {
    await copyText(customerCsv());
    showToast("고객 CSV를 클립보드에 복사했습니다.");
  }

  if (action === "quiz") {
    const correct = target.textContent.trim() === target.dataset.answer;
    document
      .querySelectorAll(".quiz-option")
      .forEach((button) => button.classList.remove("correct", "wrong"));
    target.classList.add(correct ? "correct" : "wrong");
    document.querySelector("#quiz-result").textContent = correct
      ? "정답입니다. 오늘 표현은 이제 입에 붙이기만 하면 됩니다."
      : `아쉽지만 정답은 "${target.dataset.answer}"입니다.`;
  }
});

function markSent(messageId) {
  const activeCustomers = getCustomers().filter(
    (customer) => customer.status === "active",
  );
  const deliveries = getDeliveries();
  deliveries.push({
    id: uid("del"),
    dailyMessageId: messageId,
    customerCount: activeCustomers.length,
    channel: "kakao-channel-manual",
    scheduledAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    status: "manual-sent",
    providerMessageId: null,
    failReason: null,
  });
  writeStore(STORAGE_KEYS.deliveries, deliveries);

  const messages = getMessages().map((message) =>
    message.id === messageId
      ? { ...message, status: "sent", updatedAt: new Date().toISOString() }
      : message,
  );
  writeStore(STORAGE_KEYS.messages, messages);
}

function customerCsv() {
  const headers = [
    "name",
    "phone",
    "email",
    "level",
    "interest",
    "preferredTime",
    "status",
    "consentReceivedAt",
  ];
  const rows = getCustomers().map((customer) =>
    headers
      .map((key) => `"${String(customer[key] ?? "").replaceAll('"', '""')}"`)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

/* === Track A: legal/policy pages + unsubscribe flow === */

function policyDraftNote() {
  return `
    <div class="policy-draft-note" role="note">
      <strong>MVP 초안 안내</strong>
      <p>본 문서는 서비스 준비 단계에서 작성된 초안이며, 법무 검토 완료 후 정식 문서로 대체됩니다. 일부 항목(회사명·연락처 등)은 운영 준비 중인 임시 값입니다.</p>
    </div>
  `;
}

function renderPrivacy() {
  return shell(`
    <main class="page">
      <section class="container">
        <div class="page-title">
          <div class="eyebrow"><span class="pulse-dot"></span>개인정보 처리방침</div>
          <h1>개인정보 처리방침</h1>
          <p class="lead">Daily Talk English(이하 "서비스")는 정보주체의 개인정보를 소중히 다루며, 관련 법령을 준수합니다.</p>
        </div>
        ${policyDraftNote()}
        <article class="panel policy-doc">
          <h2>1. 수집하는 개인정보 항목</h2>
          <ul class="policy-list">
            <li><strong>필수 항목:</strong> 이름, 휴대폰 번호, 관심사, 영어 레벨, 수신 희망 시간</li>
            <li><strong>선택 항목:</strong> 이메일 주소</li>
            <li><strong>서비스 이용 과정에서 자동 생성·수집되는 항목:</strong> 알림톡 발송 로그, 링크 클릭 로그, 수신 상태(active/unsubscribed), 동의 일시</li>
          </ul>

          <h2>2. 개인정보의 수집·이용 목적</h2>
          <ul class="policy-list">
            <li>매일 영어 학습 콘텐츠(카카오 알림톡)의 제작·발송 및 본인 식별</li>
            <li>관심사·레벨에 따른 콘텐츠 맞춤 제공</li>
            <li>발송·클릭 로그를 통한 서비스 품질 개선 및 통계 분석</li>
            <li>결제·구독 관리, 고객 문의 응대, 수신거부 처리</li>
          </ul>

          <h2>3. 개인정보의 보유·이용 기간</h2>
          <ul class="policy-list">
            <li>원칙적으로 수신 동의 철회(수신거부) 또는 회원 탈퇴 시 지체 없이 파기합니다.</li>
            <li>다만, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다. (예: 전자상거래법에 따른 계약·결제 기록 5년, 소비자 불만·분쟁 처리 기록 3년)</li>
            <li>발송·클릭 로그 등 통계 목적 자료는 비식별 처리 후 보관할 수 있습니다.</li>
          </ul>

          <h2>4. 개인정보의 파기 절차 및 방법</h2>
          <ul class="policy-list">
            <li><strong>파기 절차:</strong> 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 내부 방침에 따라 파기 대상으로 분류 후 파기합니다.</li>
            <li><strong>파기 방법:</strong> 전자적 파일은 복구 불가능한 방식으로 영구 삭제하며, 출력물은 분쇄하거나 소각합니다.</li>
          </ul>

          <h2>5. 정보주체의 권리·의무 및 행사 방법</h2>
          <ul class="policy-list">
            <li>정보주체는 언제든지 자신의 개인정보 열람·정정·삭제·처리정지를 요구할 수 있습니다.</li>
            <li>수신 동의는 언제든지 철회할 수 있으며, <a href="#unsubscribe">알림톡 수신거부 페이지</a>에서 신청할 수 있습니다.</li>
            <li>권리 행사는 아래 개인정보 보호책임자에게 서면·이메일 등으로 요청할 수 있으며, 서비스는 지체 없이 조치합니다.</li>
          </ul>

          <h2>6. 개인정보 보호책임자 및 문의처</h2>
          <ul class="policy-list">
            <li><strong>회사명:</strong> 운영 준비 중</li>
            <li><strong>개인정보 보호책임자:</strong> 운영 준비 중</li>
            <li><strong>연락처(이메일):</strong> 운영 준비 중</li>
            <li><strong>문의 전화:</strong> 운영 준비 중</li>
          </ul>
          <p class="muted">시행일: 운영 준비 중 (정식 시행일은 법무 검토 후 고지됩니다.)</p>
        </article>
      </section>
    </main>
  `);
}

function renderTerms() {
  return shell(`
    <main class="page">
      <section class="container">
        <div class="page-title">
          <div class="eyebrow"><span class="pulse-dot"></span>이용약관</div>
          <h1>서비스 이용약관</h1>
          <p class="lead">본 약관은 Daily Talk English 서비스의 이용 조건과 절차, 이용자와 운영자의 권리·의무를 규정합니다.</p>
        </div>
        ${policyDraftNote()}
        <article class="panel policy-doc">
          <h2>제1조 (목적)</h2>
          <p>본 약관은 서비스가 제공하는 카카오 알림톡 기반 영어 학습 콘텐츠 및 관련 제반 서비스(이하 "서비스")의 이용과 관련하여 운영자와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>

          <h2>제2조 (정의)</h2>
          <ul class="policy-list">
            <li><strong>이용자:</strong> 본 약관에 동의하고 서비스를 이용하는 자</li>
            <li><strong>구독:</strong> 일정 기간 동안 매일 학습 콘텐츠를 받는 유료/무료 이용 형태</li>
            <li><strong>알림톡:</strong> 카카오톡 채널을 통해 발송되는 학습 메시지</li>
          </ul>

          <h2>제3조 (서비스의 내용)</h2>
          <ul class="policy-list">
            <li>매일 영어 표현·해설·예문·복습 퀴즈 등 학습 콘텐츠의 카카오 알림톡 발송</li>
            <li>지난 콘텐츠 아카이브 및 복습 링크 제공</li>
            <li>관심사·레벨 기반 맞춤 콘텐츠 제공</li>
          </ul>

          <h2>제4조 (결제 및 구독)</h2>
          <ul class="policy-list">
            <li>유료 구독의 요금·결제 수단·구독 기간은 결제 화면에 표시된 내용에 따릅니다.</li>
            <li>구독은 별도 해지 신청이 없는 한 약정된 주기에 따라 갱신될 수 있으며, 갱신 전 안내합니다.</li>
          </ul>

          <h2>제5조 (해지 및 환불)</h2>
          <p>이용자는 언제든지 구독을 해지할 수 있으며, 환불은 <a href="#refund">환불/해지 정책</a>에 따릅니다. 알림톡 수신만 중단하려는 경우 <a href="#unsubscribe">수신거부 페이지</a>를 이용할 수 있습니다.</p>

          <h2>제6조 (이용자의 의무)</h2>
          <p>이용자는 타인의 정보를 도용하거나 서비스 운영을 방해하는 행위를 하여서는 안 됩니다. 제공받은 콘텐츠를 운영자의 동의 없이 무단으로 복제·배포할 수 없습니다.</p>

          <h2>제7조 (면책)</h2>
          <p>운영자는 천재지변, 카카오 등 제3자 플랫폼 장애, 이용자의 귀책 등 운영자의 합리적 통제를 벗어난 사유로 인한 서비스 중단·지연에 대해 책임을 지지 않습니다. 학습 콘텐츠는 참고용으로 제공되며 특정 결과를 보증하지 않습니다.</p>

          <h2>제8조 (분쟁 해결 및 준거법)</h2>
          <p>본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련한 분쟁은 관련 법령 및 운영자 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.</p>

          <p class="muted">시행일: 운영 준비 중 (정식 시행일은 법무 검토 후 고지됩니다.)</p>
        </article>
      </section>
    </main>
  `);
}

function renderRefund() {
  return shell(`
    <main class="page">
      <section class="container">
        <div class="page-title">
          <div class="eyebrow"><span class="pulse-dot"></span>환불/해지 정책</div>
          <h1>환불 및 해지 정책</h1>
          <p class="lead">구독 해지 시점, 환불 가능 기간과 절차를 안내합니다.</p>
        </div>
        ${policyDraftNote()}
        <article class="panel policy-doc">
          <h2>1. 구독 해지 시점</h2>
          <ul class="policy-list">
            <li>해지 신청은 언제든지 가능하며, 신청 즉시 다음 결제 주기의 자동 갱신이 중단됩니다.</li>
            <li>이미 결제된 현재 주기의 잔여 기간 동안은 콘텐츠 수신이 유지될 수 있습니다.</li>
          </ul>

          <h2>2. 환불 가능 기간</h2>
          <ul class="policy-list">
            <li>결제일로부터 7일 이내이며 콘텐츠를 1회도 수신하지 않은 경우 전액 환불됩니다.</li>
            <li>일부 콘텐츠를 수신한 경우, 이미 제공된 일수를 제외한 잔여 기간에 대해 일할 계산하여 환불합니다.</li>
          </ul>

          <h2>3. 환불 불가 사유</h2>
          <ul class="policy-list">
            <li>구독 기간 대부분의 콘텐츠를 이미 수신·이용한 경우</li>
            <li>프로모션·무료 체험 등 무상으로 제공된 이용분</li>
            <li>이용자의 약관 위반으로 이용이 제한된 경우</li>
          </ul>

          <h2>4. 알림톡 중단 시점</h2>
          <ul class="policy-list">
            <li>수신거부 신청 시 알림톡 발송은 신청 처리 시점부터 중단됩니다.</li>
            <li>이미 카카오로 전송 예약된 메시지는 기술적 사유로 1건 정도 발송될 수 있으나, 이후 발송은 중단됩니다.</li>
            <li>알림톡 수신만 중단하려면 <a href="#unsubscribe">수신거부 페이지</a>를 이용하세요. 환불을 포함한 구독 해지는 별도 문의가 필요합니다.</li>
          </ul>

          <h2>5. 환불 신청 방법</h2>
          <p>환불은 개인정보 보호책임자(문의처: 운영 준비 중)에게 이메일로 신청할 수 있으며, 결제 수단·결제일을 함께 알려주시면 신속히 처리됩니다.</p>
          <p class="muted">시행일: 운영 준비 중 (정식 시행일은 법무 검토 후 고지됩니다.)</p>
        </article>
      </section>
    </main>
  `);
}

function renderUnsubscribe() {
  const { params } = routeInfo();
  if (params.get("done") === "1") {
    return shell(`
      <main class="page">
        <section class="container">
          <div class="page-title">
            <div class="eyebrow"><span class="pulse-dot"></span>수신거부 완료</div>
            <h1>수신거부가 접수되었습니다.</h1>
            <p class="lead">요청해 주신 정보와 일치하는 수신 정보의 알림톡 수신을 중단했습니다.</p>
          </div>
          <article class="panel policy-doc">
            <h2>수신 중단 시점</h2>
            <p>알림톡 발송은 신청 처리 시점부터 중단됩니다. 다만 이미 카카오로 예약 전송된 메시지는 1건 정도 발송될 수 있으니 양해 부탁드립니다.</p>
            <h2>재신청 경로</h2>
            <p>다시 매일 영어 메시지를 받고 싶으시면 언제든지 <a href="#subscribe">수신 신청 페이지</a>에서 재신청하실 수 있습니다.</p>
            <div class="button-row">
              <a class="btn primary" href="#home">홈으로</a>
              <a class="btn secondary" href="#subscribe">다시 신청하기</a>
            </div>
          </article>
        </section>
      </main>
    `);
  }

  return shell(`
    <main class="page">
      <section class="container">
        <div class="page-title">
          <div class="eyebrow"><span class="pulse-dot"></span>알림톡 수신거부</div>
          <h1>알림톡 수신을 중단할게요.</h1>
          <p class="lead">신청 시 입력한 휴대폰 번호 또는 이메일을 입력하시면 해당 정보의 알림톡 수신을 중단합니다.</p>
        </div>
        <div class="admin-grid">
          <form class="panel form" id="unsubscribe-form">
            <div class="field">
              <label for="unsub-phone">휴대폰 번호</label>
              <input id="unsub-phone" name="phone" placeholder="010-1234-5678" />
            </div>
            <div class="field">
              <label for="unsub-email">또는 이메일</label>
              <input id="unsub-email" name="email" type="email" placeholder="you@example.com" />
            </div>
            <p class="muted">휴대폰 번호와 이메일 중 하나만 입력해도 됩니다.</p>
            <button class="btn primary" type="submit">수신거부 신청</button>
          </form>
          <aside class="panel">
            <h3>안내</h3>
            <ul class="example-list">
              <li>신청 즉시 일치하는 수신 정보의 알림톡 발송이 중단됩니다.</li>
              <li>이미 예약된 메시지는 1건 정도 발송될 수 있습니다.</li>
              <li>다시 받고 싶을 때는 수신 신청 페이지에서 재신청할 수 있습니다.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  `);
}

function handleUnsubscribe(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const phone = (form.get("phone") || "").trim();
  const email = (form.get("email") || "").trim();

  if (!phone && !email) {
    showToast("휴대폰 번호 또는 이메일을 입력해 주세요.");
    return;
  }

  const customers = getCustomers();
  const now = new Date().toISOString();
  let matched = 0;
  const updated = customers.map((customer) => {
    const phoneMatch = phone && customer.phone && customer.phone.trim() === phone;
    const emailMatch =
      email &&
      customer.email &&
      customer.email.trim().toLowerCase() === email.toLowerCase();
    if (phoneMatch || emailMatch) {
      matched += 1;
      return { ...customer, status: "unsubscribed", unsubscribedAt: now };
    }
    return customer;
  });

  if (matched === 0) {
    showToast("일치하는 수신 정보를 찾지 못했습니다. 입력하신 정보를 다시 확인해 주세요.");
    return;
  }

  writeStore(STORAGE_KEYS.customers, updated);
  showToast(`${matched}건의 수신 정보를 수신거부 처리했습니다.`);
  navigate("unsubscribe?done=1");
}

window.addEventListener("hashchange", render);
render();
