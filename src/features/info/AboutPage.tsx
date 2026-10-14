import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/data/marketplace";
import { SERVICE_CATEGORIES } from "@/data/services";
import { SITE } from "@/lib/site";
import { InfoBlock, InfoPage, StatusNote } from "./InfoPage";

const DIFFERENCES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "mic",
    title: "Say it, do not fill it in",
    body: "Other sites start with a form. We start with a sentence, spoken or typed, and turn it into the job post ourselves.",
  },
  {
    icon: "list",
    title: "Three good matches, not ninety",
    body: "You get a short list to choose from, with the price, the reviews and the checks for each, instead of pages of near-identical profiles.",
  },
  {
    icon: "id",
    title: "Badges that say what was checked",
    body: "“Identity verified” tells you something. “Trusted” does not. Every badge names one check and the date it was done.",
  },
  {
    icon: "eye",
    title: "Built for the people the web forgot",
    body: "Voice, keyboard, screen reader, larger text and high contrast were the starting point, not a later pass.",
  },
];

/*
 * Where things stand, split the way a visitor needs it: what they can do on
 * the site today, and what does not exist yet. Keep both lists honest, and
 * move a line from the second to the first only when it is really live.
 */
const TODAY = [
  "Describe a job by voice or by text and see the job post it becomes.",
  `Browse ${SERVICE_CATEGORIES.length} kinds of job, each with an indicative starting price.`,
  "Try every step of booking, including booking by voice.",
  "Change the text size and the colours, and ask the assistant for help.",
];
const NOT_YET = [
  "No job is sent to anyone, and nobody can be booked.",
  "No tradesperson has joined or been checked. The profiles in booking are samples.",
  "The reviews on the home page are samples, labelled as samples.",
  "Accounts are kept in your own browser only. Nothing is stored by us.",
];

/**
 * About: what this is, why it is being built, and exactly where it stands.
 *
 * It says nothing about a company, a team or an address, because none of that
 * has been decided yet. When it has, it belongs here.
 */
export function AboutPage() {
  return (
    <InfoPage
      crumb="About"
      tag="About"
      title={`About ${SITE.name}`}
      lede={`${SITE.name} is a new UK marketplace for finding a tradesperson or skilled help at home, designed so that people who are blind, have low vision, are older or are less confident online can use every part of it.`}
    >
      <StatusNote>
        <strong>We have not launched.</strong> This site is a working preview of the service.
        The section “Where we are today” says exactly what that means.
      </StatusNote>

      <InfoBlock id="why" title="Why we are building it">
        <div className="info-prose">
          <p>
            Finding someone to fix a tap should not depend on how well you can use a website.
            Today it often does. Posting a job means long forms with fields most people do not
            understand, then scrolling through dozens of profiles that all look the same. And
            almost every site of this kind assumes you can see the screen, type quickly and use
            a mouse.
          </p>
          <p>
            Tradespeople lose out as well. They spend time quoting for jobs that were never
            properly described, and chasing customers for details that a better job post would
            have carried in the first place.
          </p>
          <p className="info-quote">{SITE.positioning}</p>
        </div>
      </InfoBlock>

      <InfoBlock id="different" title="What makes it different">
        <ul className="feature-list">
          {DIFFERENCES.map((item) => (
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

      <InfoBlock id="today" title="Where we are today">
        <div className="two-lists">
          <div>
            <h3>What you can do on this site now</h3>
            <ul className="tick-list tick-list--roomy">
              {TODAY.map((line) => (
                <li key={line}>
                  <Icon name="check" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>What is not real yet</h3>
            <ul className="tick-list tick-list--roomy tick-list--plain">
              {NOT_YET.map((line) => (
                <li key={line}>
                  <Icon name="clock" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </InfoBlock>

      <InfoBlock id="promise" title="What we promise while we build">
        <div className="info-prose">
          <p>
            We only say what is true today. Anything that is a sample is labelled as a sample,
            and anything that is planned is labelled as planned.
          </p>
          <p>
            We will not claim a check, a standard or a protection that is not really in place.
            That applies to the badges on a profile, to the word “accessible”, and to anything
            we ever say about payments.
          </p>
        </div>
      </InfoBlock>

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
            <Link href="/accessibility">Our mission and accessibility</Link>
          </li>
          <li>
            <Link href="/services">All services, with starting prices</Link>
          </li>
        </ul>
      </nav>
    </InfoPage>
  );
}
