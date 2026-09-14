/**
 * Browser speech helpers — dictation in, spoken replies out.
 *
 * Both APIs are progressive enhancements: everything they support is also
 * reachable by typing and reading, so a browser without them loses convenience,
 * never capability. Neither is in the TypeScript DOM lib, hence the local
 * shapes below.
 */

/** Minimal shape of the Web Speech API's recogniser. */
export interface SpeechRecognitionLike {
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

export function getSpeechRecognition(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Read text aloud, cancelling anything already speaking so replies never
 * overlap or queue up behind an answer the listener has moved on from.
 *
 * A screen reader is already reading the page, so this is only ever used when
 * the visitor has explicitly turned it on — two voices at once is worse than
 * none.
 */
export function speak(text: string, onFinished?: () => void) {
  if (!canSpeak()) {
    onFinished?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  // Slower than the browser default. These answers are being listened to, not
  // skimmed, and a listener cannot re-read a sentence that went past too fast.
  utterance.rate = 0.9;
  // Both fire on a normal finish or a cancel, so the caller's "speaking" state
  // can never be left stuck on.
  utterance.onend = () => onFinished?.();
  utterance.onerror = () => onFinished?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}
