# Browser checks

Scripts used to verify the site in a real browser. They are tooling, not
product code: the app never imports them. They drive the Chrome installed on this machine through `playwright-core`, so
no browser download is needed.

## Setup (once)

```bash
cd ".claude/tools"
npm install
```

## Running

Most checks expect a production build served on port 3100:

```bash
cd passionate-taskers
npm run build
npx next start -p 3100
```

Then, from `.claude/tools`:

| Command | What it checks |
|---|---|
| `npm run contrast` | Hero text contrast (headline, copper line, lede) against every pixel behind the text, over frames of every hero clip, at 1440 px and 390 px, in both themes. **Re-run whenever a hero clip is added or swapped, or the hero scrim in `hero.css` changes.** Pass levels: 3:1 for the headline lines, 4.5:1 for the lede. |
| `npm run e2e` | Service browser tabs (keyboard), `/services`, category pages, the whole booking flow (errors, focus, refresh, confirmation), phone widths, console errors, and an axe accessibility scan of every screen in both themes. |
| `npm run voice` | Book by voice, end to end, with a scripted microphone and a recording speech synthesiser: hero microphone to completed booking, "stop" ends the guide, axe on the booking page in both themes. Saves what the site said to `voice-booking-transcript.txt`. Set `BASE=http://localhost:3000` to use the dev server. |
| `npm run pages` | The public pages and the display settings: the header fits at 25 widths in normal and larger text, signed in and out; no sideways scrolling and no target under 24px on any page; axe on every page in all four colour settings (dark, light, high contrast, high contrast + light); one h1, no skipped heading levels and a focus ring at every keyboard stop on the information pages; the display settings apply, persist and follow the device's "more contrast" setting; the questions list by keyboard; robots.txt, sitemap.xml, structured data and noindex on booking; the assistant's new answers; nothing moves on hover with reduced motion. **Re-run whenever a header label, a layout step in `header.css` or a page is added or changed.** |
| `npm run playlist` | The hero clips play in order and loop, and a pause is remembered. Expects the dev server on port 3000 (`npm run dev`). |

They print `ALL PASS` / `ALL CHECKS PASSED` / `OK` when everything is fine.

## Notes

- The Chrome path is hard-coded as `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- `hero-contrast-check.js` measures the CSS as shipped. To try alternative
  scrim values without editing the project, put CSS strings into the `d`, `m`
  and `plate` fields of a candidate in its `CANDIDATES` object.
- Screenshots (`*.png`) and the voice transcript are written by the checks on each run and are not committed: the transcript holds whatever name and email the scripted booking used.
