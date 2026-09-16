"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TASK_SIZES, type ServiceCategory, type SubService } from "@/data/services";
import type { Tasker } from "@/data/taskers";
import { listenOnce, speakAndWait, stopSpeaking } from "@/lib/speech";
import { EMAIL, POSTCODE, SLOTS, type Day, type Draft } from "./draft";
import {
  findChoice,
  findDay,
  findOption,
  findPostcode,
  findSize,
  findSlot,
  isBack,
  isNo,
  isRepeat,
  isSkip,
  isStop,
  isYes,
  spellOut,
  spokenEmail,
  spokenName,
  spokenPhone,
} from "./understand";

/**
 * The booking voice guide: a spoken conversation that fills in the booking
 * form, for people who cannot see it well enough to fill it in themselves.
 *
 * It asks one question at a time, fills in the real form fields as answers
 * come in (so a sighted helper sees exactly the same booking), reads every
 * answer back, and only moves to the next step when the person says yes.
 *
 * How it talks, and why:
 * - One question per turn, short, with the choices said out loud.
 * - Every answer is read back. Postcodes and email addresses are spelt out,
 *   because one wrong letter is the most likely mistake and the hardest to
 *   notice by ear.
 * - "Stop", "go back" and "repeat" work at every question.
 * - After three silences it pauses instead of talking to an empty room.
 * - Nothing is ever confirmed without an explicit yes, and the final summary
 *   says plainly that this is a preview and nothing is sent.
 */

export interface GuideContext {
  draft: Draft;
  done: { reference: string; tasker: Tasker; when: string; estimate: number } | null;
  category: ServiceCategory;
  service: SubService;
  taskers: Tasker[];
  days: Day[];
  set: <K extends keyof Draft>(field: K, value: Draft[K]) => void;
  goTo: (step: number) => void;
  /** The form's Continue button: validates, then moves on or confirms. */
  next: () => void;
}

export type GuideStatus = "off" | "speaking" | "listening";

