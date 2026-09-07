"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import {
  DEMO_GOOGLE_ACCOUNTS,
  register,
  signIn,
  signInWithGoogle,
  type Role,
} from "@/lib/auth";
import { GoogleGlyph } from "./GoogleGlyph";

type Mode = "register" | "signin";

/**
 * Account dialog for the demo.
 *
 * Built on React Aria's Modal so focus is trapped, Escape closes, the page
 * behind is inert and the heading is announced — the parts of a dialog that are
 * tedious to get right by hand and obvious to a screen-reader user when they
 * are wrong.
 *
 * The Google path opens our own account chooser. It is labelled as simulated
 * and never asks for a password: a convincing replica of a Google sign-in form
 * is a phishing pattern, demo or not.
 */
export function AuthDialog({
  isOpen,
  onOpenChange,
  initialMode = "register",
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: Mode;
}) {
  return (
    <ModalOverlay
      className="auth-overlay"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
    >
      <Modal className="auth-modal">
        <Dialog className="auth-dialog">
          {({ close }) => <AuthForm initialMode={initialMode} onDone={close} />}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export function AuthForm({
  initialMode = "register",
  onDone,
  compact = false,
}: {
  initialMode?: Mode;
  onDone?: () => void;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showGoogle, setShowGoogle] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result =
      mode === "register"
        ? register({ name, email, password, role })
        : signIn({ email, password });

    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setError(null);
    onDone?.();
  }

  if (showGoogle) {
    return (
      <div className="auth-body">
        <Heading slot="title" className="auth-title">
          Choose an account
        </Heading>
        <p className="auth-sub">
          Simulated Google sign-in. No Google account is contacted and you will never be
          asked for a Google password here — this picks a demo profile so the signed-in
          screens can be tried out.
        </p>

        <ul className="google-accounts">
          {DEMO_GOOGLE_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                className="google-account"
                onClick={() => {
                  signInWithGoogle(account, role);
                  onDone?.();
                }}
              >
                <Image
                  src={account.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="google-account__avatar"
                />
                <span>
                  <span className="google-account__name">{account.name}</span>
                  <span className="google-account__email">{account.email}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="auth-link" onClick={() => setShowGoogle(false)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className={`auth-body${compact ? " is-compact" : ""}`}>
      <Heading slot="title" className="auth-title">
        {mode === "register" ? "Create your account" : "Welcome back"}
      </Heading>
      <p className="auth-sub">
        {mode === "register"
          ? "Early access is free. Tell us who you are and we will match you as soon as we launch in your area."
          : "Sign in to pick up where you left off."}
      </p>

      <div className="role-toggle" role="group" aria-label="I am a" data-active={role}>
        <span className="role-toggle-highlight" aria-hidden="true" />
        <button type="button" aria-pressed={role === "customer"} onClick={() => setRole("customer")}>
          I need a tradesperson
        </button>
        <button type="button" aria-pressed={role === "tasker"} onClick={() => setRole("tasker")}>
          I am a tradesperson
        </button>
      </div>

      <button type="button" className="btn btn-outline google-btn" onClick={() => setShowGoogle(true)}>
        <GoogleGlyph />
        Continue with Google
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {mode === "register" && (
          <div className="field">
            <label htmlFor="authName">Full name</label>
            <input
              id="authName"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jamie Fletcher"
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="authEmail">Email address</label>
          <input
            id="authEmail"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="field">
          <label htmlFor="authPassword">Password</label>
          <input
            id="authPassword"
            name="password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        {/* Announced, not just coloured — the people most likely to mistype are
            the people least likely to spot a small red line. */}
        <p className="auth-error" role="alert">
          {error}
        </p>

        <button className="btn btn-primary auth-submit" type="submit">
          {mode === "register" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="auth-switch">
        {mode === "register" ? "Already have an account?" : "No account yet?"}{" "}
        <button
          type="button"
          className="auth-link"
          onClick={() => {
            setMode(mode === "register" ? "signin" : "register");
            setError(null);
          }}
        >
          {mode === "register" ? "Sign in" : "Create one"}
        </button>
      </p>

      <p className="auth-note">
        Demo only. Your details are saved in this browser and nowhere else — no server, no
        real authentication, and your password is never stored.
      </p>
    </div>
  );
}
