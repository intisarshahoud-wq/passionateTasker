import { SITE } from "@/lib/site";

/**
 * How to reach us, said honestly.
 *
 * Until there is a real inbox, this says there is not one. Printing an address
 * that nobody reads would be worse than printing none: the person writing in is
 * usually someone for whom something has already gone wrong. Set
 * `SITE.contactEmail` and the address appears here, on every page that uses
 * this.
 */
export function ContactRoute({ subject }: { subject: string }) {
  if (SITE.contactEmail) {
    return (
      <p>
        Email{" "}
        <a href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}`}>
          {SITE.contactEmail}
        </a>
        . A person reads every message.
      </p>
    );
  }

  return (
    <p>
      We have not opened yet, so there is no support inbox to write to. A contact address will
      be published on this page before the first job is booked.
    </p>
  );
}
