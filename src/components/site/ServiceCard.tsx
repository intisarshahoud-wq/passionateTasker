import Image from "next/image";
import type { Project } from "@/lib/marketplace";
import { unsplashUrl } from "@/lib/marketplace";
import { Icon } from "./Icon";

/**
 * Price-anchor card for one bookable job. Deliberately dumb: it takes a
 * `Project` and renders it, so the same component serves the landing page now
 * and category/search pages later once real data exists.
 */
export function ServiceCard({ project }: { project: Project }) {
  return (
    <article className="service-card">
      <div className="service-card__media">
        <Image
          src={unsplashUrl(project.photo, 640, 420)}
          alt={project.photoAlt}
          fill
          sizes="(max-width: 560px) 100vw, (max-width: 1000px) 50vw, 25vw"
          className="service-card__img"
        />
        <span className="service-card__badge" aria-hidden="true">
          <Icon name={project.icon} />
        </span>
      </div>

      <div className="service-card__body">
        <h3 className="service-card__title">
          {/* The whole card is the target, but the link carries the accessible
              name so it is announced as one item, not a pile of loose text. */}
          <a href="#waitlist" className="service-card__link">
            <span className="service-card__stretch" aria-hidden="true" />
            {project.title}
          </a>
        </h3>

        <p className="service-card__blurb">{project.blurb}</p>

        <div className="service-card__foot">
          <span className="service-card__price">
            from <strong>£{project.fromPrice}</strong>
          </span>
          <span className="service-card__duration">
            <Icon name="clock" className="service-card__duration-icon" />
            {project.duration}
          </span>
        </div>
      </div>
    </article>
  );
}
