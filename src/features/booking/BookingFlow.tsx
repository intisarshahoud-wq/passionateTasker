"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Label, Radio, RadioGroup } from "react-aria-components";
import { Icon } from "@/components/ui/Icon";
import { Stars } from "@/components/ui/Stars";
import { TASK_SIZES, categoryHref, getService, type TaskSize } from "@/data/services";
import { taskersFor, type Tasker } from "@/data/taskers";
import { useSession } from "@/features/auth/useSession";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/speech";

/**
 * The booking flow: describe the task, choose a tasker, pick a time, confirm.
 *
 * Frontend only. There is no backend yet, so confirming produces a preview
 * reference and says, in plain words, that nothing was sent. The steps and the
 * data they collect are the real ones, so wiring this to an API later means
 * replacing `confirm()` and the sample taskers, not redesigning the screens.
 *
 * Accessibility decisions worth keeping:
 * - One question per screen, with the step number and a visible progress list,
 *   so nobody has to hold a long form in their head.
 * - Moving to a new step puts focus on its heading, so a screen reader announces
 *   where you are and a keyboard user starts at the top.
 * - Errors are collected in a summary at the top that takes focus and links to
 *   each field, and every field repeats its own error beside it.
 * - Choices are big labelled cards (React Aria radio groups): arrow keys move
 *   between them and each one says what it is.
 * - Progress is kept in this tab's session storage, so a refresh, a slip of
 *   the hand or a look at another page does not throw the answers away.
 * - No time limits anywhere.
 */

type SlotId = "morning" | "afternoon" | "evening";

const SLOTS: { id: SlotId; label: string; hours: string }[] = [
  { id: "morning", label: "Morning", hours: "8am to 12pm" },
  { id: "afternoon", label: "Afternoon", hours: "12pm to 5pm" },
  { id: "evening", label: "Evening", hours: "5pm to 8pm" },
];

const STEPS = [
  { title: "Describe your task", short: "Task" },
  { title: "Choose your tasker", short: "Tasker" },
  { title: "Pick a date and time", short: "Time" },
  { title: "Review and confirm", short: "Confirm" },
] as const;

const LAST_STEP = STEPS.length - 1;

interface Draft {
  step: number;
  postcode: string;
  size: TaskSize | "";
  answer: string;
  details: string;
  taskerId: string;
  date: string;
  slot: SlotId | "";
  name: string;
  email: string;
  phone: string;
}

const EMPTY: Draft = {
  step: 0,
  postcode: "",
  size: "",
  answer: "",
  details: "",
  taskerId: "",
  date: "",
  slot: "",
  name: "",
  email: "",
  phone: "",
};

type Field = "postcode" | "size" | "answer" | "taskerId" | "date" | "slot" | "name" | "email";
type Errors = Partial<Record<Field, string>>;

const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Day {
  iso: string;
  label: string;
  long: string;
}

/** Today and the next few days, labelled the way people say them. */
function upcomingDays(count: number): Day[] {
  const short = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const long = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const start = new Date();
  start.setHours(12, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const prefix = i === 0 ? "Today, " : i === 1 ? "Tomorrow, " : "";
    return {
      iso,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : short.format(d),
      long: prefix + long.format(d),
    };
  });
}

const storageKey = (category: string, service: string) => `pt-booking-${category}-${service}`;

