import { Icon } from "@/components/ui/Icon";
import { STAGED_JOB_EXAMPLE, STAGE_LABEL, type StageState } from "@/data/how-it-works";
import type { IconName } from "@/data/marketplace";

const STATE_ICON: Record<StageState, IconName | null> = {
  approved: "check",
  ready: "eye",
  "in-progress": "clock",
  "not-started": null,
};

/**
 * What a job split into stages will look like, shown with an invented job.
 *
 * It says it is an example in its own caption, because the feature is planned
 * and not built. Each stage's state is written out in words, with an icon
 * beside it: a row of coloured dots would say nothing to someone who cannot
 * tell the colours apart, and nothing at all to a screen reader.
 */
export function StagedJobExample() {
  return (
    <figure className="stage-card">
      <figcaption className="stage-card__caption">
        <span className="stage-card__eyebrow">An example, to show how it will look</span>
        <span className="stage-card__title">{STAGED_JOB_EXAMPLE.title}</span>
      </figcaption>

      <ol className="stage-list">
        {STAGED_JOB_EXAMPLE.stages.map((stage, i) => {
          const icon = STATE_ICON[stage.state];
          return (
            <li className={`stage stage--${stage.state}`} key={stage.name}>
              <span className="stage__num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="stage__name">
                <span className="visually-hidden">Stage {i + 1}: </span>
                {stage.name}
              </span>
              <span className="stage__state">
                {icon && <Icon name={icon} />}
                {STAGE_LABEL[stage.state]}
              </span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
