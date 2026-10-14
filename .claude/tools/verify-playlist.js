/*
 * Verify the hero playlist on Intisar's dev server, with his real Windows
 * motion setting, in Chrome and Edge:
 *   - the first clip autoplays
 *   - when a clip ends, the next one takes over (plumber -> electrician ->
 *     handyman -> plumber) and is the one on screen
 *   - pausing is remembered across a reload
 * To keep the run short, each clip is skipped to half a second before its end.
 */
const { chromium } = require("playwright-core");

const URL = "http://localhost:3000/";
const BROWSERS = {
  chrome: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  edge: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
};

const onScreen = (page) =>
  page.evaluate(() => {
    const vids = [...document.querySelectorAll(".hero-media__video")];
    const visible = vids.find((v) => v.classList.contains("is-visible"));
    return visible
      ? {
          clip: visible.currentSrc.split("/").pop(),
          playing: !visible.paused,
          visibleCount: vids.filter((v) => v.classList.contains("is-visible")).length,
        }
      : { clip: null, playing: false, visibleCount: 0 };
  });

async function waitForClip(page, name, timeout = 20000) {
  await page.waitForFunction(
    (n) => {
      const v = [...document.querySelectorAll(".hero-media__video")].find((x) =>
        x.classList.contains("is-visible")
      );
      return v && v.currentSrc.endsWith(n) && !v.paused && v.currentTime > 0.2;
    },
    name,
    { timeout }
  );
}

async function skipToEnd(page) {
  await page.evaluate(() => {
    const v = [...document.querySelectorAll(".hero-media__video")].find((x) =>
      x.classList.contains("is-visible")
    );
    v.currentTime = Math.max(0, v.duration - 0.5);
  });
}

(async () => {
  let allGood = true;
  for (const [name, exe] of Object.entries(BROWSERS)) {
    const browser = await chromium.launch({ executablePath: exe });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: null });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: "networkidle", timeout: 120000 });

    const order = ["plumber.mp4", "electrician.mp4", "handyman.mp4", "plumber.mp4"];
    const seen = [];
    try {
      for (let i = 0; i < order.length; i++) {
        await waitForClip(page, order[i]);
        const s = await onScreen(page);
        seen.push(`${s.clip}${s.playing ? "" : "(paused)"}${s.visibleCount === 1 ? "" : `[${s.visibleCount} visible]`}`);
        if (i < order.length - 1) {
          await page.waitForTimeout(1200); // let the next clip be queued and buffered
          await skipToEnd(page);
        }
      }
    } catch (err) {
      seen.push(`STOPPED: ${err.message.split("\n")[0]}`);
      allGood = false;
    }
    console.log(`${name}: ${seen.join(" -> ")}`);

    // Pause, reload: must stay paused on the still.
    await page.click(".hero-media__toggle");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const afterReload = await page.evaluate(() => ({
      anyPlaying: [...document.querySelectorAll(".hero-media__video")].some((v) => !v.paused),
      button: document.querySelector(".hero-media__toggle")?.textContent?.trim(),
    }));
    console.log(`  paused + reload: anyPlaying=${afterReload.anyPlaying} button="${afterReload.button}"`);
    if (afterReload.anyPlaying) allGood = false;

    await browser.close();
  }
  console.log(allGood ? "=> OK" : "=> PROBLEM");
  process.exit(allGood ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
