/*
 * End-to-end check of the services and booking flow, keyboard-first, with an
 * axe accessibility scan of each screen.
 *
 *  1. Landing: the service tabs are real tabs (arrow keys switch panels), and
 *     each job chip links into booking.
 *  2. /services and a category page render, with the right headings.
 *  3. Booking: Continue with nothing filled in shows an error summary that
 *     takes focus; then each step is completed and focus lands on the next
 *     step's heading; a reload mid-flow keeps the answers; confirming shows
 *     the preview confirmation.
 *  4. Phone width: no sideways scrolling on the pages.
 */
const { chromium } = require("playwright-core");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:3100";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const AXE = require.resolve("axe-core/axe.min.js");
const OUT = __dirname;

let failures = 0;
const check = (ok, label, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"} ${label}${extra ? "  " + extra : ""}`);
};

async function axe(page, label) {
  await page.addScriptTag({ path: AXE });
  const result = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      // Colour contrast over the hero video is measured separately, frame by frame.
      rules: { "color-contrast": { enabled: true } },
    });
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      count: v.nodes.length,
      sample: v.nodes[0]?.target?.join(" ") ?? "",
    }));
  });
  const serious = result.filter((v) => v.impact === "serious" || v.impact === "critical");
  check(serious.length === 0, `axe ${label}: ${serious.length} serious/critical`, serious.map((v) => `${v.id}(${v.count}) @ ${v.sample}`).join(" | "));
  const minor = result.filter((v) => !(v.impact === "serious" || v.impact === "critical"));
  if (minor.length) console.log(`        minor: ${minor.map((v) => `${v.id}(${v.count})`).join(", ")}`);
}

