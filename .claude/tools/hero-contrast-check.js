/*
 * Lighter hero overlay + a feathered blur plate behind the text only.
 *
 * Each candidate thins the full-frame scrim (so the video shows clearly at the
 * top and sides) and adds a soft, edge-faded backdrop blur and tint behind the
 * hero text block. Measures worst-frame text contrast over all three clips at
 * desktop and phone, in both themes, and saves a screenshot per candidate over
 * the brightest clip.
 */
const { chromium } = require("playwright-core");
const path = require("path");

const URL = "http://localhost:3100/";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const CLIPS = ["/videos/plumber.mp4", "/videos/electrician.mp4", "/videos/handyman.mp4"];

const mix = (p) => `color-mix(in srgb, var(--bg) ${p}%, transparent)`;
const scrim = (lin, rad, mobile) =>
  mobile
    ? `linear-gradient(180deg, ${mix(lin[0])} 0%, ${mix(lin[1])} 30%, ${mix(lin[2])} 70%, var(--bg) 100%), radial-gradient(90% 60% at 50% 42%, ${mix(rad[0])} 0%, ${mix(rad[1])} 60%, transparent 100%)`
    : `linear-gradient(180deg, ${mix(lin[0])} 0%, ${mix(lin[1])} 40%, ${mix(lin[2])} 80%, var(--bg) 100%), radial-gradient(66% 58% at 50% 46%, ${mix(rad[0])} 0%, ${mix(rad[1])} 55%, transparent 100%)`;

const plateCss = (tint, blur, core) => `
.hero-inner::before {
  content: "";
  position: absolute;
  inset: -48px -72px;
  z-index: -1;
  pointer-events: none;
  background: ${mix(tint)};
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  mask-image: radial-gradient(closest-side, var(--bg) ${core}%, transparent 100%);
  -webkit-mask-image: radial-gradient(closest-side, var(--bg) ${core}%, transparent 100%);
}`;

const CANDIDATES = {
  SHIPPED: { d: "", m: "", plate: "" },
};

const TARGETS = [
  { name: "title", selector: ".hero-title", min: 3.0 },
  { name: "accent", selector: ".hero-title__accent", min: 3.0 },
  { name: "lede", selector: ".hero-lede", min: 4.5 },
];

const RUNS = [
  { name: "desktop-dark", viewport: { width: 1440, height: 900 }, mode: "dark" },
  { name: "mobile-dark", viewport: { width: 390, height: 844 }, mobile: true, mode: "dark" },
  { name: "desktop-light", viewport: { width: 1440, height: 900 }, mode: "light" },
  { name: "mobile-light", viewport: { width: 390, height: 844 }, mobile: true, mode: "light" },
];

async function contrastBehind(page, selector) {
  const color = await page.$eval(selector, (el) => getComputedStyle(el).color);
  await page.$eval(selector, (el) => el.setAttribute("data-measure", ""));
  // Measure where the text actually is: the box around its line boxes, not
  // the full width of a block element, which includes empty space either side.
  const box = await page.$eval(selector, (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const png = await page.screenshot({ clip: box });
  await page.$eval(selector, (el) => el.removeAttribute("data-measure"));
  return page.evaluate(
    async ({ b64, color }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const [tr, tg, tb] = color.match(/\d+/g).map(Number);
      const lt = lum(tr, tg, tb);
      const ratios = [];
      for (let i = 0; i < data.length; i += 16) {
        const lb = lum(data[i], data[i + 1], data[i + 2]);
        ratios.push((Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05));
      }
      ratios.sort((a, b) => a - b);
      return ratios[Math.floor(ratios.length * 0.05)];
    },
    { b64: png.toString("base64"), color }
  );
}

async function loadClip(page, clip) {
  return page.evaluate(async (src) => {
    const v = document.querySelectorAll(".hero-media__video")[0];
    v.pause();
    v.setAttribute("data-measure-video", "");
    v.src = src;
    await new Promise((resolve, reject) => {
      v.addEventListener("loadeddata", resolve, { once: true });
      v.addEventListener("error", () => reject(new Error("load failed " + src)), { once: true });
    });
    return v.duration;
  }, clip);
}

async function seek(page, time) {
  await page.evaluate(
    (t) =>
      new Promise((resolve) => {
        const v = document.querySelectorAll(".hero-media__video")[0];
        v.addEventListener("seeked", () => resolve(), { once: true });
        v.currentTime = t;
      }),
    time
  );
  await page.waitForTimeout(120);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  for (const [id, cand] of Object.entries(CANDIDATES)) {
    console.log(`\n### ${id}`);
    let allPass = true;
    for (const run of RUNS) {
      const context = await browser.newContext({
        viewport: run.viewport,
        isMobile: !!run.mobile,
        hasTouch: !!run.mobile,
        deviceScaleFactor: run.mobile ? 2 : 1,
      });
      await context.addInitScript((mode) => {
        try {
          localStorage.setItem("pt-mode", mode);
          localStorage.setItem("pt-hero-video", "paused");
        } catch {}
      }, run.mode);
      const page = await context.newPage();
      await page.goto(URL, { waitUntil: "networkidle", timeout: 120000 });
      await page.addStyleTag({
        content: [
          cand.d && `.hero-media__scrim { background: ${cand.d} !important; }`,
          cand.m && `@media (max-width: 620px) { .hero-media__scrim { background: ${cand.m} !important; } }`,
          cand.plate,
          "[data-measure], [data-measure] * { color: transparent !important; text-shadow: none !important; }",
          ".hero-media__video { opacity: 0 !important; transition: none !important; }",
          ".hero-media__video[data-measure-video] { opacity: 1 !important; }",
        ].filter(Boolean).join("\n"),
      });
      await page.waitForTimeout(2000);

      const cells = [];
      for (const clip of CLIPS) {
        const duration = await loadClip(page, clip);
        const worst = {};
        for (const f of [0.05, 0.25, 0.5, 0.75, 0.95]) {
          await seek(page, f * duration);
          for (const t of TARGETS) {
            const p5 = await contrastBehind(page, t.selector);
            if (worst[t.name] === undefined || p5 < worst[t.name]) worst[t.name] = p5;
          }
        }
        const fails = TARGETS.filter((t) => worst[t.name] < t.min).map((t) => t.name);
        if (fails.length) allPass = false;
        const tag = clip.split("/").pop().replace(".mp4", "").slice(0, 5);
        cells.push(`${tag}: ${TARGETS.map((t) => worst[t.name].toFixed(2)).join("/")}${fails.length ? " FAIL(" + fails.join(",") + ")" : ""}`);
      }
      console.log(`  ${run.name.padEnd(13)} ${cells.join("  |  ")}`);

      if (run.name === "desktop-dark" || run.name === "mobile-dark") {
        const duration = await loadClip(page, "/videos/electrician.mp4");
        await seek(page, duration * 0.5);
        await page.screenshot({ path: path.join(__dirname, `hero-contrast-${run.name}.png`) });
      }
      await context.close();
    }
    console.log(`  => ${allPass ? "ALL PASS" : "fails"}   (title/accent/lede)`);
  }
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
