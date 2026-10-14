import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CHECKS, RECHECK_NOTE } from "@/data/trust";
import { SITE } from "@/lib/site";
import { ContactRoute } from "./ContactRoute";
import { InfoBlock, InfoPage, StatusNote } from "./InfoPage";

/**
 * Trust and safety: what we check, what each badge means, and what we do not
 * claim.
 *
 * The page exists because "verified" on its own tells a customer nothing. Every
 * badge here names one check, and the page is as plain about the limits of a
 * check as it is about the check itself. The checks come from data/trust.ts,
 * the same source as the badges on a profile.
 */
export function TrustPage() {
  return (
    <InfoPage
      crumb="Trust and safety"
      tag="Trust and safety"
      title="How we check tradespeople"
      lede={`Before a tradesperson can take a job through ${SITE.name}, we check who they are, that they are insured, and that they are registered where the law requires it. Every badge on a profile says exactly what was checked, and when.`}
    >
      <StatusNote>
        <strong>We have not opened for bookings yet.</strong> No tradesperson has been through
        these checks so far, and the profiles in the booking preview are samples. This page sets
        out the standard every real profile will have to meet.
      </StatusNote>

      <InfoBlock id="checks" title="What each badge means">
        <ul className="badge-defs">
          {CHECKS.map((check) => (
            <li className="badge-def" key={check.id} id={`check-${check.id}`}>
              <h3 className="badge-def__name">
                <span className="check-badge">
                  <Icon name={check.icon} />
                  {check.badge}
                </span>
              </h3>
              <p className="badge-def__applies">
                <span className="badge-def__applies-label">Who it applies to:</span>{" "}
                {check.appliesTo}
              </p>
              {check.detail.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </li>
          ))}
        </ul>
      </InfoBlock>

      <InfoBlock id="badges" title="A badge says what was checked">
        <div className="info-prose">
          <p>
            You will not see a badge that just says “Trusted”, “Approved” or “Verified”. Those
            words do not tell you what anyone looked at. Each badge names one check, and a
            profile only shows the badges it has earned.
          </p>
          <p>
            A badge is a record of a check. It is not a guarantee of the work itself. For that,
            look at the reviews, which can only come from finished jobs.
          </p>
        </div>
      </InfoBlock>

      <InfoBlock id="rechecks" title="Checks run out, and we check again">
        <div className="info-prose">
          <p>{RECHECK_NOTE}</p>
          <p>
            Insurance and registrations have end dates, and we record them. When one passes, its
            badge comes off the profile until we have seen the renewal. We also keep a record of
            who reviewed each document and when, so a check can always be traced.
          </p>
        </div>
      </InfoBlock>

      <InfoBlock id="reviews" title="Reviews come from real jobs only">
        <div className="info-prose">
          <p>
            A review can only be left after a job booked through {SITE.name} has been marked as
            finished. There is no other way to leave one, so nobody can review a tradesperson
            they did not hire.
          </p>
          <p>
            The reviews on our home page today are samples, and they are labelled as samples,
            because we have no customers yet.
          </p>
        </div>
      </InfoBlock>

      <InfoBlock id="limits" title="What we do not check">
        <div className="info-prose">
          <p>
            We do not test the quality of anyone’s work ourselves. Ratings and reviews from
            finished jobs are there to tell you that.
          </p>
          <p>
            We ask for a basic DBS check, not a standard or enhanced one. The higher levels
            exist, but the law limits them to particular kinds of work, such as teaching and
            care.
          </p>
          <p>
            We do not offer gas or boiler work yet, so no profile carries a Gas Safe badge.
          </p>
        </div>
      </InfoBlock>

      <InfoBlock id="report" title="If something does not look right">
        <div className="info-prose">
          <p>
            If a badge does not match what you find when you look a tradesperson up, or anything
            about a job worries you, we want to know.
          </p>
          <ContactRoute subject="A concern about a tradesperson" />
        </div>
      </InfoBlock>

      <InfoBlock id="for-tradespeople" title="If you are a tradesperson: what you will need">
        <ul className="tick-list tick-list--roomy">
          <li>
            <Icon name="check" />
            Government-issued photo ID, such as a passport or a driving licence.
          </li>
          <li>
            <Icon name="check" />
            Your public liability insurance certificate, showing the insurer, the cover and the
            expiry date.
          </li>
          <li>
            <Icon name="check" />A basic DBS certificate, or the equivalent from Disclosure
            Scotland or AccessNI.
          </li>
          <li>
            <Icon name="check" />
            If you are an electrician doing work that has to be certified: your registration
            with a scheme such as NICEIC or NAPIT.
          </li>
        </ul>
        <div className="info-prose">
          <p>
            Joining is free during early access, with no subscription and no charge per lead.
          </p>
        </div>
        <p className="info-actions">
          <Link className="btn btn-primary" href="/#waitlist">
            Join the tradesperson waiting list
          </Link>
        </p>
      </InfoBlock>

      <nav className="info-next" aria-label="Read next">
        <h2>Read next</h2>
        <ul>
          <li>
            <Link href="/how-it-works">How it works, step by step</Link>
          </li>
          <li>
            <Link href="/how-it-works#problems">What happens if something goes wrong</Link>
          </li>
          <li>
            <Link href="/accessibility">Our mission and accessibility</Link>
          </li>
        </ul>
      </nav>
    </InfoPage>
  );
}
