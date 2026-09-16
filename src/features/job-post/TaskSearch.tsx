"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components";
import { SEARCH_SUGGESTIONS } from "@/data/marketplace";
import { structureJob, type StructuredJob } from "./structure-job";
import { stopSpeaking } from "@/lib/speech";
import { bookingHref } from "@/data/services";
import { matchService } from "@/features/booking/understand";
import { runVoiceRequest } from "./voice-request";
import { Icon } from "@/components/ui/Icon";

/**
 * The hero search — the page's single most important control.
 *
 * There is no backend, so submitting does not query anything. Instead it does
 * the thing the product is actually selling: it turns the sentence you typed
 * (or spoke) into a structured job post, in front of you. That demonstrates the
 * differentiator far better than a fake list of tradespeople would.
 *
 * Voice is a whole conversation, not just dictation: the microphone asks what
 * is needed, works out the job, reads it back, and on a yes opens the booking
 * with everything already said filled in (see voice-request.ts). It exists for
 * people who cannot see the page well enough to fill in a form.
 *
 * Built on React Aria's ComboBox so the suggestion list gets the full ARIA
 * combobox pattern — announced option counts, arrow-key navigation and correct
 * focus handling — rather than a div that merely looks like one.
 */

export function TaskSearch() {
  const [value, setValue] = useState("");
  const [job, setJob] = useState<StructuredJob | null>(null);
  const [voice, setVoice] = useState<{ status: "speaking" | "listening"; words: string } | null>(null);
  const voiceRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const listening = voice !== null;
  /** Latest input text, readable from the deferred Enter handler below. */
  const valueRef = useRef("");

  function updateValue(next: string) {
    valueRef.current = next;
    setValue(next);
  }

  /**
   * Rank suggestions by shared words rather than substring, because the page
   * explicitly invites a whole sentence ("my kitchen tap has been leaking since
   * this morning") — and a substring match on that returns nothing at all.
   */
  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return SEARCH_SUGGESTIONS.slice(0, 6);

    const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2);

    return SEARCH_SUGGESTIONS.map((s) => {
      const label = s.label.toLowerCase();
      if (label.includes(q)) return { s, score: 100 };
      return { s, score: words.filter((w) => label.includes(w)).length };
    })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((entry) => entry.s);
  }, [value]);

  function submit(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setJob(structureJob(trimmed));
  }

  function stopVoice() {
    voiceRef.current?.abort();
    voiceRef.current = null;
    stopSpeaking();
    setVoice(null);
  }

  // Leaving the page ends the conversation and releases the microphone.
  useEffect(() => () => voiceRef.current?.abort(), []);

  async function startVoice() {
    stopVoice();
    const controller = new AbortController();
    voiceRef.current = controller;

    const outcome = await runVoiceRequest({
      signal: controller.signal,
      onHeard: updateValue,
      onStatus: (status, words) => setVoice({ status, words }),
    });

    if (voiceRef.current !== controller) return;
    voiceRef.current = null;
    setVoice(null);
    if (outcome.href) {
      router.push(outcome.href);
    } else if (outcome.firstSentence) {
      updateValue(outcome.firstSentence);
      submit(outcome.firstSentence);
    }
  }

  function toggleVoice() {
    if (listening) stopVoice();
    else void startVoice();
  }

  /** A direct way into booking when the typed job clearly names one. */
  const bookable = job ? matchService(job.query) : null;

  return (
    <div className="task-search">
      <form
        className="task-search__form"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        role="search"
      >
        <ComboBox
          className="task-search__combo"
          items={filtered}
          inputValue={value}
          onInputChange={updateValue}
          onSelectionChange={(key) => {
            const picked = SEARCH_SUGGESTIONS.find((s) => s.id === key);
            if (picked) {
              updateValue(picked.label);
              submit(picked.label);
            }
          }}
          allowsCustomValue
          menuTrigger="focus"
        >
          <Label className="task-search__label">What do you need help with?</Label>
          <div className="task-search__field">
            <Icon name="list" className="task-search__leading" />
            <Input
              className="task-search__input"
              placeholder="My kitchen tap has been leaking since this morning"
              // React Aria's ComboBox consumes Enter to commit the highlighted
              // option, so the form's own submit never fires. Deferring by a
              // tick lets any selection land first, then submits whatever text
              // ended up in the field — typed sentence or picked suggestion.
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setTimeout(() => submit(valueRef.current), 0);
                }
              }}
            />
            <Button
              className={`task-search__mic${listening ? " is-listening" : ""}`}
              // React Aria buttons inside a ComboBox default to opening the
              // list; this one is a separate action, so it is excluded.
              slot={null}
              onPress={toggleVoice}
              aria-pressed={listening}
              aria-label={listening ? "Stop voice booking" : "Book by voice: say what you need"}
            >
              <Icon name="mic" />
            </Button>
            <button className="btn btn-primary task-search__submit" type="submit">
              <span className="task-search__submit-text">Find help</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
          </div>
          <Popover className="task-search__popover">
            <ListBox className="task-search__list">
              {(item: (typeof SEARCH_SUGGESTIONS)[number]) => (
                <ListBoxItem className="task-search__option" id={item.id} textValue={item.label}>
                  <Icon name="list" className="task-search__option-icon" />
                  {item.label}
                </ListBoxItem>
              )}
            </ListBox>
          </Popover>
        </ComboBox>
      </form>

      <p className="task-search__hint">
        {voice
          ? `${voice.status === "listening" ? "Listening…" : "Speaking:"} ${voice.words}`
          : "Say it or type it. Press the microphone and we fill in the booking for you."}
      </p>

      <AnimatePresence>
        {job && (
          <motion.div
            className="job-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="status"
          >
            <div className="job-preview__head">
              <span className="job-preview__tag">Your job post, written for you</span>
              <button
                type="button"
                className="job-preview__close"
                onClick={() => setJob(null)}
                aria-label="Dismiss job post preview"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <p className="job-preview__quote">&ldquo;{job.query}&rdquo;</p>

            <dl className="job-preview__fields">
              <div>
                <dt>Category</dt>
                <dd>{job.category}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{job.priority}</dd>
              </div>
              <div>
                <dt>Matches nearby</dt>
                <dd>
                  {job.categoryLive
                    ? `${job.matches} verified tradespeople`
                    : "Not in your area yet"}
                </dd>
              </div>
            </dl>

            <div className="job-preview__foot">
              {bookable?.category && bookable.service ? (
                <Link
                  className="btn btn-primary"
                  href={bookingHref(bookable.category.slug, bookable.service.slug)}
                >
                  Book {bookable.service.name.toLowerCase()}
                </Link>
              ) : (
                <a className="btn btn-primary" href="#waitlist">
                  {job.categoryLive ? "Get matched at launch" : "Tell us to launch this trade"}
                </a>
              )}
              <p className="job-preview__note">
                Design preview. Nothing is sent anywhere yet — matching goes live with early access.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