/** A short, readable reference for the confirmation screen. */
function newReference(): string {
  return `PT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function loadDraft(key: string): Draft {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    /* blocked or corrupt storage: start fresh */
  }
  return EMPTY;
}

const subscribeToNothing = () => () => {};

/**
 * The flow reads session storage and today's date, neither of which exists on
 * the server. Rendering it only after hydration keeps the server HTML and the
 * first client render identical.
 */
export function BookingFlow({ categorySlug, serviceSlug }: { categorySlug: string; serviceSlug: string }) {
  const mounted = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  if (!mounted) {
    return (
      <p className="booking__loading" role="status">
        Loading the booking form…
      </p>
    );
  }
  return <Flow categorySlug={categorySlug} serviceSlug={serviceSlug} />;
}

interface Confirmation {
  reference: string;
  tasker: Tasker;
  when: string;
  estimate: number;
}

function Flow({ categorySlug, serviceSlug }: { categorySlug: string; serviceSlug: string }) {
  const found = getService(categorySlug, serviceSlug);
  if (!found) throw new Error(`Unknown service ${categorySlug}/${serviceSlug}`);
  const { category, service } = found;

  const key = storageKey(categorySlug, serviceSlug);
  const [draft, setDraft] = useState<Draft>(() => loadDraft(key));
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<Confirmation | null>(null);
  const [days] = useState(() => upcomingDays(7));
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  const session = useSession();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const firstRender = useRef(true);

  const taskers = taskersFor(category, service);
  const size = TASK_SIZES.find((s) => s.id === draft.size);
  const tasker = taskers.find((t) => t.id === draft.taskerId);
  const day = days.find((d) => d.iso === draft.date);
  const slot = SLOTS.find((s) => s.id === draft.slot);
  const estimate = size && tasker ? Math.round(size.hours * tasker.hourlyRate) : null;
  const { step } = draft;

  // Keep the answers for this tab, so a refresh does not lose them.
  useEffect(() => {
    if (done) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(draft));
    } catch {
      /* storage blocked: the flow still works for this visit */
    }
  }, [key, draft, done]);

  // Put focus on the new step's heading, but never steal it on first load.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, done]);

  function set<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [field]: value }));
    setErrors((e) => {
      if (!(field in e)) return e;
      const next = { ...e };
      delete next[field as Field];
      return next;
    });
  }

  function validate(): Errors {
    const e: Errors = {};
    if (step === 0) {
      const postcode = draft.postcode.trim();
      if (!postcode) e.postcode = "Enter the postcode where the job is.";
      else if (!POSTCODE.test(postcode)) e.postcode = "Enter a full UK postcode, like SW1A 1AA.";
      if (!draft.size) e.size = "Choose how big the task is.";
      if (category.question && !draft.answer) e.answer = `Answer: ${category.question.label}`;
    }
    if (step === 1 && !tasker) e.taskerId = "Choose a tasker to continue.";
    if (step === 2) {
      if (!day) e.date = "Choose a day.";
      if (!slot) e.slot = "Choose a time of day.";
    }
    if (step === LAST_STEP) {
      if (!draft.name.trim()) e.name = "Enter your name.";
      const email = draft.email.trim();
      if (!email) e.email = "Enter your email address.";
      else if (!EMAIL.test(email)) e.email = "Enter an email address like name@example.com.";
    }
    return e;
  }

  function goTo(nextStep: number) {
    setErrors({});
    setDraft((d) => ({ ...d, step: nextStep }));
  }

  function confirm() {
    if (!tasker || !day || !slot || estimate === null) return;
    setDone({
      reference: newReference(),
      tasker,
      when: `${day.long}, ${slot.label.toLowerCase()} (${slot.hours})`,
      estimate,
    });
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* nothing to clear */
    }
  }

  function handleContinue() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // After the summary renders, move focus to it so the problem is announced.
      window.setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    if (step === LAST_STEP) {
      confirm();
      return;
    }
    if (step === 2 && session) {
      // Signed in: save retyping what we already know.
      setDraft((d) => ({
        ...d,
        name: d.name || session.name,
        email: d.email || session.email,
      }));
    }
    goTo(step + 1);
  }

  function toggleVoice() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setVoiceNote("Voice input is not supported in this browser. Try Chrome or Edge, or type instead.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const before = draft.details.trim();
    const recognition = new Ctor();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      set("details", before ? `${before} ${transcript}` : transcript);
    };
    recognition.onerror = () => {
      setVoiceNote("We could not hear that. Check the microphone permission, or type instead.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setVoiceNote(null);
    recognition.start();
    setListening(true);
  }

  const describedBy = (field: Field, hint?: boolean) =>
    [hint ? fid(`${field}-hint`) : null, errors[field] ? fid(`${field}-error`) : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const fieldError = (field: Field) =>
    errors[field] ? (
      <p id={fid(`${field}-error`)} className="field__error">
        <span className="visually-hidden">Error: </span>
        {errors[field]}
      </p>
    ) : null;

  if (done) {
    return (
      <div className="booking-done">
        <span className="booking-done__icon" aria-hidden="true">
          <Icon name="check" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="booking__title">
          Booking request complete
        </h2>
        <p className="booking-done__preview">
          <strong>This is a preview.</strong> We have not launched yet, so nothing has been sent,
          nobody has been booked, and nobody will arrive. Join the waiting list and we will tell
          you the moment booking opens in your area.
        </p>

        <dl className="booking-done__facts">
          <div>
            <dt>Reference</dt>
            <dd>{done.reference}</dd>
          </div>
          <div>
            <dt>Job</dt>
            <dd>{service.name}</dd>
          </div>
          <div>
            <dt>Tasker</dt>
            <dd>{done.tasker.name} (sample profile)</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>{done.when}</dd>
          </div>
          <div>
            <dt>Estimated cost</dt>
            <dd>About £{done.estimate}</dd>
          </div>
        </dl>

        <h3 className="booking-done__next-title">What will happen once we launch</h3>
        <ol className="booking-done__next">
          <li>Your tasker confirms the booking, usually within the hour.</li>
          <li>You agree the details in one message thread, by voice or by text.</li>
          <li>The work is done, and you confirm it before any payment is released.</li>
        </ol>

        <div className="booking__nav">
          <Link className="btn btn-primary" href="/#waitlist">
            Join the waiting list
          </Link>
          <Link className="btn btn-outline" href="/services">
            Look at another service
          </Link>
        </div>
      </div>
    );
  }

  const errorList = Object.entries(errors) as [Field, string][];

  return (
    <div className="booking">
      <ol className="booking__progress" aria-label="Booking steps">
        {STEPS.map((s, i) => (
          <li
            key={s.short}
            className={i < step ? "is-done" : i === step ? "is-current" : undefined}
            aria-current={i === step ? "step" : undefined}
          >
            <span className="booking__progress-num" aria-hidden="true">
              {i < step ? <Icon name="check" /> : i + 1}
            </span>
            <span className="booking__progress-label">
              {s.short}
              <span className="visually-hidden">
                {i < step ? ", done" : i === step ? ", current step" : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="booking__layout">
        <form
          className="booking__main"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          <p className="booking__count">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="booking__title">
            {STEPS[step].title}
          </h2>

          {errorList.length > 0 && (
            <div ref={errorRef} tabIndex={-1} className="booking__errors" aria-labelledby={fid("errors")}>
              <h3 id={fid("errors")}>
                {errorList.length === 1 ? "Please fix this to continue" : "Please fix these to continue"}
              </h3>
              <ul>
                {errorList.map(([field, message]) => (
                  <li key={field}>
                    <a href={`#${fid(field)}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 0 && (
            <>
              <div className="field">
                <label className="field__label" htmlFor={fid("postcode")}>
                  Postcode where the job is
                </label>
                <p className="field__hint" id={fid("postcode-hint")}>
                  So we only show tradespeople who cover your area.
                </p>
                {fieldError("postcode")}
                <div className="field__with-icon">
                  <Icon name="pin" className="field__icon" />
                  <input
                    id={fid("postcode")}
                    className="field__input field__input--short"
                    value={draft.postcode}
                    onChange={(e) => set("postcode", e.target.value.toUpperCase())}
                    autoComplete="postal-code"
                    spellCheck={false}
                    aria-invalid={!!errors.postcode}
                    aria-describedby={describedBy("postcode", true)}
                  />
                </div>
              </div>

              <RadioGroup
                id={fid("size")}
                className="field"
                value={draft.size || null}
                onChange={(value) => set("size", value as TaskSize)}
                isInvalid={!!errors.size}
                aria-describedby={describedBy("size")}
              >
                <Label className="field__label">How big is the task?</Label>
                {fieldError("size")}
                <div className="choice-grid">
                  {TASK_SIZES.map((option) => (
                    <Radio key={option.id} value={option.id} className="choice">
                      <span className="choice__title">{option.label}</span>
                      <span className="choice__hint">{option.hint}</span>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>

              {category.question && (
                <RadioGroup
                  id={fid("answer")}
                  className="field"
                  value={draft.answer || null}
                  onChange={(value) => set("answer", value)}
                  isInvalid={!!errors.answer}
                  aria-describedby={describedBy("answer")}
                >
                  <Label className="field__label">{category.question.label}</Label>
                  {fieldError("answer")}
                  <div className="choice-grid">
                    {category.question.options.map((option) => (
                      <Radio key={option} value={option} className="choice">
                        <span className="choice__title">{option}</span>
                      </Radio>
                    ))}
                  </div>
                </RadioGroup>
              )}

              <div className="field">
                <label className="field__label" htmlFor={fid("details")}>
                  Anything the tasker should know? <span className="field__optional">(optional)</span>
                </label>
                <p className="field__hint" id={fid("details-hint")}>
                  What needs doing, plus anything useful before they arrive: parking, pets, stairs,
                  access. You can speak instead of typing.
                </p>
                <textarea
                  id={fid("details")}
                  className="field__input field__textarea"
                  rows={4}
                  value={draft.details}
                  onChange={(e) => set("details", e.target.value)}
                  aria-describedby={fid("details-hint")}
                />
                <div className="field__voice">
                  <button
                    type="button"
                    className={`booking__mic${listening ? " is-listening" : ""}`}
                    onClick={toggleVoice}
                    aria-pressed={listening}
                  >
                    <Icon name="mic" />
                    {listening ? "Stop listening" : "Speak instead"}
                  </button>
                  <p className="field__hint" role="status">
                    {listening ? "Listening — describe the job." : voiceNote}
                  </p>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="booking__lede">
                Three checked tradespeople near <strong>{draft.postcode.trim()}</strong> who do this
                job. <strong>These are sample profiles:</strong> we have not launched, so they are
                illustrations of what you will see, not real people.
              </p>
              <RadioGroup
                id={fid("taskerId")}
                className="field"
                value={draft.taskerId || null}
                onChange={(value) => set("taskerId", value)}
                isInvalid={!!errors.taskerId}
                aria-label="Choose your tasker"
                aria-describedby={describedBy("taskerId")}
              >
                {fieldError("taskerId")}
                <div className="tasker-list">
                  {taskers.map((t) => (
                    <Radio
                      key={t.id}
                      value={t.id}
                      className="tasker"
                      aria-label={`${t.name}, rated ${t.rating} out of 5 from ${t.reviews} reviews, £${t.hourlyRate} an hour, sample profile`}
                    >
                      {({ isSelected }) => (
                        <>
                          <span className="tasker__avatar" aria-hidden="true">
                            {t.initials}
                          </span>
                          <span className="tasker__body">
                            <span className="tasker__top">
                              <span className="tasker__name">{t.name}</span>
                              <span className="tasker__sample">Sample profile</span>
                              <span className="tasker__rate">
                                £{t.hourlyRate}
                                <span> an hour</span>
                              </span>
                            </span>
                            <span className="tasker__rating">
                              <Stars rating={Math.round(t.rating)} />
                              {t.rating.toFixed(1)} · {t.reviews} reviews
                            </span>
                            <span className="tasker__meta">
                              {t.jobsDone} {category.name.toLowerCase()} jobs · {t.responseTime}
                            </span>
                            <span className="tasker__bio">{t.bio}</span>
                            <span className="tasker__badges">
                              {t.badges.map((badge) => (
                                <span className="tasker__badge" key={badge}>
                                  <Icon name="check" />
                                  {badge}
                                </span>
                              ))}
                            </span>
                          </span>
                          <span className="tasker__select" aria-hidden="true">
                            {isSelected ? "Selected" : "Select"}
                          </span>
                        </>
                      )}
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
            </>
          )}

          {step === 2 && (
            <>
              <RadioGroup
                id={fid("date")}
                className="field"
                value={day ? day.iso : null}
                onChange={(value) => set("date", value)}
                isInvalid={!!errors.date}
                aria-describedby={describedBy("date")}
              >
                <Label className="field__label">Which day?</Label>
                {fieldError("date")}
                <div className="choice-grid choice-grid--days">
                  {days.map((d) => (
                    <Radio key={d.iso} value={d.iso} className="choice choice--compact" aria-label={d.long}>
                      <span className="choice__title">{d.label}</span>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>

              <RadioGroup
                id={fid("slot")}
                className="field"
                value={draft.slot || null}
                onChange={(value) => set("slot", value as SlotId)}
                isInvalid={!!errors.slot}
                aria-describedby={describedBy("slot")}
              >
                <Label className="field__label">What time of day?</Label>
                {fieldError("slot")}
                <div className="choice-grid">
                  {SLOTS.map((s) => (
                    <Radio key={s.id} value={s.id} className="choice">
                      <span className="choice__title">{s.label}</span>
                      <span className="choice__hint">{s.hours}</span>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
              <p className="field__hint">
                Your tasker confirms the exact time with you. Nothing is fixed until they do.
              </p>
            </>
          )}

          {step === LAST_STEP && (
            <>
              <dl className="review">
                {[
                  { label: "Job", value: service.name, step: 0 },
                  { label: "Postcode", value: draft.postcode.trim(), step: 0 },
                  { label: "Size", value: size ? `${size.label}: ${size.hint.toLowerCase()}` : "", step: 0 },
                  ...(category.question
                    ? [{ label: category.question.label, value: draft.answer, step: 0 }]
                    : []),
                  { label: "Details", value: draft.details.trim() || "None added", step: 0 },
                  { label: "Tasker", value: tasker ? `${tasker.name} (sample profile)` : "", step: 1 },
                  { label: "When", value: day && slot ? `${day.long}, ${slot.label.toLowerCase()}` : "", step: 2 },
                ].map((row) => (
                  <div className="review__row" key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                    <dd className="review__change">
                      <button type="button" className="link-btn" onClick={() => goTo(row.step)}>
                        Change<span className="visually-hidden"> {row.label.toLowerCase()}</span>
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>

              {estimate !== null && size && tasker && (
                <div className="estimate">
                  <p className="estimate__total">
                    Estimated cost: <strong>about £{estimate}</strong>
                  </p>
                  <p className="estimate__detail">
                    {size.hint} at £{tasker.hourlyRate} an hour. Your tasker confirms the final
                    price with you before starting, and there is no booking fee during early access.
                  </p>
                </div>
              )}

              <h3 className="booking__subtitle">Your contact details</h3>
              <div className="field">
                <label className="field__label" htmlFor={fid("name")}>
                  Your name
                </label>
                {fieldError("name")}
                <input
                  id={fid("name")}
                  className="field__input"
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={describedBy("name")}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor={fid("email")}>
                  Email address
                </label>
                <p className="field__hint" id={fid("email-hint")}>
                  For your booking confirmation. We never share it.
                </p>
                {fieldError("email")}
                <input
                  id={fid("email")}
                  className="field__input"
                  type="email"
                  value={draft.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  spellCheck={false}
                  aria-invalid={!!errors.email}
                  aria-describedby={describedBy("email", true)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor={fid("phone")}>
                  Phone number <span className="field__optional">(optional)</span>
                </label>
                <p className="field__hint" id={fid("phone-hint")}>
                  Only if you would like your tasker to be able to call you.
                </p>
                <input
                  id={fid("phone")}
                  className="field__input field__input--short"
                  type="tel"
                  value={draft.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                  aria-describedby={fid("phone-hint")}
                />
              </div>
            </>
          )}

          <div className="booking__nav">
            {step > 0 ? (
              <button type="button" className="btn btn-outline" onClick={() => goTo(step - 1)}>
                Back
              </button>
            ) : (
              <Link className="btn btn-outline" href={categoryHref(category.slug)}>
                Back to {category.name}
              </Link>
            )}
            <button type="submit" className="btn btn-primary">
              {step === LAST_STEP ? "Confirm booking request" : "Continue"}
            </button>
          </div>
        </form>

        <aside className="booking__summary" aria-labelledby={fid("summary")}>
          <h2 id={fid("summary")} className="booking__summary-title">
            Your booking
          </h2>
          <dl>
            <div>
              <dt>Job</dt>
              <dd>{service.name}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{draft.postcode.trim() || "Not yet chosen"}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{size ? size.hint : "Not yet chosen"}</dd>
            </div>
            <div>
              <dt>Tasker</dt>
              <dd>{tasker ? tasker.name : "Not yet chosen"}</dd>
            </div>
            <div>
              <dt>When</dt>
              <dd>{day && slot ? `${day.label}, ${slot.label.toLowerCase()}` : "Not yet chosen"}</dd>
            </div>
            <div>
              <dt>Estimate</dt>
              <dd>{estimate !== null ? `About £${estimate}` : `From £${service.fromPrice} an hour`}</dd>
            </div>
          </dl>
          <p className="booking__summary-note">
            Preview only. Nothing is sent or charged until booking opens.
          </p>
        </aside>
      </div>
    </div>
  );
}
