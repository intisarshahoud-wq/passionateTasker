/*
 * Checks for the public pages and the display settings (Stage A of the
 * blueprint plan, .claude/milestones/00-blueprint-gap-plan.md).
 *
 *  1. Header: fits at every width, in normal and larger text, signed out and
 *     signed in; exactly one form of the display settings and one form of the
 *     navigation is showing; the menu and the Display panel open and close.
 *  2. Every page: no sideways scrolling and no hit target under 24px, at five
 *     widths, in normal and larger text.
 *  3. Every page: an axe accessibility scan in all four colour settings
 *     (dark, light, high contrast, high contrast with light mode).
 *  4. The information pages: one h1, no skipped heading levels, breadcrumbs,
 *     title, canonical link, and a keyboard walk that every stop shows focus.
 *  5. Display settings: each one applies, is remembered, and follows the
 *     device's "more contrast" setting when nothing has been chosen.
 *  6. The questions list works by keyboard, and its structured data matches
 *     what is on screen.
 *  7. Search: robots.txt, sitemap.xml, structured data, noindex on booking.
 *  8. The assistant: new commands and the corrected answers.
 *  9. Reduced motion: buttons and cards do not move on hover.
 *
 * Expects a production build on port 3100 (see README). Set BASE to use
 * another address.
 */
const { chromium } = require("playwright-core");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:3100";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const AXE = require.resolve("axe-core/axe.min.js");
const OUT = __dirname;

const INFO_PAGES = [
  { url: "/how-it-works", h1: "How Passionate Taskers works", title: "How it works, step by step | Passionate Taskers" },
  { url: "/trust", h1: "How we check tradespeople", title: "Trust and safety: how we check tradespeople | Passionate Taskers" },
  { url: "/accessibility", h1: "Our mission and accessibility", title: "Our mission and accessibility | Passionate Taskers" },
  { url: "/about", h1: "About Passionate Taskers", title: "About | Passionate Taskers" },
];
const ALL_PAGES = [
  "/",
  "/services",
  "/services/plumbing",
  "/services/electrical",
  ...INFO_PAGES.map((p) => p.url),
  "/book/assembly/furniture-assembly",
];
const THEMES = [
  { name: "dark", mode: "dark", contrast: "normal" },
  { name: "light", mode: "light", contrast: "normal" },
  { name: "high contrast", mode: "dark", contrast: "high" },
  { name: "high contrast + light", mode: "light", contrast: "high" },
];

let failures = 0;
const check = (ok, label, extra = "") => {
  if (!ok) failures++;
  const note = String(extra).replace(/\s+/g, " ").trim();
  console.log(`${ok ? "  ok  " : "  FAIL"} ${label}${note ? "  " + note : ""}`);
};

/** A context with the display settings, the hero video paused, and optionally a demo session. */
async function open(browser, { width = 1366, height = 900, mode, contrast, text, signedIn, mobile, emulate } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
    isMobile: !!mobile,
    hasTouch: !!mobile,
    ...(emulate || {}),
  });
  await context.addInitScript(
    ({ mode, contrast, text, signedIn }) => {
      try {
        if (mode) localStorage.setItem("pt-mode", mode);
        if (contrast) localStorage.setItem("pt-contrast", contrast);
        if (text) localStorage.setItem("pt-text", text);
        localStorage.setItem("pt-hero-video", "paused");
        if (signedIn) {
          const session = {
            id: "u_test",
            name: "Christopher Featherstonehaugh",
            email: "christopher@example.com",
            role: "customer",
            provider: "password",
            createdAt: "2026-09-30T00:00:00.000Z",
          };
          localStorage.setItem("pt-session", JSON.stringify(session));
          localStorage.setItem("pt-accounts", JSON.stringify([session]));
        }
      } catch {}
    },
    { mode, contrast, text, signedIn }
  );
  return context;
}

