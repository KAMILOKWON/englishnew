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

window.addEventListener("hashchange", render);
render();
