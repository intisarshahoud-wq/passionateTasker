"use client";

import { useEffect, useId, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/data/marketplace";
import {
  getServerSnapshot,
  getSnapshot,
  restoreDisplayPrefs,
  setContrast,
  setMode,
  setTextSize,
  subscribe,
} from "@/lib/display-prefs";

/**
 * The three display settings: larger text, light mode, high contrast.
 *
 * Each is an on/off button with a fixed name and a pressed state, so a screen
 * reader says "Light mode, toggle button, pressed" and never has to work out
 * what a changing label means. Sighted users get the same fact three ways: a
 * filled button, a darker edge and a tick (or the word On), so the state is
 * never carried by colour alone.
 *
 * Two layouts of the same controls:
 *  - "inline": three short buttons in a row, for the header on wide screens.
 *  - "panel": large rows with a line explaining each one, for the header's
 *    Display panel on narrow screens and for the accessibility page.
 *
 * The settings themselves live in lib/display-prefs, outside React, so any
 * number of these can be on the page and they all stay in step.
 */
export function DisplayControls({ variant = "inline" }: { variant?: "inline" | "panel" }) {
  const { mode, textSize, contrast } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const uid = useId();

  // Adopt whatever the pre-paint script already applied, so the buttons report
  // the settings the visitor is actually looking at.
  useEffect(restoreDisplayPrefs, []);

  const controls: {
    id: string;
    label: string;
    hint: string;
    icon: IconName;
    pressed: boolean;
    toggle: () => void;
  }[] = [
    {
      id: "text",
      label: "Larger text",
      hint: "Makes all the text about a fifth bigger.",
      icon: "text-size",
      pressed: textSize === "lg",
      toggle: () => setTextSize(textSize === "lg" ? "normal" : "lg"),
    },
    {
      id: "mode",
      label: "Light mode",
      hint: "Dark text on a light background.",
      icon: "sun",
      pressed: mode === "light",
      toggle: () => setMode(mode === "light" ? "dark" : "light"),
    },
    {
      id: "contrast",
      label: "High contrast",
      hint: "Black and white, with clearer edges.",
      icon: "contrast",
      pressed: contrast === "high",
      toggle: () => setContrast(contrast === "high" ? "normal" : "high"),
    },
  ];

  if (variant === "panel") {
    return (
      <div className="display-options" role="group" aria-label="Display settings">
        {controls.map((control) => (
          <button
            key={control.id}
            type="button"
            className="display-option"
            aria-pressed={control.pressed}
            // The name is the label alone; the explanation is a description, so
            // a screen reader says the name first and the rest after a pause.
            aria-labelledby={`${uid}-${control.id}-label`}
            aria-describedby={`${uid}-${control.id}-hint`}
            onClick={control.toggle}
          >
            <Icon name={control.icon} className="display-option__icon" />
            <span className="display-option__text">
              <span className="display-option__label" id={`${uid}-${control.id}-label`}>
                {control.label}
              </span>
              <span className="display-option__hint" id={`${uid}-${control.id}-hint`}>
                {control.hint}
              </span>
            </span>
            <span className="display-option__state" aria-hidden="true">
              {control.pressed ? "On" : "Off"}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="a11y-toggles" role="group" aria-label="Display settings">
      {controls.map((control) => (
        <button
          key={control.id}
          type="button"
          className="a11y-btn"
          aria-pressed={control.pressed}
          onClick={control.toggle}
        >
          {control.label}
        </button>
      ))}
    </div>
  );
}