async function axe(page, label) {
  await page.addScriptTag({ path: AXE });
  const result = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    });
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      count: v.nodes.length,
      sample: v.nodes[0]?.target?.join(" ") ?? "",
      detail: v.nodes[0]?.any?.[0]?.message ?? "",
    }));
  });
  const serious = result.filter((v) => v.impact === "serious" || v.impact === "critical");
  check(
    serious.length === 0,
    `axe ${label}: ${serious.length} serious/critical`,
    serious.map((v) => `${v.id}(${v.count}) @ ${v.sample} ${v.detail}`).join(" | ")
  );
  const minor = result.filter((v) => !(v.impact === "serious" || v.impact === "critical"));
  if (minor.length) console.log(`        minor: ${minor.map((v) => `${v.id}(${v.count}) @ ${v.sample}`).join(", ")}`);
}

/** How far the page is wider than the window, and what is sticking out. */
const overflow = (page) =>
  page.evaluate(() => {
    const over = document.documentElement.scrollWidth - window.innerWidth;
    if (over <= 0) return { over: 0, culprit: "" };
    // Inside something that scrolls or clips sideways, sticking out is fine.
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox !== "visible" && p.getBoundingClientRect().right <= window.innerWidth + 0.5) return true;
      }
      return false;
    };
    let worst = null;
    let worstRight = window.innerWidth;
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > worstRight + 0.5 && !clipped(el)) {
        worstRight = r.right;
        worst = el;
      }
    }
    const name = worst
      ? `${worst.tagName.toLowerCase()}${worst.className && typeof worst.className === "string" ? "." + worst.className.trim().split(/\s+/).join(".") : ""}`
      : "?";
    return { over, culprit: name };
  });

