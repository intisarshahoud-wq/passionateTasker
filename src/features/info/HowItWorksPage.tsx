import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import {
  CARD_PAYMENT_NOTE,
  JOURNEY,
  PAYMENT_POINTS,
  PROBLEM_STEPS,
  STAGE_POINTS,
} from "@/data/how-it-works";
import { SITE } from "@/lib/site";
import { ContactRoute } from "./ContactRoute";
import { InfoBlock, InfoPage, StatusNote } from "./InfoPage";
import { StagedJobExample } from "./StagedJobExample";

/** The two payment points that are about money; the third belongs further down. */
const PAYING = PAYMENT_POINTS.filter((point) => point.icon !== "alert");

/**
 * How the service works, from describing a job to approving the work, then the
 * two questions that follow straight after: how do I pay, and what if it goes
 * wrong.
 *
 * Everything is written as it will be at the first release, and the part that
 * comes later (jobs in stages, card payments) is labelled as planned each time
 * it is mentioned.
 */
export function HowItWorksPage() {
  return (
    <InfoPage
      crumb="How it works"
      tag="How it works"
      title={`How ${SITE.name} works`}
      lede="Tell us what needs doing, in your own words. We turn it into a clear job post, show you three tradespeople who can do it, and keep everything about the job in one place until it is finished."
    >
      <StatusNote>
        <strong>This is how the service will work when it opens.</strong> Today the site is a
        preview: you can try every step, but nothing is sent and nobody is booked.
      </StatusNote>

      <InfoBlock id="steps" title="Five steps, start to finish">
        <ol className="journey">
          {JOURNEY.map((step, i) => (
            <li className="journey__step" key={step.title}>
              <span className="journey__num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="journey__body">
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
                <ul className="tick-list">
                  {step.points.map((point) => (
                    <li key={point}>
                      <Icon name="check" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <p className="info-actions">
          <Link className="btn btn-primary" href="/#top">
            Describe your job
          </Link>
          <Link className="btn btn-outline" href="/services">
            Or choose from all services
          </Link>
        </p>
      </InfoBlock>

      <InfoBlock id="paying" title="Paying for the work">
        <div className="info-grid info-grid--two">
          {PAYING.map((point) => (
            <article className="info-card" key={point.title}>
              <span className="info-card__icon" aria-hidden="true">
                <Icon name={point.icon} />
              </span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
        <div className="info-prose">
          <h3>Paying by card comes later</h3>
          <p>{CARD_PAYMENT_NOTE}</p>
        </div>
      </InfoBlock>

      <InfoBlock id="stages" title="Bigger jobs, in stages">
        <p className="status-tag">
          <Icon name="clock" />
          Planned. Not part of the first release.
        </p>
        <div className="info-prose">
          <p>
            Some jobs are too big for one visit: decorating several rooms, clearing a whole
            garden. We are building a way to split a job like that into stages you agree up
            front, so you always know what has been done, what comes next and what you are being
            asked to approve.
          </p>
        </div>
        <div className="stages-band">
          <ul className="point-list">
            {STAGE_POINTS.map((point) => (
              <li className="point" key={point.title}>
                <span className="point__icon" aria-hidden="true">
                  <Icon name={point.icon} />
                </span>
                <span className="point__text">
                  <strong>{point.title}</strong>
                  {point.body}
                </span>
              </li>
            ))}
          </ul>
          <StagedJobExample />
        </div>
      </InfoBlock>

      <InfoBlock id="problems" title="If something goes wrong">
        <ol className="journey journey--plain">
          {PROBLEM_STEPS.map((step, i) => (
            <li className="journey__step" key={step.title}>
              <span className="journey__num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="journey__body">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="info-prose">
          <h3>How to reach us</h3>
          <ContactRoute subject="A problem with a job" />

          <h3>In an emergency</h3>
          <p>
            Some emergencies are not jobs for a tradesperson. If you smell gas, leave the
            building and call the National Gas Emergency Service on{" "}
            <a href="tel:0800111999">0800 111 999</a> (in Northern Ireland,{" "}
            <a href="tel:0800002001">0800 002 001</a>). If anyone is in danger, call{" "}
            <a href="tel:999">999</a>.
          </p>
        </div>
      </InfoBlock>

      <InfoBlock id="tradespeople" title="If you are a tradesperson">
        <div className="info-prose">
          <p>
            Every lead reaches you already written up: what the job is, how urgent it is and
            what the customer needs. You can answer by voice while you are still on site, and
            everything about a job stays in one thread.
          </p>
          <p>
            Joining is free during early access, with no subscription and no charge per lead.
            Before you can take a job you will need to pass the checks on our{" "}
            <Link href="/trust#for-tradespeople">trust and safety page</Link>.
          </p>
        </div>
      </InfoBlock>

      <nav className="info-next" aria-label="Read next">
        <h2>Read next</h2>
        <ul>
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
