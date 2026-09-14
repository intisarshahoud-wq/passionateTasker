"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { GREETING, respond, spokenForm, type AssistantReply } from "./engine";
import { setMode, setTextSize } from "@/lib/display-prefs";
import {
  canSpeak,
  getSpeechRecognition,
  speak,
  stopSpeaking,
  type SpeechRecognitionLike,
} from "@/lib/speech";
import { Icon } from "@/components/ui/Icon";

/**
 * The chat assistant.
 *
 * The point of it: a visitor with poor sight should be able to get everything
 * this page offers — what we do, what it costs, whether tradespeople are
 * checked, and a written job post — through one conversation, without hunting
 * for the section that holds the answer. Reading a landing page means scanning;
 * a conversation means asking.
 *
 * Accessibility decisions worth keeping if this is rewritten:
 *
 * - The transcript is a `role="log"` with `aria-live="polite"`, so each reply
 *   is announced as it lands without stealing focus from the typing box.
 * - Focus returns to the launcher on close, and the launcher is a real button
 *   in the tab order — not a floating div.
 * - Read aloud is opt-in and remembered. It is off by default because a screen
 *   reader is already speaking, and two voices at once is worse than none.
 * - Answers are written to be understood when heard: a short lead sentence,
 *   at most three short points, nothing that refers to where something sits
 *   on the screen.
 * - Every suggested reply is a plain labelled button, and the same thing can
 *   always be typed or spoken instead. Nothing here is gesture- or hover-only.
 */

const SPEAK_KEY = "pt-assistant-speak";

interface Message extends AssistantReply {
  id: number;
  role: "user" | "assistant";
}

let nextId = 1;

function readAloudPreference(): boolean {
  try {
    return localStorage.getItem(SPEAK_KEY) === "on";
  } catch {
    /* blocked storage — the toggle still works, it is just not remembered */
    return false;
  }
}

export function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  function close() {
    setIsOpen(false);
    stopSpeaking();
    launcherRef.current?.focus();
  }

  // Escape closes it from anywhere, including from the page behind — which
  // stays fully usable while the panel is open, so someone can be reading a
  // section and typing a question about it at the same time.
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="assistant-launcher"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Icon name="chat" className="assistant-launcher__icon" />
        <span className="assistant-launcher__label">
          {isOpen ? "Hide the assistant" : "Ask for help"}
        </span>
      </button>

      {/*
       * A non-modal dialog on purpose. A modal makes the rest of the page
       * inert, which is exactly wrong here: the people this panel is for want
       * to keep using the site *while* asking about it — scroll the services,
       * fill in the waitlist, follow a link the assistant just gave them —
       * without closing and reopening the conversation each time.
       *
       * Non-modal means no focus trap and no inert background, so the page
       * behind keeps its own keyboard order. The panel is last in the DOM, so
       * tabbing from the page reaches it, and tabbing past it leaves again.
       */}
      {isOpen && (
        <div
          className="assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Passionate Taskers assistant"
        >
          <Conversation onClose={close} />
        </div>
      )}
    </>
  );
}

