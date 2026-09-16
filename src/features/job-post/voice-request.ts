/**
 * The hero's spoken conversation: from "I need an electrician, my sockets keep
 * tripping" to a booking that is already filled in.
 *
 * It works out which job is meant, asks only when it cannot tell, picks out
 * anything else that was said (postcode, day, time, size), reads it all back,
 * and starts the booking only after a yes. The booking page's voice guide then
 * carries on the same conversation for whatever is still missing.
 */

import { SERVICE_CATEGORIES, bookingHref, type ServiceCategory, type SubService } from "@/data/services";
import { DAYS_AHEAD, SLOTS, VOICE_FLAG, prefillBooking, upcomingDays } from "@/features/booking/draft";
import { isNo, isYes, matchService, spellOut, understandRequest } from "@/features/booking/understand";
import { listenOnce, speakAndWait, type ListenResult } from "@/lib/speech";

export interface VoiceRequestHooks {
  signal: AbortSignal;
  /** Words as they are recognised, to show in the search field. */
  onHeard: (text: string) => void;
  onStatus: (status: "speaking" | "listening", words: string) => void;
}

/** The booking page to open, or null if the conversation ended without one. */
export type VoiceRequestOutcome = { href: string; firstSentence: string } | { href: null; firstSentence: string | null };

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
}

export async function runVoiceRequest(hooks: VoiceRequestHooks): Promise<VoiceRequestOutcome> {
  const { signal, onHeard, onStatus } = hooks;

  const say = async (text: string) => {
    if (signal.aborted) return;
    onStatus("speaking", text);
    await speakAndWait(text, signal);
  };

  /** Listen once; say why if nothing usable came back. */
  const hear = async (): Promise<string | null> => {
    if (signal.aborted) return null;
    onStatus("listening", "");
    const result: ListenResult = await listenOnce({ signal, onInterim: onHeard });
    if ("text" in result) {
      onHeard(result.text);
      return result.text;
    }
    if (result.problem === "unsupported") {
      await say("Voice input does not work in this browser. Please try Chrome or Edge, or type the job instead.");
    } else if (result.problem === "blocked") {
      await say("I cannot use the microphone. Please allow microphone access for this site, or type the job instead.");
    } else if (result.problem === "no-speech") {
      await say("I did not hear anything. Press the microphone button to try again.");
    }
    return null;
  };

  await say("What do you need help with? Tell me in your own words.");
  const first = await hear();
  if (!first) return { href: null, firstSentence: null };

  const days = upcomingDays(DAYS_AHEAD);
  const request = understandRequest(first, days);
  let category: ServiceCategory | null = request.category;
  let service: SubService | null = request.service;

  // Not sure which kind of help: offer the categories.
  for (let attempt = 0; !category && attempt < 2; attempt++) {
    await say(
      `Sorry, I could not tell which service you need. We offer ${list(SERVICE_CATEGORIES.map((c) => c.name))}. Which one?`
    );
    const answer = await hear();
    if (!answer) return { href: null, firstSentence: first };
    ({ category, service } = matchService(answer));
  }
  if (!category) {
    await say("I still could not tell, sorry. Your words are in the search box, or you can browse all services.");
    return { href: null, firstSentence: first };
  }

  // Sure of the kind of help, not the job: offer that category's jobs.
  for (let attempt = 0; !service && attempt < 2; attempt++) {
    await say(
      `Which ${category.name.toLowerCase()} job is it? ${list(category.services.map((s) => s.name))}?`
    );
    const answer = await hear();
    if (!answer) return { href: null, firstSentence: first };
    service = matchService(answer, category).service;
  }
  if (!service) {
    await say(`I could not tell which job, sorry. You can choose one on the ${category.name} page.`);
    return { href: null, firstSentence: first };
  }

  // Read back everything understood, then ask before going anywhere.
  const { answers } = request;
  const day = days.find((d) => d.iso === answers.date);
  const slot = SLOTS.find((s) => s.id === answers.slot);
  const known = [
    answers.postcode ? `postcode ${spellOut(answers.postcode.replace(/\s+/g, ""))}` : "",
    day ? day.long : "",
    slot ? `in the ${slot.label.toLowerCase()}` : "",
  ].filter(Boolean);

  await say(
    `You need ${service.name}, from the ${category.name} service. Prices start from £${service.fromPrice} an hour.` +
      (known.length ? ` I also noted: ${known.join(", ")}.` : "") +
      " Shall I start the booking? I will fill in what you told me and ask for the rest. Say yes or no."
  );

  for (let attempt = 0; attempt < 2; attempt++) {
    const answer = await hear();
    if (!answer) return { href: null, firstSentence: first };
    if (isYes(answer) && !isNo(answer)) {
      // Only answers that belong to this category's form are handed over.
      const handover = { ...answers };
      if (handover.answer && !category.question?.options.includes(handover.answer)) delete handover.answer;
      prefillBooking(category.slug, service.slug, handover);
      await say("Opening the booking.");
      return { href: `${bookingHref(category.slug, service.slug)}?${VOICE_FLAG}`, firstSentence: first };
    }
    if (isNo(answer)) {
      await say("No problem. Nothing has been booked. Your words are still in the search box.");
      return { href: null, firstSentence: first };
    }
    await say("Please say yes to start the booking, or no.");
  }
  return { href: null, firstSentence: first };
}
