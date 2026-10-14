import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { STAGE_POINTS } from "@/data/how-it-works";
import { StagedJobExample } from "@/features/info/StagedJobExample";

/**
 * Jobs in stages: what is planned for work too big for one visit.
 *
 * This describes something that is not built and is not part of the first
 * release, so it says "planned" in plain sight, in the heading area, before
 * any of the detail. A visitor must never come away thinking they can use it.
 */
export function MilestonesSection() {
  return (
    <section id="stages">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Bigger jobs</span>
          <h2>Bigger jobs, one stage at a time</h2>
          <p>
            Some jobs are too big for one visit. We are building a way to split them into
            stages you agree up front, so you always know what has been done, what comes next
            and what you are being asked to approve.
          </p>
          <p className="status-tag">
            <Icon name="clock" />
            Planned. Not part of the first release.
          </p>
        </div>

        <div className="stages-band">
          <RevealGroup as="ul" className="point-list" stagger={0.07} amount={0.2}>
            {STAGE_POINTS.map((point) => (
              <RevealItem as="li" className="point" key={point.title}>
                <span className="point__icon" aria-hidden="true">
                  <Icon name={point.icon} />
                </span>
                <span className="point__text">
                  <strong>{point.title}</strong>
                  {point.body}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal>
            <StagedJobExample />
          </Reveal>
        </div>

        <p className="section-more">
          <Link className="text-link" href="/how-it-works#stages">
            More about jobs in stages
          </Link>
        </p>
      </div>
    </section>
  );
}