const focusedText = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName.toLowerCase()}: ${(el.textContent || "").trim().slice(0, 60)}` : "none";
  });

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("pt-hero-video", "paused");
    } catch {}
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    // The deliberate visit to an unknown category logs its own 404.
    if (m.text().includes("404") && page.url().includes("/services/not-a-thing")) return;
    consoleErrors.push(`${m.text()} [on ${page.url()}]`);
  });
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("/services/not-a-thing")) {
      consoleErrors.push(`HTTP ${r.status()} ${r.url()}`);
    }
  });

  // 1. Landing service browser
  console.log("\n== Landing service browser");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const tabs = page.getByRole("tab");
  check((await tabs.count()) === 10, `10 tabs (9 categories + Trending)`, `found ${await tabs.count()}`);
  const firstTab = tabs.first();
  check((await firstTab.getAttribute("aria-selected")) === "true", "first tab (Assembly) selected by default");
  await firstTab.focus();
  await page.keyboard.press("ArrowRight");
  const second = tabs.nth(1);
  check((await second.getAttribute("aria-selected")) === "true", "ArrowRight selects the next tab (Mounting)");
  const panel = page.getByRole("tabpanel");
  const panelChips = await panel.getByRole("link").allTextContents();
  check(panelChips.some((t) => t.includes("TV mounting")), "Mounting panel shows its jobs", panelChips.slice(0, 3).join(" / "));
  const chipHref = await panel.getByRole("link", { name: /TV mounting/ }).getAttribute("href");
  check(chipHref === "/book/mounting/tv-mounting", "job chip links into booking", chipHref);
  await page.keyboard.press("End");
  check((await tabs.last().getAttribute("aria-selected")) === "true", "End key jumps to Trending");
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(OUT, "e2e-landing-services.png") });
  await axe(page, "landing");

  // 2. Services index and a category page
  console.log("\n== /services and a category page");
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle" });
  check((await page.getByRole("heading", { level: 1 }).textContent()) === "All services", "/services h1");
  await axe(page, "/services");

  await page.goto(`${BASE}/services/assembly`, { waitUntil: "networkidle" });
  check((await page.getByRole("heading", { level: 1 }).textContent()) === "Assembly", "category h1");
  const jobLinks = await page.locator(".svc-card__link").count();
  check(jobLinks === 6, "assembly lists its 6 jobs", `found ${jobLinks}`);
  await page.screenshot({ path: path.join(OUT, "e2e-category.png"), fullPage: false });
  await axe(page, "category page");

  const notFound = await page.goto(`${BASE}/services/not-a-thing`);
  check(notFound.status() === 404, "unknown category is a 404", `status ${notFound.status()}`);

  // 3. Booking flow
  console.log("\n== Booking flow");
  await page.goto(`${BASE}/book/assembly/furniture-assembly`, { waitUntil: "networkidle" });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(100);
  const errorSummary = page.locator(".booking__errors");
  check(await errorSummary.isVisible(), "empty Continue shows the error summary");
  check(
    await page.evaluate(() => document.activeElement?.classList.contains("booking__errors")),
    "error summary takes focus"
  );
  const errorItems = await errorSummary.locator("li").allTextContents();
  check(errorItems.length === 3, "three problems listed (postcode, size, items)", errorItems.join(" / "));
  await axe(page, "booking step 1 with errors");

  await page.getByLabel("Postcode where the job is").fill("sw1a 1aa");
  await page.getByRole("radio", { name: /Medium/ }).check({ force: true });
  await page.getByRole("radio", { name: "2 to 3 items" }).check({ force: true });
  await page.getByLabel(/Anything the tasker should know/).fill("A wardrobe and a bedside table, second floor, no lift.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(150);
  check((await focusedText(page)).includes("Choose your tasker"), "step 2 heading has focus", await focusedText(page));

  // Reload mid-flow: answers must survive.
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  check(
    (await page.locator(".booking__title").textContent()) === "Choose your tasker",
    "reload keeps you on step 2"
  );
  const taskerRadios = page.getByRole("radio");
  check((await taskerRadios.count()) === 3, "three sample taskers offered", `found ${await taskerRadios.count()}`);
  check(await page.getByText("These are sample profiles").isVisible(), "sample-profile label visible");
  await page.screenshot({ path: path.join(OUT, "e2e-booking-taskers.png") });
  await axe(page, "booking step 2");
  await taskerRadios.nth(1).check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(150);
  check((await focusedText(page)).includes("Pick a date and time"), "step 3 heading has focus", await focusedText(page));

  await page.getByRole("radio", { name: /^Tomorrow/ }).check({ force: true });
  await page.getByRole("radio", { name: /Morning/ }).check({ force: true });
  await axe(page, "booking step 3");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(150);
  check((await focusedText(page)).includes("Review and confirm"), "step 4 heading has focus", await focusedText(page));
  check(await page.getByText(/Estimated cost/).isVisible(), "estimate shown on review");

  await page.getByRole("button", { name: "Confirm booking request" }).click();
  await page.waitForTimeout(100);
  const reviewErrors = await page.locator(".booking__errors li").allTextContents();
  check(reviewErrors.length === 2, "missing name and email caught", reviewErrors.join(" / "));
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Email address").fill("test@example.com");
  await page.screenshot({ path: path.join(OUT, "e2e-booking-review.png"), fullPage: true });
  await axe(page, "booking step 4");
  await page.getByRole("button", { name: "Confirm booking request" }).click();
  await page.waitForTimeout(200);
  check((await focusedText(page)).includes("Booking request complete"), "confirmation heading has focus", await focusedText(page));
  check(await page.getByText("This is a preview.").isVisible(), "preview notice on confirmation");
  const stored = await page.evaluate(() => sessionStorage.getItem("pt-booking-assembly-furniture-assembly"));
  check(stored === null, "saved draft cleared after confirming");
  await page.screenshot({ path: path.join(OUT, "e2e-booking-done.png") });
  await axe(page, "confirmation");

  // 4. Phone width
  console.log("\n== Phone width (390px)");
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p2 = await phone.newPage();
  for (const url of ["/", "/services", "/services/moving", "/book/moving/help-moving"]) {
    await p2.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
    const overflow = await p2.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 0, `no sideways scroll on ${url}`, overflow > 0 ? `${overflow}px too wide` : "");
  }
  await p2.goto(`${BASE}/book/moving/help-moving`, { waitUntil: "networkidle" });
  await p2.screenshot({ path: path.join(OUT, "e2e-phone-booking.png") });

  // 5. The same screens in light mode, where the palette is different.
  console.log("== Light mode");
  const light = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await light.addInitScript(() => {
    try {
      localStorage.setItem("pt-mode", "light");
      localStorage.setItem("pt-hero-video", "paused");
    } catch {}
  });
  const p3 = await light.newPage();
  for (const url of ["/", "/services", "/services/plumbing"]) {
    await p3.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
    await axe(p3, `light ${url}`);
  }
  await p3.goto(`${BASE}/book/cleaning/deep-clean`, { waitUntil: "networkidle" });
  await p3.getByRole("button", { name: "Continue" }).click();
  await p3.waitForTimeout(150);
  await axe(p3, "light booking step 1 with errors");
  await p3.getByLabel("Postcode where the job is").fill("M1 1AE");
  await p3.getByRole("radio", { name: /Small/ }).check({ force: true });
  await p3.getByRole("radio", { name: "2", exact: true }).check({ force: true });
  await p3.getByRole("button", { name: "Continue" }).click();
  await p3.waitForTimeout(150);
  await axe(p3, "light booking step 2");
  await p3.screenshot({ path: path.join(OUT, "e2e-light-taskers.png") });

  check(consoleErrors.length === 0, "no console errors or failed requests", consoleErrors.slice(0, 5).join(" | "));
  console.log(`\n=> ${failures === 0 ? "ALL CHECKS PASSED" : failures + " FAILED"}`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
