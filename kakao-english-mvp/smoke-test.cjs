const { pathToFileURL } = require("node:url");
const { resolve } = require("node:path");
const { existsSync } = require("node:fs");
const { chromium } = require("playwright");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const fileUrl = pathToFileURL(resolve(__dirname, "index.html")).toString();
  const chromePath =
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(chromePath) ? chromePath : undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto(fileUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.waitForSelector("text=매일 1분");
  assert(
    await page.locator(".store-hero").isVisible(),
    "Storefront hero is not visible",
  );
  assert(
    await page.locator(".product-card").first().isVisible(),
    "Product cards are not visible",
  );

  await page.locator(".product-card .product-info").first().click();
  await page.waitForSelector(".product-detail-hero");
  assert(
    await page.locator("text=네이버페이로 결제").isVisible(),
    "Naver Pay CTA is not visible",
  );

  await page.click(".pay-cta.naver");
  await page.waitForSelector("#checkout-form");
  await page.fill("#name", "테스트 고객");
  await page.fill("#phone", "010-1111-2222");
  await page.fill("#email", "test@example.com");
  await page.selectOption("#level", "work");
  await page.selectOption("#interest", "customer");
  await page.check('input[name="kakaoChannelAdded"]');
  await page.check('input[name="consentMarketing"]');
  await page.click('#checkout-form button[type="submit"]');
  await page.waitForFunction(() => window.location.hash === "#thanks");

  const customerCount = await page.evaluate(
    () => JSON.parse(localStorage.getItem("daily-talk-customers")).length,
  );
  assert(customerCount === 2, `Expected 2 customers, got ${customerCount}`);
  const orderCount = await page.evaluate(
    () => JSON.parse(localStorage.getItem("daily-talk-orders")).length,
  );
  assert(orderCount === 1, `Expected 1 order, got ${orderCount}`);
  const subscriptionCount = await page.evaluate(
    () => JSON.parse(localStorage.getItem("daily-talk-subscriptions")).length,
  );
  assert(
    subscriptionCount === 1,
    `Expected 1 subscription, got ${subscriptionCount}`,
  );

  await page.goto(`${fileUrl}#today?date=${new Date().toISOString().slice(0, 10)}&from=kakao`);
  await page.waitForSelector(".big-phrase");
  const clickCount = await page.evaluate(
    () => JSON.parse(localStorage.getItem("daily-talk-clicks")).length,
  );
  assert(clickCount === 1, `Expected 1 click record, got ${clickCount}`);

  await page.goto(`${fileUrl}#admin`);
  await page.waitForSelector("text=오늘 발송할 메시지");
  await page.click('[data-action="mark-sent"]');
  const deliveryCount = await page.evaluate(
    () => JSON.parse(localStorage.getItem("daily-talk-deliveries")).length,
  );
  assert(deliveryCount === 1, `Expected 1 delivery record, got ${deliveryCount}`);

  await page.click('[data-action="admin-tab"][data-tab="messages"]');
  await page.waitForSelector("#message-form");
  await page.fill("#englishPhrase", "Could you clarify that?");
  await page.fill("#koreanMeaning", "그 부분을 명확히 설명해 주실 수 있나요?");
  await page.fill("#pronunciation", "쿠쥬 클래러파이 댓");
  await page.fill("#explanation", "회의에서 상대의 설명을 정중하게 다시 요청할 때 쓰는 표현입니다.");
  await page.fill("#exampleSentence1", "Could you clarify that point for me?");
  await page.fill("#exampleSentence2", "Could you clarify what you mean by that?");
  await page.fill("#quizQuestion", "정중하게 설명을 다시 요청하는 표현은?");
  await page.fill("#quizAnswer", "Could you clarify that?");
  await page.click('#message-form button[type="submit"]');

  const messageCount = await page.evaluate(
    () => JSON.parse(localStorage.getItem("daily-talk-messages")).length,
  );
  assert(messageCount === 3, `Expected 3 messages, got ${messageCount}`);

  assert(errors.length === 0, `Browser errors: ${errors.join("; ")}`);
  await browser.close();
  console.log("Smoke test passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
