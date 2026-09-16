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
  abort?(): void;
  onresult:
    | ((event: {
        resultIndex?: number;
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
      }) => void)
    | null;
  onerror: ((event?: { error?: string }) => void) | null;
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

/*
 * Promise versions, for spoken conversations: say something, wait until it has
 * been said, then listen for one answer. Both take an AbortSignal so a Stop
 * button can end the conversation at any point, mid-sentence or mid-answer.
 */

/** Speak and resolve once finished (or stopped). */
export function speakAndWait(text: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const onAbort = () => {
      stopSpeaking();
      resolve();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    speak(text, () => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    });
  });
}

/** Why listening produced no words. */
export type ListenProblem = "unsupported" | "blocked" | "no-speech" | "stopped";

export type ListenResult = { text: string } | { problem: ListenProblem };

/**
 * Listen for one spoken answer. `onInterim` receives the words as they are
 * recognised, so the page can show them while the person is still talking.
 */
export function listenOnce(
  options: { signal?: AbortSignal; onInterim?: (text: string) => void } = {}
): Promise<ListenResult> {
  const { signal, onInterim } = options;
  return new Promise((resolve) => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return resolve({ problem: "unsupported" });
    if (signal?.aborted) return resolve({ problem: "stopped" });

    const recognition = new Ctor();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = false;

    let transcript = "";
    let problem: ListenProblem | null = null;

    const onAbort = () => {
      problem = "stopped";
      if (recognition.abort) recognition.abort();
      else recognition.stop();
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      transcript = text;
      onInterim?.(text);
    };
    recognition.onerror = (event) => {
      if (problem) return;
      const code = event?.error;
      problem =
        code === "not-allowed" || code === "service-not-allowed" || code === "audio-capture"
          ? "blocked"
          : code === "aborted"
            ? "stopped"
            : "no-speech";
    };
    recognition.onend = () => {
      signal?.removeEventListener("abort", onAbort);
      const text = transcript.trim();
      if (problem === "stopped" || problem === "blocked") resolve({ problem });
      else if (text) resolve({ text });
      else resolve({ problem: "no-speech" });
    };

    try {
      recognition.start();
    } catch {
      signal?.removeEventListener("abort", onAbort);
      resolve({ problem: "blocked" });
    }
  });
}
