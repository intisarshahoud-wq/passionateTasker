import Link from "next/link";
import { DisplayControls } from "@/components/layout/DisplayControls";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/data/marketplace";
import { SITE } from "@/lib/site";
import { ContactRoute } from "./ContactRoute";
import { InfoBlock, InfoPage } from "./InfoPage";

/** The date this page was last checked against the site. Change it when the page changes. */
const LAST_UPDATED = "30 September 2026";

/*
 * What works today. Every line here has to be true of the site as it stands,
 * and checkable: if a feature is removed or breaks, its line goes too.
 */
const WORKS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "mic",
    title: "Speak instead of typing",
    body: "Describe a job out loud on the home page, or book one by voice from start to finish. The site asks one question at a time, reads your answers back, and only moves on when you say yes.",
  },
  {
    icon: "keyboard",
    title: "Keyboard only",
    body: "Every page and every booking step is built to work without a mouse. Whatever you are on has a clear outline, and “Skip to content” is the first stop on every page.",
  },
  {
    icon: "list",
    title: "Screen readers",
    body: "Pages are built with proper headings, labels and landmarks. Errors, search results and the assistant’s replies are announced as they appear.",
  },
  {
    icon: "eye",
    title: "Larger text, light mode, high contrast",
    body: "In the header of every page, under “Display” on a small screen. Your choices are remembered on this device and applied before the page appears. High contrast also switches on by itself if your device asks for more contrast.",
  },
  {
    icon: "sparkle",
    title: "Less movement",
    body: "If your device asks for reduced motion, animations that move things around are switched off. The home page video is the one exception, and it is listed below.",
  },
  {
    icon: "clock",
    title: "No time limits, no lost answers",
    body: "Booking is four short steps. It never times out, and it keeps your answers if you refresh the page.",
  },
  {
    icon: "chat",
    title: "An assistant you can ask",
    body: "“Ask for help” opens an assistant that answers in short sentences, can read its answers aloud, and can change the text size or the colours for you.",
  },
];

/*
 * What does not work yet. This list is the point of the page: an accessibility
 * statement that only lists successes is an advert. Add to it the moment a gap
 * is found, and take a line out only when the gap is closed and checked.
 */
const LIMITATIONS: { title: string; body: string }[] = [
  {
    title: "No independent audit yet",
    body: "The site has not been audited by an outside accessibility specialist, so we do not claim that it meets any standard.",
  },
  {
    title: "Not yet tested by the people it is built for",
    body: "Blind, low-vision and older testers have not been through the whole site yet. That testing happens before we open for bookings, and what they find will be listed here.",
  },
  {
    title: "Screen reader testing is not finished",
    body: "Pages pass automated checks, but hands-on testing with NVDA, JAWS, VoiceOver and TalkBack is still to be completed. You may meet things that are announced badly or twice.",
  },
  {
    title: "Voice input depends on your browser",
    body: "Speaking to the site works in Chrome and Edge. In browsers that do not support speech recognition, such as Firefox, the microphone buttons say so and you can type instead.",
  },
  {
    title: "The home page video plays by itself",
    body: "The background video on the home page starts automatically, including when your device asks for reduced motion. It is silent, it has a pause button, and once you pause it, it stays paused on later visits.",
  },
  {
    title: "Windows High Contrast is untested",
    body: "Our own high contrast setting has been checked. The site has not yet been tested with Windows contrast themes or other forced-colour modes.",
  },
  {
    title: "Very high zoom is only partly checked",
    body: "Pages are checked for sideways scrolling from phone width upwards. Zooming to 400% has not been checked on every page.",
  },
  {
    title: "English only",
    body: "The site is in English. Other languages, and translation of messages between customers and tradespeople, are planned.",
  },
];

/**
 * Our mission and accessibility: what we are trying to do, what works today,
 * and, in plain sight, what does not.
 *
 * It makes no claim to meet a standard. The rule is simple: say what has been
 * checked and how, list what is known to be wrong, and do not use the word
 * "compliant" until the site has been tested by people who depend on it.
 */
export function AccessibilityPage() {
  return (
    <InfoPage
      crumb="Accessibility"
      tag="Accessibility"
      title="Our mission and accessibility"
      lede={`Accessibility is part of how ${SITE.name} is designed, not a setting hidden at the end. We aim to make it easier for people to find or provide trusted help, whatever their disability, age, language or confidence with technology.`}
    >
      <InfoBlock id="mission" title="Our mission">
        <div className="info-prose">
          <p className="info-quote">{SITE.positioning}</p>
          <p>
            Most sites for finding a tradesperson assume you can see the screen, type quickly
            and use a mouse. Plenty of people cannot, or would rather not. We started from
            them, because a site that works for someone who cannot see it works better for
            everyone else too.
          </p>
        </div>
      </InfoBlock>

      <InfoBlock id="display" title="Change how this site looks">
        <div className="info-prose">
          <p>
            These are the same three settings as in the header. Each one is remembered on this
            device.
          </p>
        </div>
        <DisplayControls variant="panel" />
      </InfoBlock>

      <InfoBlock id="works" title="What works today">
        <ul className="feature-list">
          {WORKS.map((item) => (
            <li className="feature" key={item.title}>
              <span className="feature__icon" aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </InfoBlock>

      <InfoBlock id="standard" title="The standard we are working to">
        <div className="info-prose">
          <p>
            We are building to the Web Content Accessibility Guidelines (WCAG) 2.2, at level AA.
          </p>
          <p>
            We do not claim to meet that standard yet. We will not say the site conforms until it
            has been tested by people who depend on it.
          </p>
        </div>
      </InfoBlock>

      <InfoBlock id="testing" title="How we test">
        <div className="info-prose">
          <p>
            Every page is run through an automated accessibility checker, in dark mode, light
            mode and high contrast. One automated test goes through booking from the first step
            to the last, checking where keyboard focus lands each time; another does the whole
            booking by voice.
          </p>
          <p>
            Automated checks only catch some kinds of problem. That is why the list below
            exists.
          </p>
        </div>
      </InfoBlock>

      <InfoBlock id="limitations" title="Known limitations">
        <ul className="limits">
          {LIMITATIONS.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </InfoBlock>

      <InfoBlock id="contact" title="Tell us about a problem">
        <div className="info-prose">
          <p>
            If something on this site does not work for you, that is a fault in the site, not in
            how you use it, and we want to fix it.
          </p>
          <ContactRoute subject="An accessibility problem" />
        </div>
      </InfoBlock>

      <p className="info-updated">This page was last updated on {LAST_UPDATED}.</p>

      <nav className="info-next" aria-label="Read next">
        <h2>Read next</h2>
        <ul>
          <li>
            <Link href="/how-it-works">How it works, step by step</Link>
          </li>
          <li>
            <Link href="/trust">Trust and safety: what each badge means</Link>
          </li>
          <li>
            <Link href="/about">About {SITE.name}</Link>
          </li>
        </ul>
      </nav>
    </InfoPage>
  );
}