interface Question {
  key: string;
  prompt: string;
  /** Said instead of the prompt when the same question is asked again. */
  short?: string;
  /** Returns what to say back, or null if the answer was not understood. */
  answer: (heard: string) => string | null;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function list(items: string[], joiner = "or"): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${joiner} ${items[items.length - 1]}`;
}

const spellPostcode = (postcode: string) => spellOut(postcode.replace(/\s+/g, ""));

/** End a spoken sentence without doubling a full stop ("Marek N." + "."). */
const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

/** Decide what to ask next, from the answers the form holds right now. */
function nextQuestion(c: GuideContext, asked: Set<string>): Question {
  const { draft, category, service, taskers, days } = c;
  const size = TASK_SIZES.find((s) => s.id === draft.size);
  const tasker = taskers.find((t) => t.id === draft.taskerId);
  const day = days.find((d) => d.iso === draft.date);
  const slot = SLOTS.find((s) => s.id === draft.slot);

  const setPostcode = (heard: string) => {
    const postcode = findPostcode(heard);
    if (!postcode) return null;
    c.set("postcode", postcode);
    return `Postcode ${spellPostcode(postcode)}.`;
  };
  const setSize = (heard: string) => {
    const found = findSize(heard);
    const option = TASK_SIZES.find((s) => s.id === found);
    if (!option) return null;
    c.set("size", option.id);
    return `${option.label}, ${option.hint.toLowerCase()}.`;
  };
  const setAnswer = (heard: string) => {
    if (!category.question) return null;
    const option = findOption(heard, category.question.options);
    if (!option) return null;
    c.set("answer", option);
    return `${option}.`;
  };
  const setDay = (heard: string) => {
    const found = findDay(heard, days);
    if (!found) return null;
    c.set("date", found.iso);
    return `${found.long}.`;
  };
  const setSlot = (heard: string) => {
    const found = SLOTS.find((s) => s.id === findSlot(heard));
    if (!found) return null;
    c.set("slot", found.id);
    return `${found.label}, ${found.hours}.`;
  };
  const chooseTasker = (heard: string) => {
    let chosen = findChoice(heard, taskers, (t) => t.name);
    if (!chosen && /cheap|lowest|least/i.test(heard)) {
      chosen = [...taskers].sort((a, b) => a.hourlyRate - b.hourlyRate)[0];
    }
    if (!chosen && /best|highest|top/i.test(heard)) {
      chosen = [...taskers].sort((a, b) => b.rating - a.rating)[0];
    }
    if (!chosen) return null;
    c.set("taskerId", chosen.id);
    return sentence(chosen.name);
  };

  /* Step 1: the task */
  if (draft.step === 0) {
    if (!POSTCODE.test(draft.postcode.trim())) {
      return {
        key: "postcode",
        prompt: "What is the postcode where the job is? You can say it one letter at a time.",
        short: "Please say the postcode again, one letter or number at a time.",
        answer: setPostcode,
      };
    }
    if (!size) {
      return {
        key: "size",
        prompt: "How big is the job? Small, about 1 hour. Medium, 2 to 3 hours. Or large, 4 hours or more.",
        short: "Small, medium or large?",
        answer: setSize,
      };
    }
    if (category.question && !draft.answer) {
      return {
        key: "answer",
        prompt: `${category.question.label} ${list(category.question.options)}.`,
        short: `Please say one of: ${list(category.question.options)}.`,
        answer: setAnswer,
      };
    }
    if (!draft.details.trim() && !asked.has("details")) {
      return {
        key: "details",
        prompt: "Is there anything the tasker should know? For example parking, pets or stairs. Or say no.",
        answer: (heard) => {
          asked.add("details");
          if (isSkip(heard) && heard.trim().split(/\s+/).length <= 3) return "No extra details.";
          c.set("details", heard.trim());
          return "Noted.";
        },
      };
    }
    const summary = [
      `${service.name}.`,
      `Postcode ${spellPostcode(draft.postcode.trim())}.`,
      `${size.label} job, ${size.hint.toLowerCase()}.`,
      category.question ? `${category.question.label} ${draft.answer}.` : "",
      draft.details.trim() ? `Details: ${draft.details.trim()}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return {
      key: "confirm-0",
      prompt: `Here is what I have. ${summary} Is that right? Say yes to choose a tasker, or say what to change.`,
      short: "Say yes to choose a tasker, or say what to change: postcode, size or details.",
      answer: (heard) => {
        if (isYes(heard) && !isNo(heard)) {
          c.next();
          return "";
        }
        const changed = setPostcode(heard) ?? setSize(heard) ?? setAnswer(heard);
        if (changed) return `Changed. ${changed}`;
        if (/postcode/i.test(heard)) {
          c.set("postcode", "");
          return "";
        }
        if (/size|big/i.test(heard)) {
          c.set("size", "");
          return "";
        }
        if (/detail|note/i.test(heard)) {
          c.set("details", "");
          asked.delete("details");
          return "";
        }
        return null;
      },
    };
  }

  /* Step 2: the tasker */
  if (draft.step === 1) {
    if (!tasker) {
      const options = taskers
        .map((t, i) => `Option ${i + 1}: ${t.name}, rated ${t.rating.toFixed(1)} from ${t.reviews} reviews, £${t.hourlyRate} an hour.`)
        .join(" ");
      return {
        key: "tasker",
        prompt: `There are ${taskers.length} taskers who do this job. These are sample profiles, not real people yet. ${options} Which one would you like? Say one, two or three.`,
        short: "Say one, two or three. Or say cheapest, or best rated.",
        answer: chooseTasker,
      };
    }
    return {
      key: "confirm-1",
      prompt: `You chose ${sentence(tasker.name).slice(0, -1)}, £${tasker.hourlyRate} an hour. Say yes to pick a day, or say a different option.`,
      short: "Say yes to pick a day, or say one, two or three.",
      answer: (heard) => {
        if (isYes(heard) && !isNo(heard)) {
          c.next();
          return "";
        }
        const changed = chooseTasker(heard);
        return changed ? `Changed to ${changed}` : null;
      },
    };
  }

  /* Step 3: the day and time */
  if (draft.step === 2) {
    if (!day) {
      const last = days[days.length - 1];
      return {
        key: "date",
        prompt: `Which day would you like? Today, tomorrow, or any day up to ${last.long.replace(/^(Today|Tomorrow), /, "")}.`,
        short: "Please say a day, such as tomorrow, or a day of the week.",
        answer: setDay,
      };
    }
    if (!slot) {
      return {
        key: "slot",
        prompt: "What time of day? Morning, 8 till 12. Afternoon, 12 till 5. Or evening, 5 till 8.",
        short: "Morning, afternoon or evening?",
        answer: setSlot,
      };
    }
    return {
      key: "confirm-2",
      prompt: `${day.long}, in the ${slot.label.toLowerCase()}. Say yes to continue, or say a different day or time.`,
      short: "Say yes to continue, or say a different day or time.",
      answer: (heard) => {
        if (isYes(heard) && !isNo(heard)) {
          c.next();
          return "";
        }
        const changed = [setDay(heard), setSlot(heard)].filter(Boolean).join(" ");
        return changed ? `Changed. ${changed}` : null;
      },
    };
  }

  /* Step 4: contact details and confirmation */
  if (!draft.name.trim()) {
    return {
      key: "name",
      prompt: "Nearly done. What is your name?",
      short: "Please say your name.",
      answer: (heard) => {
        const name = spokenName(heard);
        if (!name) return null;
        c.set("name", name);
        return `Thank you, ${name}.`;
      },
    };
  }
  const email = draft.email.trim();
  if (!EMAIL.test(email)) {
    return {
      key: "email",
      prompt: "What is your email address? For example: jo dot smith at gmail dot com.",
      short: "Please say your email address again, with at and dot where they go.",
      answer: (heard) => {
        const said = spokenEmail(heard);
        if (!EMAIL.test(said)) return null;
        c.set("email", said);
        return "";
      },
    };
  }
  if (!asked.has(`email-ok:${email}`)) {
    return {
      key: "email-check",
      prompt: `Your email address is ${spellOut(email)}. Is that right?`,
      short: "Is that email address right? Yes or no.",
      answer: (heard) => {
        if (isNo(heard)) {
          c.set("email", "");
          return "Let's try again.";
        }
        if (isYes(heard)) {
          asked.add(`email-ok:${email}`);
          return "Good.";
        }
        return null;
      },
    };
  }
  if (!draft.phone.trim() && !asked.has("phone")) {
    return {
      key: "phone",
      prompt: "Would you like to give a phone number, so your tasker can call you? Say the number, or say no.",
      answer: (heard) => {
        const digits = spokenPhone(heard);
        if (digits.replace(/\D/g, "").length >= 10) {
          asked.add("phone");
          c.set("phone", digits);
          return `Phone number ${spellOut(digits)}.`;
        }
        if (isSkip(heard)) {
          asked.add("phone");
          return "No phone number.";
        }
        return null;
      },
    };
  }

  const estimate = size && tasker ? Math.round(size.hours * tasker.hourlyRate) : null;
  const summary = [
    `${service.name}, at postcode ${spellPostcode(draft.postcode.trim())}.`,
    tasker ? `Tasker: ${tasker.name}, a sample profile.` : "",
    day && slot ? `${day.long}, in the ${slot.label.toLowerCase()}.` : "",
    estimate !== null ? `Estimated cost: about £${estimate}.` : "",
    `Name: ${draft.name.trim()}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    key: "confirm-3",
    prompt: `Here is your booking request. ${summary} This is a preview: nothing will be sent, and nobody will come. Say confirm to finish, or say what to change.`,
    short: "Say confirm to finish, or say what to change: name, email, phone, tasker, day or postcode.",
    answer: (heard) => {
      if (/\b(confirm|yes|finish|book it|go ahead)\b/i.test(heard) && !isNo(heard)) {
        c.next();
        return "";
      }
      if (/\bname\b/i.test(heard)) {
        c.set("name", "");
        return "";
      }
      if (/\bemail\b/i.test(heard)) {
        c.set("email", "");
        return "";
      }
      if (/\bphone|number\b/i.test(heard)) {
        c.set("phone", "");
        asked.delete("phone");
        return "";
      }
      if (/\btasker\b/i.test(heard)) {
        c.set("taskerId", "");
        c.goTo(1);
        return "";
      }
      if (/\b(day|date|time)\b/i.test(heard)) {
        c.set("date", "");
        c.set("slot", "");
        c.goTo(2);
        return "";
      }
      if (/\b(postcode|size|detail)/i.test(heard)) {
        c.goTo(0);
        return "Going back to the first step.";
      }
      return null;
    },
  };
}

export function useVoiceGuide(context: GuideContext) {
  const [status, setStatus] = useState<GuideStatus>("off");
  const [said, setSaid] = useState("");
  const [heard, setHeard] = useState("");

  // The conversation is a long-running async loop; it reads the latest form
  // state through this ref instead of the values from when it started.
  const contextRef = useRef(context);
  useEffect(() => {
    contextRef.current = context;
  });

  const controllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    stopSpeaking();
    setStatus("off");
  }, []);

  // Never leave the microphone or the voice running after leaving the page.
  useEffect(() => stop, [stop]);

  // Escape stops it from anywhere on the page, without finding the button.
  const active = status !== "off";
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, stop]);

  const start = useCallback(async (intro?: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const { signal } = controller;

    const say = async (text: string) => {
      if (!text || signal.aborted) return;
      setSaid(text);
      setStatus("speaking");
      await speakAndWait(text, signal);
    };

    const asked = new Set<string>();
    let silences = 0;
    let lastKey = "";

    const c0 = contextRef.current;
    await say(
      intro ??
        `Let's book ${c0.service.name} together. I will ask one question at a time and fill in the form for you. Say stop at any time, go back to return to the last step, or repeat to hear a question again.`
    );

    while (!signal.aborted) {
      const c = contextRef.current;

      if (c.done) {
        await say(
          `Your booking request is complete. Your reference is ${spellOut(c.done.reference)}. ${c.done.tasker.name}, ${c.done.when}. Estimated cost about £${c.done.estimate}. Remember, this is a preview: nothing has been sent and nobody will arrive. Join the waiting list and we will tell you when booking opens.`
        );
        break;
      }

      const question = nextQuestion(c, asked);
      await say(question.key === lastKey && question.short ? question.short : question.prompt);
      if (signal.aborted) break;

      setHeard("");
      setStatus("listening");
      const result = await listenOnce({ signal, onInterim: setHeard });
      if (signal.aborted) break;

      if ("problem" in result) {
        if (result.problem === "unsupported") {
          await say("Voice input does not work in this browser. Please try Chrome or Edge, or use the form.");
          break;
        }
        if (result.problem === "blocked") {
          await say("I cannot use the microphone. Please allow microphone access for this site, then press Book by voice again.");
          break;
        }
        if (result.problem === "stopped") break;
        silences += 1;
        if (silences >= 3) {
          await say("I have not heard anything, so I have paused. Your answers are kept. Press Book by voice to carry on.");
          break;
        }
        lastKey = question.key;
        continue;
      }

      silences = 0;
      const text = result.text;
      setHeard(text);

      if (isStop(text)) {
        await say("Stopped. Your answers are kept on this page.");
        break;
      }

      const reply = question.answer(text);
      if (reply !== null) {
        lastKey = "";
        await say(reply);
        // Let the form re-render with the new answer before deciding what next.
        await wait(80);
        continue;
      }

      if (isBack(text) && c.draft.step > 0) {
        c.goTo(c.draft.step - 1);
        lastKey = "";
        await say("Going back.");
        await wait(80);
        continue;
      }

      if (isRepeat(text)) {
        lastKey = "";
        continue;
      }

      await say(`Sorry, I did not understand "${text}".`);
      lastKey = question.key;
    }

    if (controllerRef.current === controller) {
      controllerRef.current = null;
      setStatus("off");
    }
  }, []);

  return { status, said, heard, start, stop };
}
