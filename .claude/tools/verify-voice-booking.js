/*
 * Voice booking, end to end, with a scripted microphone.
 *
 * Replaces the browser's speech recogniser with one that "hears" a fixed list
 * of answers, and the speech synthesiser with one that records what the site
 * says and finishes instantly. Then presses the hero microphone and checks the
 * conversation reaches a completed booking with every field filled in.
 * Also runs axe on the booking page with the voice panel, in both themes.
 *
 * Needs the site on http://localhost:3100 (npx next dev -p 3100).
 */
const { chromium } = require("playwright-core");
const fs = require("fs");

const BASE = process.env.BASE || "http://localhost:3100";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const ANSWERS = [
  "I need an electrician my sockets keep sparking SW1A 1AA tomorrow morning",
  "yes",
  "small",
  "yes",
  "the second one",
  "yes",
  "yes",
  "my name is intisar shah",
  "intisar dot shah at gmail dot com",
  "yes",
  "no",
  "confirm",
];

function fakeSpeech(answers) {
  window.__answers = answers.slice();
  window.__spoken = [];
  window.__heard = [];
  class FakeRecognition {
    start() {
      setTimeout(() => {
        const text = window.__answers.shift();
        if (text === undefined) {
          this.onerror && this.onerror({ error: "no-speech" });
        } else {
          window.__heard.push(text);
          this.onresult && this.onresult({ results: [[{ transcript: text }]] });
        }
        this.onend && this.onend();
      }, 40);
    }
    stop() {}
    abort() {
      this.onerror && this.onerror({ error: "aborted" });
      this.onend && this.onend();
    }
  }
  window.SpeechRecognition = FakeRecognition;
  window.webkitSpeechRecognition = FakeRecognition;
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      speak(u) {
        window.__spoken.push(u.text);
        setTimeout(() => u.onend && u.onend(), 5);
      },
      cancel() {},
    },
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  let failed = false;
  const expect = (label, ok, extra = "") => {
    if (!ok) failed = true;
    console.log(`${ok ? "ok  " : "FAIL"} ${label}${extra ? `: ${extra}` : ""}`);
  };

  /* ---- The whole conversation ---- */
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(fakeSpeech, ANSWERS);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 120000 });
  await page.getByRole("button", { name: "Book by voice: say what you need" }).click();

  await page.waitForURL(/\/book\/electrical\/sockets-switches/, { timeout: 30000 });
  expect("hero opened the right booking", true, page.url());

  try {
    await page.waitForSelector(".booking-done", { timeout: 60000 });
  } catch (err) {
    const state = await page.evaluate(() => ({
      spoken: window.__spoken,
      heard: window.__heard,
      left: window.__answers,
      panel: document.querySelector(".voice-guide")?.textContent,
      url: location.href,
    }));
    console.log(JSON.stringify(state, null, 2));
    console.log("page errors:", errors);
    throw err;
  }
  const facts = await page.$$eval(".booking-done__facts div", (rows) =>
    rows.map((r) => `${r.querySelector("dt").textContent}=${r.querySelector("dd").textContent}`)
  );
  console.log("     " + facts.join(" | "));
  expect("booking completed", facts.some((f) => f.startsWith("Reference=PT-")));
  expect("job is sockets and switches", facts.includes("Job=Sockets and switches"));
  expect("second tasker chosen", facts.some((f) => f.startsWith("Tasker=") && !f.includes("undefined")));
  expect("tomorrow morning", facts.some((f) => /^When=Tomorrow, .*morning/.test(f)), facts.find((f) => f.startsWith("When=")));

  // The confirmation screen appears a moment before the guide reads it out.
  await page
    .waitForFunction(() => window.__spoken.some((s) => s.startsWith("Your booking request is complete")), null, { timeout: 5000 })
    .catch(() => {});
  const spoken = await page.evaluate(() => window.__spoken);
  const left = await page.evaluate(() => window.__answers.length);
  expect("every scripted answer used", left === 0, `${left} left`);
  expect("postcode spelt back", spoken.some((s) => s.includes("S W 1 A 1 A A")));
  expect("email spelt back", spoken.some((s) => s.includes("i n t i s a r dot s h a h at g m a i l dot c o m")));
  expect("preview warning spoken", spoken.some((s) => s.includes("nothing will be sent")));
  expect("completion spoken", spoken.some((s) => s.startsWith("Your booking request is complete")));
  expect("voice flag removed from URL", !page.url().includes("?voice"), page.url());
  expect("no page errors", errors.length === 0, errors.join("; "));
  fs.writeFileSync(__dirname + "/voice-booking-transcript.txt", spoken.map((s, i) => `${i + 1}. ${s}`).join("\n"));
  await context.close();

  /* ---- Stop works, and answers are kept ---- */
  const stopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await stopContext.addInitScript(fakeSpeech, ["stop"]);
  const stopPage = await stopContext.newPage();
  await stopPage.goto(`${BASE}/book/plumbing/leaking-tap`, { waitUntil: "networkidle" });
  await stopPage.getByRole("button", { name: "Book by voice" }).click();
  await stopPage.getByRole("button", { name: "Book by voice" }).waitFor({ timeout: 20000 });
  const stopSpoken = await stopPage.evaluate(() => window.__spoken);
  expect("saying stop ends the guide", stopSpoken.some((s) => s.startsWith("Stopped.")));
  await stopContext.close();

  /* ---- axe on the booking page with the voice panel ---- */
  const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  for (const mode of ["dark", "light"]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript((m) => localStorage.setItem("pt-mode", m), mode);
    const p = await ctx.newPage();
    await p.goto(`${BASE}/book/electrical/light-fitting`, { waitUntil: "networkidle" });
    await p.addScriptTag({ content: axeSource });
    const result = await p.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ["violations"] });
      return r.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => `${v.id} (${v.nodes.length})`);
    });
    expect(`axe ${mode}: no serious issues`, result.length === 0, result.join(", "));
    await ctx.close();
  }

  await browser.close();
  console.log(failed ? "\nSOME CHECKS FAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