/** Visible controls smaller than 24px either way (links inside a sentence are exempt, as in WCAG 2.5.8). */
const smallTargets = (page) =>
  page.evaluate(() => {
    const out = [];
    const selector = 'a[href], button, input:not([type="hidden"]), select, textarea, [role="tab"], [role="radio"], [tabindex]:not([tabindex="-1"])';
    for (const el of document.querySelectorAll(selector)) {
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (el.closest("[hidden], [aria-hidden='true']")) continue;
      if (el.classList.contains("skip-link") || el.classList.contains("visually-hidden")) continue;
      if (r.width >= 24 && r.height >= 24) continue;
      // Inline link inside running text.
      if (el.tagName === "A" && style.display === "inline") {
        const parentText = (el.parentElement?.textContent || "").trim();
        if (parentText.length > (el.textContent || "").trim().length) continue;
      }
      // A radio or checkbox input hidden inside a larger label (React Aria).
      if (el.tagName === "INPUT" && el.closest("label")) continue;
      out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    return out;
  });

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const consoleErrors = [];
  const watch = (page) => {
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${m.text()} [on ${page.url()}]`));
    page.on("pageerror", (e) => consoleErrors.push(`${e.message} [on ${page.url()}]`));
    page.on("response", (r) => r.status() >= 400 && consoleErrors.push(`HTTP ${r.status()} ${r.url()}`));
  };

  /* ---- 1. Header ---- */
  console.log("\n== Header: fits at every width");
  // Includes the first width of each layout step (384, 624, 720, 928, 1344, 1440),
  // where the bar is at its fullest, and 1349: a 1366px laptop less its scrollbar.
  const WIDTHS = [320, 344, 360, 375, 384, 390, 414, 480, 600, 624, 700, 720, 768, 820, 900, 928, 1024, 1180, 1280, 1344, 1349, 1366, 1440, 1536, 1920];
  for (const text of ["normal", "lg"]) {
    for (const signedIn of [false, true]) {
      const context = await open(browser, { width: 1920, text, signedIn });
      const page = await context.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
      const bad = [];
      const tiers = [];
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(60);
        const state = await page.evaluate(() => {
          const shown = (sel) => {
            const el = document.querySelector(sel);
            return !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0;
          };
          const inner = document.querySelector("header.site .site-inner");
          const innerStyle = getComputedStyle(inner);
          const kids = [...inner.children].filter((el) => getComputedStyle(el).display !== "none");
          // Room left in the bar: its inner width, less what its contents need.
          const available = inner.getBoundingClientRect().width - parseFloat(innerStyle.paddingLeft) - parseFloat(innerStyle.paddingRight);
          const needed = kids.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) + parseFloat(innerStyle.columnGap) * (kids.length - 1);
          return {
            doc: document.documentElement.scrollWidth - window.innerWidth,
            spare: Math.round(available - needed),
            nav: shown("header.site nav.primary"),
            menuBtn: shown("header.site .menu-btn"),
            inline: shown("header.site .display-inline"),
            displayBtn: shown("header.site .display-btn"),
            cta: shown("header.site .header-cta"),
            signin: shown("header.site .header-signin"),
            wordmark: parseFloat(getComputedStyle(document.querySelector("header.site .logo")).fontSize) > 0,
          };
        });
        const problems = [];
        if (state.doc > 0) problems.push(`page ${state.doc}px too wide`);
        if (state.spare < 0) problems.push(`bar overflows by ${-state.spare}px`);
        if (state.nav === state.menuBtn) problems.push("nav and menu button both " + (state.nav ? "shown" : "hidden"));
        if (state.inline === state.displayBtn) problems.push("inline settings and Display button both " + (state.inline ? "shown" : "hidden"));
        if (problems.length) bad.push(`${width}: ${problems.join(", ")}`);
        tiers.push(`${width}:${state.wordmark ? "W" : "m"}${state.nav ? "N" : "h"}${state.inline ? "T" : "d"}${state.cta ? "C" : "-"}${state.signin ? "S" : "-"}(${state.spare})`);
      }
      check(bad.length === 0, `header, ${text} text, signed ${signedIn ? "in" : "out"}`, bad.join(" | "));
      console.log(`        ${tiers.join(" ")}`);
      await context.close();
    }
  }
  console.log("        key: W wordmark / m mark only, N nav / h hamburger, T three settings in bar / d Display button, C account buttons, S sign in, (spare px)");

  console.log("\n== Header: menu and Display panel");
  {
    // The menu must open wherever the menu button is shown, including tablets and small laptops.
    for (const width of [390, 1024, 1280]) {
      const context = await open(browser, { width });
      const page = await context.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Open menu" }).click();
      const visible = await page.locator("#mobileMenu").getByRole("link", { name: "How it works" }).isVisible();
      check(visible, `menu opens at ${width}px`);
      await page.keyboard.press("Escape");
      const closed = !(await page.locator("#mobileMenu").isVisible());
      const focusBack = await page.evaluate(() => document.activeElement?.classList.contains("menu-btn"));
      check(closed && focusBack, `Escape closes the menu at ${width}px and returns focus to the button`);
      await context.close();
    }

    const context = await open(browser, { width: 390, height: 844, mobile: true });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const button = page.getByRole("button", { name: /^Display/ });
    check((await button.getAttribute("aria-expanded")) === "false", "Display button starts collapsed");
    await button.click();
    await page.waitForTimeout(100);
    check((await button.getAttribute("aria-expanded")) === "true", "Display button reports expanded");
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-labelledby") ? document.getElementById(document.activeElement.getAttribute("aria-labelledby"))?.textContent : document.activeElement?.textContent);
    check(focused === "Larger text", "opening the panel puts focus on the first setting", `focus on "${focused}"`);
    const options = page.locator("#displayPanel").getByRole("button");
    check((await options.count()) === 3, "three settings in the panel", `found ${await options.count()}`);
    const names = await options.evaluateAll((els) => els.map((el) => document.getElementById(el.getAttribute("aria-labelledby"))?.textContent));
    check(names.join("|") === "Larger text|Light mode|High contrast", "settings are named", names.join("|"));
    const described = await options.first().evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent);
    check(/fifth bigger/.test(described || ""), "each setting has a description", described || "");
    await options.nth(2).click();
    check((await page.evaluate(() => document.documentElement.getAttribute("data-contrast"))) === "high", "High contrast applies from the panel");
    check((await options.nth(2).getAttribute("aria-pressed")) === "true", "and reports pressed");
    check((await options.nth(2).locator(".display-option__state").textContent()) === "On", "and shows the word On");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(80);
    check(!(await page.locator("#displayPanel").isVisible()), "Escape closes the Display panel");
    check(await page.evaluate(() => document.activeElement?.classList.contains("display-btn")), "and returns focus to the Display button");
    await page.screenshot({ path: path.join(OUT, "pages-phone-high-contrast.png") });
    await context.close();
  }

  /* ---- 2. Sideways scrolling and hit targets ---- */
  console.log("\n== Every page: no sideways scrolling, no tiny targets");
  for (const text of ["normal", "lg"]) {
    const context = await open(browser, { width: 1366, text });
    const page = await context.newPage();
    for (const url of ALL_PAGES) {
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
      const wide = [];
      const small = new Set();
      for (const width of [320, 390, 768, 1024, 1366]) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(80);
        const o = await overflow(page);
        if (o.over > 0) wide.push(`${width}px: ${o.over}px too wide (${o.culprit})`);
        if (width === 390 || width === 1366) for (const t of await smallTargets(page)) small.add(`${t} @${width}`);
      }
      check(wide.length === 0, `no sideways scroll on ${url}, ${text} text`, wide.join(" | "));
      check(small.size === 0, `no target under 24px on ${url}, ${text} text`, [...small].slice(0, 4).join(" | "));
    }
    await context.close();
  }

  /* ---- 3. axe in every colour setting ---- */
  console.log("\n== Every page: axe, in all four colour settings");
  for (const theme of THEMES) {
    const context = await open(browser, { width: 1280, mode: theme.mode, contrast: theme.contrast });
    const page = await context.newPage();
    watch(page);
    for (const url of ALL_PAGES) {
      await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
      if (url === "/") {
        // Open two answers so the scan covers the expanded state as well.
        const triggers = page.locator("#faq .faq__trigger");
        await triggers.nth(0).click();
        await triggers.nth(2).click();
      }
      await axe(page, `${theme.name} ${url}`);
    }
    await context.close();
  }
  {
    // Phone width, where the hero text leaves the video and the Display panel is used.
    for (const theme of [THEMES[2], THEMES[3]]) {
      const context = await open(browser, { width: 390, height: 844, mobile: true, mode: theme.mode, contrast: theme.contrast });
      const page = await context.newPage();
      for (const url of ["/", "/accessibility", "/trust"]) {
        await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
        await page.getByRole("button", { name: /^Display/ }).click();
        await axe(page, `phone, ${theme.name} ${url}, Display panel open`);
      }
      await context.close();
    }
  }

  /* ---- 4. Information pages ---- */
  console.log("\n== Information pages: structure and keyboard");
  {
    const context = await open(browser, { width: 1280 });
    const page = await context.newPage();
    for (const info of INFO_PAGES) {
      await page.goto(`${BASE}${info.url}`, { waitUntil: "networkidle" });
      const h1s = await page.getByRole("heading", { level: 1 }).allTextContents();
      check(h1s.length === 1 && h1s[0] === info.h1, `${info.url} has one h1`, h1s.join(" / "));
      check((await page.title()) === info.title, `${info.url} title`, await page.title());
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      check(!!canonical && canonical.endsWith(info.url), `${info.url} canonical link`, canonical || "missing");
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      check(!!description && description.length > 60, `${info.url} has a description`);
      check((await page.locator("html").getAttribute("lang")) === "en-GB", `${info.url} language is en-GB`);
      check(await page.getByRole("navigation", { name: "Breadcrumb" }).isVisible(), `${info.url} has breadcrumbs`);

      const skipped = await page.evaluate(() => {
        const levels = [...document.querySelectorAll("main h1, main h2, main h3, main h4")].map((h) => ({ level: Number(h.tagName[1]), text: h.textContent.trim().slice(0, 30) }));
        const out = [];
        for (let i = 1; i < levels.length; i++) if (levels[i].level > levels[i - 1].level + 1) out.push(`h${levels[i - 1].level} -> h${levels[i].level} "${levels[i].text}"`);
        return out;
      });
      check(skipped.length === 0, `${info.url} heading levels do not skip`, skipped.join(" | "));

      // Keyboard walk: every stop must show a focus ring.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator("body").click({ position: { x: 2, y: 2 } });
      const seen = new Set();
      const noRing = [];
      let stops = 0;
      for (let i = 0; i < 120; i++) {
        await page.keyboard.press("Tab");
        const stop = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const s = getComputedStyle(el);
          const ring = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2;
          const r = el.getBoundingClientRect();
          return { id: `${el.tagName}|${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}|${Math.round(r.x)}|${Math.round(r.y + window.scrollY)}`, ring, label: `${el.tagName.toLowerCase()} "${(el.textContent || "").trim().slice(0, 30)}"` };
        });
        if (!stop) break;
        if (seen.has(stop.id)) break;
        seen.add(stop.id);
        stops++;
        if (!stop.ring) noRing.push(stop.label);
      }
      check(stops > 15 && noRing.length === 0, `${info.url} keyboard walk: ${stops} stops, all with a focus ring`, noRing.slice(0, 4).join(" | "));
    }

    // Links in the pages go somewhere real.
    await page.goto(`${BASE}/how-it-works`, { waitUntil: "networkidle" });
    const hrefs = new Set();
    for (const info of INFO_PAGES) {
      await page.goto(`${BASE}${info.url}`, { waitUntil: "networkidle" });
      for (const href of await page.locator("main a[href^='/'], footer a[href^='/'], header a[href^='/']").evaluateAll((els) => els.map((a) => a.getAttribute("href")))) hrefs.add(href);
    }
    const broken = [];
    for (const href of hrefs) {
      const [pathname, hash] = href.split("#");
      const response = await page.goto(`${BASE}${pathname || "/"}`, { waitUntil: "domcontentloaded" });
      if (!response || response.status() !== 200) broken.push(`${href} (${response?.status()})`);
      else if (hash && !(await page.locator(`[id="${hash}"]`).count())) broken.push(`${href} (no #${hash})`);
    }
    check(broken.length === 0, `all ${hrefs.size} internal links resolve, including their anchors`, broken.join(" | "));
    await context.close();
  }

  /* ---- 5. Display settings ---- */
  console.log("\n== Display settings");
  {
    const context = await open(browser, { width: 1440 });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const group = page.locator("header.site").getByRole("group", { name: "Display settings" });
    const labels = await group.getByRole("button").allTextContents();
    check(labels.join("|") === "Larger text|Light mode|High contrast", "three labelled settings in the bar at 1440px", labels.join("|"));
    const attr = (name) => page.evaluate((n) => document.documentElement.getAttribute(n), name);

    await group.getByRole("button", { name: "High contrast" }).click();
    check((await attr("data-contrast")) === "high", "High contrast sets data-contrast");
    check((await group.getByRole("button", { name: "High contrast" }).getAttribute("aria-pressed")) === "true", "and the button is pressed");
    await group.getByRole("button", { name: "Light mode" }).click();
    check((await attr("data-mode")) === "light", "Light mode sets data-mode");
    check((await group.getByRole("button", { name: "Light mode" }).getAttribute("aria-pressed")) === "true", "Light mode keeps its name and reports pressed");
    await group.getByRole("button", { name: "Larger text" }).click();
    check((await attr("data-text")) === "lg", "Larger text sets data-text");
    await page.screenshot({ path: path.join(OUT, "pages-high-contrast-light.png") });

    await page.reload({ waitUntil: "networkidle" });
    check((await attr("data-contrast")) === "high" && (await attr("data-mode")) === "light" && (await attr("data-text")) === "lg", "all three are remembered after a reload");
    const pressed = await page.locator("header.site [aria-pressed='true']:visible").count();
    check(pressed === 3, "and the buttons still report pressed", `pressed: ${pressed}`);

    // The accessibility page carries the same settings, and they stay in step with the header.
    await page.goto(`${BASE}/accessibility`, { waitUntil: "networkidle" });
    const onPage = page.locator("main").getByRole("group", { name: "Display settings" });
    check((await onPage.getByRole("button").count()) === 3, "accessibility page has the three settings");
    await onPage.getByRole("button").nth(2).click();
    check((await attr("data-contrast")) === "normal", "turning contrast off on the page works");
    check((await page.locator("header.site").getByRole("button", { name: "High contrast" }).getAttribute("aria-pressed")) === "false", "and the header button follows");
    await context.close();

    // A device that asks for more contrast gets the theme without choosing it.
    const os = await browser.newContext({ viewport: { width: 1440, height: 900 }, contrast: "more" });
    const p2 = await os.newPage();
    await p2.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const auto = await p2.evaluate(() => document.documentElement.getAttribute("data-contrast"));
    check(auto === "high", "device 'more contrast' switches high contrast on by default", `data-contrast=${auto}`);
    await p2.locator("header.site").getByRole("button", { name: "High contrast" }).click();
    await p2.reload({ waitUntil: "networkidle" });
    check((await p2.evaluate(() => document.documentElement.getAttribute("data-contrast"))) === "normal", "and a choice to turn it off is respected over the device setting");
    await os.close();
  }

  /* ---- 6. Questions ---- */
  console.log("\n== Questions list");
  {
    const context = await open(browser, { width: 1280 });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const triggers = page.locator("#faq").getByRole("button");
    const count = await triggers.count();
    check(count === 8, "eight questions", `found ${count}`);
    const first = triggers.first();
    check((await first.getAttribute("aria-expanded")) === "false", "questions start closed");
    check((await page.locator("#faq h3 button").count()) === count, "each question is a button inside a heading");
    await first.focus();
    await page.keyboard.press("Enter");
    check((await first.getAttribute("aria-expanded")) === "true", "Enter opens a question");
    check(await page.locator("#faq").getByText("Not yet. We have not launched.").isVisible(), "and its answer is shown");
    await page.keyboard.press("Space");
    check((await first.getAttribute("aria-expanded")) === "false", "Space closes it again");

    const data = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((el) => JSON.parse(el.textContent)));
    const graph = data.flatMap((d) => d["@graph"] || [d]);
    const faq = graph.find((n) => n["@type"] === "FAQPage");
    check(!!faq && faq.mainEntity.length === count, "structured data has the same number of questions", faq ? String(faq.mainEntity.length) : "none");
    const visible = await page.locator("#faq .faq__question").allTextContents();
    check(!!faq && faq.mainEntity.every((q, i) => q.name === visible[i]), "and the same questions, in the same order");
    check(graph.some((n) => n["@type"] === "Organization") && graph.some((n) => n["@type"] === "WebSite"), "home page describes the organisation and the site");
    check(!graph.some((n) => /Review|AggregateRating|Offer/.test(String(n["@type"]))), "no reviews, ratings or prices in structured data");
    await context.close();
  }

  /* ---- 7. Search ---- */
  console.log("\n== Search");
  {
    const context = await open(browser, { width: 1280 });
    const page = await context.newPage();
    const robots = await page.goto(`${BASE}/robots.txt`);
    const robotsText = await robots.text();
    check(robots.status() === 200 && /Allow: \//.test(robotsText) && /Sitemap: .+\/sitemap\.xml/.test(robotsText), "robots.txt allows crawling and names the sitemap");
    const sitemap = await page.goto(`${BASE}/sitemap.xml`);
    const xml = await sitemap.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    check(sitemap.status() === 200 && locs.length === 15, "sitemap.xml lists the 15 public pages", `found ${locs.length}`);
    check(!locs.some((l) => l.includes("/book/")), "booking steps are not in the sitemap");
    check(["/how-it-works", "/trust", "/accessibility", "/about", "/services/plumbing"].every((p) => locs.some((l) => l.endsWith(p))), "new pages and categories are in the sitemap");

    await page.goto(`${BASE}/book/assembly/furniture-assembly`, { waitUntil: "domcontentloaded" });
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute("content");
    check(/noindex/.test(robotsMeta || ""), "booking pages are noindex", robotsMeta || "missing");

    await page.goto(`${BASE}/services/electrical`, { waitUntil: "networkidle" });
    const data = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((el) => JSON.parse(el.textContent)));
    check(data.some((d) => d["@type"] === "Service" && d.name === "Electrical"), "category page describes the service");
    check(data.some((d) => d["@type"] === "BreadcrumbList" && d.itemListElement.length === 3), "and its breadcrumb trail");
    check((await page.title()) === "Electrical: jobs and starting prices | Passionate Taskers", "category title", await page.title());
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    check((await page.title()) === "Passionate Taskers — Tell us what needs fixing", "home title", await page.title());
    const homeCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    check(!!homeCanonical && !/\/(services|trust)/.test(homeCanonical), "home canonical link", homeCanonical || "missing");
    await context.close();
  }

  /* ---- 8. Assistant ---- */
  console.log("\n== Assistant");
  {
    const context = await open(browser, { width: 1280 });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Ask for help" }).click();
    const input = page.getByRole("textbox", { name: "Your message" });
    const ask = async (text) => {
      await input.fill(text);
      await input.press("Enter");
      await page.waitForTimeout(120);
      return page.locator(".assistant__turn:not(.assistant__turn--mine)").last().innerText();
    };
    await ask("turn on high contrast");
    check((await page.evaluate(() => document.documentElement.getAttribute("data-contrast"))) === "high", "'turn on high contrast' switches it on");
    await ask("turn off high contrast");
    check((await page.evaluate(() => document.documentElement.getAttribute("data-contrast"))) === "normal", "'turn off high contrast' switches it off");
    const pay = await ask("how do I pay?");
    check(/pay your tradesperson directly/.test(pay) && !/held/.test(pay), "paying: says you pay directly, nothing about money being held", pay.slice(0, 80));
    const safe = await ask("is it safe?");
    check(/identity verified/.test(safe) && /public liability insurance/.test(safe) && !/held|background-checked/.test(safe), "safety: names the checks", safe.slice(0, 90));
    const how = await ask("how does this work?");
    check(/Five steps: tell us, match, talk, track and approve\./.test(how), "how it works: the five steps", how.slice(0, 80));
    const job = await ask("my boiler has gone wrong and there is no hot water");
    check(/job/.test(job) && !/messaging your tradesperson/.test(job), "a broken boiler is still treated as a job, not a dispute", job.slice(0, 80));
    const wrong = await ask("what if something goes wrong?");
    check(/messaging your tradesperson/.test(wrong), "disputes: start with the tradesperson", wrong.slice(0, 80));

    // Following a link keeps the conversation open.
    await page.locator(".assistant__link").last().click();
    await page.waitForURL(/how-it-works/);
    check(await page.getByRole("dialog", { name: /assistant/ }).isVisible(), "following an answer's link keeps the assistant open");
    await context.close();
  }

  /* ---- 9. Reduced motion ---- */
  console.log("\n== Reduced motion");
  {
    const context = await open(browser, { width: 1280 });
    const page = await context.newPage();
    await page.goto(`${BASE}/how-it-works`, { waitUntil: "networkidle" });
    const moved = [];
    for (const selector of [".info-actions .btn-primary", ".info-actions .btn-outline", ".info-card"]) {
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      await el.hover();
      await page.waitForTimeout(120);
      const transform = await el.evaluate((node) => getComputedStyle(node).transform);
      if (transform !== "none" && transform !== "matrix(1, 0, 0, 1, 0, 0)") moved.push(`${selector}: ${transform}`);
    }
    check(moved.length === 0, "buttons and cards stay put on hover when reduced motion is on", moved.join(" | "));
    await context.close();

    const motion = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });
    const p2 = await motion.newPage();
    await p2.goto(`${BASE}/how-it-works`, { waitUntil: "networkidle" });
    const lifts = [];
    for (const selector of [".info-actions .btn-primary", ".info-card"]) {
      const el = p2.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      await el.hover();
      await p2.waitForTimeout(700);
      const y = await el.evaluate((node) => {
        const t = getComputedStyle(node).transform;
        return t === "none" ? 0 : Math.abs(new DOMMatrix(t).m42);
      });
      if (y > 4.01) lifts.push(`${selector}: ${y}px`);
    }
    check(lifts.length === 0, "with motion allowed, nothing lifts more than 4px on hover", lifts.join(" | "));
    await motion.close();
  }

  check(consoleErrors.length === 0, "no console errors or failed requests during the axe pass", [...new Set(consoleErrors)].slice(0, 5).join(" | "));
  console.log(`\n=> ${failures === 0 ? "ALL CHECKS PASSED" : failures + " FAILED"}`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
