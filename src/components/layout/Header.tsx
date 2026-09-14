"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { Magnetic } from "@/components/effects/Magnetic";
import { signOut } from "@/features/auth/demo-auth";
import { AuthDialog } from "@/features/auth/AuthDialog";
import { useSession } from "@/features/auth/useSession";
import {
  getServerSnapshot,
  getSnapshot,
  setMode,
  setTextSize,
  subscribe,
  syncFromDom,
} from "@/lib/display-prefs";

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#projects", label: "Popular jobs" },
  { href: "/#how", label: "How it works" },
  { href: "/#trust", label: "Trust and safety" },
  { href: "/#pros", label: "For tradespeople" },
];

/**
 * Sticky site header: brand, primary nav, the two accessibility controls, and
 * the primary CTA.
 *
 * The display preferences live in the external store in lib/display-prefs, so
 * the attributes on <html> stay the single source of truth and the pre-paint
 * script can set them before React ever runs.
 */
export function Header() {
  const { mode, textSize } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "signin">("register");
  const session = useSession();

  function openAuth(mode: "register" | "signin") {
    setAuthMode(mode);
    setAuthOpen(true);
    setMenuOpen(false);
  }
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Adopt whatever the pre-paint script already applied, so the toggles report
  // the theme the visitor is actually looking at.
  useEffect(syncFromDom, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the mobile menu and returns focus to the control that
  // opened it, so keyboard users are never stranded inside a closed panel.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={`site${scrolled ? " scrolled" : ""}`}>
      <div className="site-inner">
        <Link className="logo" href="/">
          <LogoMark />
          Passionate Taskers
        </Link>

        <nav className="primary" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="a11y-toggles" role="group" aria-label="Display preferences">
          <button
            className="a11y-btn"
            type="button"
            aria-pressed={textSize === "lg"}
            aria-label="Larger text"
            onClick={() => setTextSize(textSize === "lg" ? "normal" : "lg")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 18L9 6h1l5 12M5.5 14h8" />
              <path d="M17 18l3-8 3 8M18.5 15.5h3" />
            </svg>
            <span className="a11y-btn__label">Larger text</span>
            <span className="a11y-btn__short" aria-hidden="true">Aa</span>
          </button>
          <button
            className="a11y-btn"
            type="button"
            aria-pressed={mode === "light"}
            aria-label={mode === "light" ? "Dark mode" : "Light mode"}
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" />
            </svg>
            <span className="a11y-btn__label">
              {mode === "light" ? "Dark mode" : "Light mode"}
            </span>
          </button>
        </div>

        {/* Wrapped so the whole control (including Magnetic's own element) can
            be hidden on narrow screens, where the menu takes over. */}
        <span className="header-cta">
          {session ? (
            <span className="account-chip">
              {session.avatar ? (
                <Image
                  src={session.avatar}
                  alt=""
                  width={26}
                  height={26}
                  className="account-chip__avatar"
                />
              ) : (
                <span className="account-chip__initial" aria-hidden="true">
                  {session.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="account-chip__name">{session.name.split(" ")[0]}</span>
              <button type="button" className="account-chip__out" onClick={signOut}>
                Sign out
              </button>
            </span>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-outline btn-sm header-signin"
                onClick={() => openAuth("signin")}
              >
                Sign in
              </button>
              <Magnetic strength={8}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => openAuth("register")}
                >
                  Create account
                </button>
              </Magnetic>
            </>
          )}
        </span>

        <button
          ref={menuButtonRef}
          type="button"
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="mobileMenu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
          <span className="menu-btn__label">{menuOpen ? "Close" : "Menu"}</span>
        </button>
      </div>

      <div className="mobile-menu" id="mobileMenu" hidden={!menuOpen}>
        <nav aria-label="Mobile">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        {session ? (
          <button className="btn btn-outline" type="button" onClick={() => { signOut(); setMenuOpen(false); }}>
            Sign out of {session.name.split(" ")[0]}&apos;s account
          </button>
        ) : (
          <div className="mobile-menu__actions">
            <button className="btn btn-outline" type="button" onClick={() => openAuth("signin")}>
              Sign in
            </button>
            <button className="btn btn-primary" type="button" onClick={() => openAuth("register")}>
              Create account
            </button>
          </div>
        )}
      </div>

      <AuthDialog isOpen={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </header>
  );
}
