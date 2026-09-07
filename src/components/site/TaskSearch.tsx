"use client";

import { useMemo, useRef, useState } from "react";
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
import { CATEGORIES, SEARCH_SUGGESTIONS } from "@/lib/marketplace";
import { Icon } from "./Icon";

/**
 * The hero search — the page's single most important control.
 *
 * There is no backend, so submitting does not query anything. Instead it does
 * the thing the product is actually selling: it turns the sentence you typed
 * (or spoke) into a structured job post, in front of you. That demonstrates the
 * differentiator far better than a fake list of tradespeople would.
 *
 * Built on React Aria's ComboBox so the suggestion list gets the full ARIA
 * combobox pattern — announced option counts, arrow-key navigation and correct
 * focus handling — rather than a div that merely looks like one.
 */

const URGENT_WORDS = [
  "burst", "flood", "flooding", "emergency", "urgent", "leak", "leaking",
  "no heating", "no heat", "no hot water", "no power", "sparking", "smell of gas",
  "gas leak", "today", "asap",
];

interface StructuredJob {
  query: string;
  category: string;
  categoryLive: boolean;
  priority: string;
  matches: number;
}

/**
 * Naive keyword match, standing in for the Claude call that will do this
 * properly later. Scores each category on how many of its task words appear in
 * the query, so "my kitchen tap is dripping" lands on Plumbing.
 */
function structureJob(query: string): StructuredJob {
  const q = query.toLowerCase();
  let best = CATEGORIES[0];
  let bestScore = 0;

  for (const category of CATEGORIES) {
    const words = [category.name, ...category.tasks]
      .join(" ")
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 3);

    const score = new Set(words.filter((w) => q.includes(w))).size;
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }

  // Nothing matched a category vocabulary — a handyman triages the rest.
  if (bestScore === 0) {
    best = CATEGORIES.find((c) => c.slug === "handyman") ?? CATEGORIES[0];
  }

  const urgent = URGENT_WORDS.some((w) => q.includes(w));

  return {
    query,
    category: best.name,
    categoryLive: best.availability === "live",
    priority: urgent ? "Same day" : "Within a few days",
    matches: best.availability === "live" ? 3 : 0,
  };
}

/** Minimal shape of the Web Speech API — it is not in the TS DOM lib. */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function TaskSearch() {
  const [value, setValue] = useState("");
  const [job, setJob] = useState<StructuredJob | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
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

  function toggleVoice() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setVoiceError(
        "Voice input is not supported in this browser yet. Try Chrome or Edge, or type the job instead."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    setVoiceError(null);
    const recognition = new Ctor();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
      valueRef.current = transcript;
    };
    recognition.onerror = () => {
      setVoiceError("We could not hear that. Check the microphone permission, or type instead.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

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
              aria-label={listening ? "Stop voice input" : "Describe the job by voice"}
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
        {listening
          ? "Listening — say what needs fixing."
          : "Say it or type it. No forms, no dropdown menus to work through."}
      </p>

      {/* Voice failures are announced, not just shown — the users most likely
          to hit them are the ones least likely to see a small red line. */}
      <p className="task-search__error" role="status">
        {voiceError}
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
              <a className="btn btn-primary" href="#waitlist">
                {job.categoryLive ? "Get matched at launch" : "Tell us to launch this trade"}
              </a>
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