function Conversation({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { ...GREETING, id: 0, role: "assistant" },
  ]);
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /*
   * Both of these read the browser during the first render, which is safe here
   * and only here: the panel is only mounted once it is opened, so this
   * component never renders on the server and there is nothing to mismatch.
   */
  const [readAloud, setReadAloud] = useState(readAloudPreference);
  const [speechAvailable] = useState(canSpeak);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Stop any speech if the panel unmounts mid-sentence.
  useEffect(() => stopSpeaking, []);

  // Nothing traps focus here, so it has to be placed deliberately: opening the
  // panel puts the caret in the typing box, which is both what a mouse user
  // expects and what tells a screen-reader user the panel is open and ready.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  /** Speak an answer and keep the Stop button's state honest while it runs. */
  function say(text: string) {
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  }

  /**
   * The one control that always means "stop": it cuts the speech off
   * mid-sentence and ends any dictation. Someone who has just heard the wrong
   * answer start playing needs a single obvious way out, not a toggle whose
   * meaning depends on what is currently happening.
   */
  function stopEverything() {
    stopSpeaking();
    setSpeaking(false);
    recognitionRef.current?.stop();
    setListening(false);
    inputRef.current?.focus();
  }

  function toggleReadAloud() {
    const next = !readAloud;
    setReadAloud(next);
    try {
      localStorage.setItem(SPEAK_KEY, next ? "on" : "off");
    } catch {
      /* see above */
    }
    if (next) {
      say("Read aloud is on. I will speak every answer.");
    } else {
      stopSpeaking();
      setSpeaking(false);
    }
  }

  /** Apply the page changes the assistant is allowed to make on request. */
  function runAction(reply: AssistantReply) {
    switch (reply.action) {
      case "text-larger":
        setTextSize("lg");
        break;
      case "text-normal":
        setTextSize("normal");
        break;
      case "light-mode":
        setMode("light");
        break;
      case "dark-mode":
        setMode("dark");
        break;
      default:
        break;
    }
  }

  function send(raw: string) {
    const text = raw.trim();
    if (!text) return;

    // "Stop" is an instruction, not a question — treat it as one wherever it
    // arrives from, typed or spoken. Only a message that is *just* a stop
    // command counts: "stop the leak under my sink" is a job, not a command.
    if (/^(please )?(stop|be quiet|quiet|shut up|cancel)( it| now| please| talking| speaking| listening)?[.!]*$/i.test(text)) {
      stopEverything();
      setValue("");
      return;
    }

    const reply = respond(text);
    runAction(reply);

    setMessages((prev) => [
      ...prev,
      { id: nextId++, role: "user", text, chips: [] },
      { ...reply, id: nextId++, role: "assistant" },
    ]);
    setValue("");
    if (readAloud) say(spokenForm(reply));
    inputRef.current?.focus();
  }

  function toggleVoice() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setNotice(
        "Voice input is not supported in this browser yet. Try Chrome or Edge, or type your message instead."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    setNotice(null);
    // Our own voice would otherwise be picked up as the next question.
    stopSpeaking();
    setSpeaking(false);

    const recognition = new Ctor();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = false;

    let transcript = "";
    recognition.onresult = (event) => {
      transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
    };
    recognition.onerror = () => {
      setNotice("We could not hear that. Check the microphone permission, or type instead.");
      setListening(false);
    };
    // Sending on its own once speech ends means a visitor who cannot see the
    // send button never has to find it.
    recognition.onend = () => {
      setListening(false);
      if (transcript.trim()) send(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="assistant">
      <header className="assistant__head">
        <div>
          <h2 className="assistant__title">Assistant</h2>
          <p className="assistant__sub">
            Ask anything, or describe the job. Speak or type.
          </p>
        </div>

        <div className="assistant__head-actions">
          {speechAvailable && (
            <Button
              className={`assistant__icon-btn${readAloud ? " is-on" : ""}`}
              onPress={toggleReadAloud}
              aria-pressed={readAloud}
              aria-label={readAloud ? "Turn read aloud off" : "Read answers aloud"}
            >
              <Icon name="mic" />
              <span className="assistant__icon-btn-label">
                {readAloud ? "Read aloud on" : "Read aloud"}
              </span>
            </Button>
          )}

          <Button
            className="assistant__icon-btn"
            onPress={onClose}
            aria-label="Close the assistant"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Button>
        </div>
      </header>

      {/* tabIndex makes the transcript itself focusable, so a keyboard-only
          visitor can put focus on it and scroll back through the conversation
          with the arrow keys. A scrollable region that cannot be focused is
          unreachable without a mouse. */}
      <div
        className="assistant__log"
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        tabIndex={0}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onChip={send} />
        ))}
      </div>

      <div className="assistant__status">
        <p className="assistant__notice" role="status">
          {listening
            ? "Listening — say what needs fixing."
            : speaking
              ? "Speaking. Press stop to interrupt."
              : notice}
        </p>

        {/* Always here, always enabled, always in the same place — the control
            you reach for when the assistant is saying the wrong thing should
            never move or need finding. */}
        <Button
          className={`assistant__stop${speaking || listening ? " is-active" : ""}`}
          onPress={stopEverything}
          aria-label="Stop speaking and listening"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          Stop
        </Button>
      </div>

      <form
        className="assistant__form"
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
      >
        <label className="assistant__label" htmlFor={inputId}>
          Your message
        </label>
        <div className="assistant__field">
          <input
            id={inputId}
            ref={inputRef}
            className="assistant__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="My kitchen tap is leaking"
            autoComplete="off"
          />
          <Button
            className={`assistant__mic${listening ? " is-listening" : ""}`}
            onPress={toggleVoice}
            aria-pressed={listening}
            aria-label={listening ? "Stop speaking" : "Say your message instead of typing"}
          >
            <Icon name="mic" />
          </Button>
          <button className="btn btn-primary assistant__send" type="submit">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  onChip,
}: {
  message: Message;
  onChip: (text: string) => void;
}) {
  const mine = message.role === "user";

  return (
    <div className={`assistant__turn${mine ? " assistant__turn--mine" : ""}`}>
      <p className="assistant__who">{mine ? "You said" : "Assistant"}</p>
      <div className="assistant__bubble">
        <p className="assistant__lead">{message.text}</p>

        {message.points && message.points.length > 0 && (
          <ul className="assistant__points">
            {message.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}

        {message.job && (
          <dl className="assistant__job">
            <div>
              <dt>Trade</dt>
              <dd>{message.job.category}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>{message.job.priority}</dd>
            </div>
            <div>
              <dt>Matches nearby</dt>
              <dd>
                {message.job.categoryLive
                  ? `${message.job.matches} verified tradespeople`
                  : "Not in your area yet"}
              </dd>
            </div>
          </dl>
        )}

        {/* Following this leaves the panel open — the page behind scrolls to
            the section, and the conversation is still here afterwards. */}
        {message.link && (
          <a className="assistant__link" href={message.link.href}>
            {message.link.label}
          </a>
        )}
      </div>

      {!mine && message.chips.length > 0 && (
        <ul className="assistant__chips">
          {message.chips.slice(0, 4).map((chip) => (
            <li key={chip}>
              <button type="button" className="assistant__chip" onClick={() => onChip(chip)}>
                {chip}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
