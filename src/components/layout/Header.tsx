"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/LogoMark";
import { Magnetic } from "@/components/effects/Magnetic";
import { signOut } from "@/features/auth/demo-auth";
import { AuthDialog } from "@/features/auth/AuthDialog";
import { useSession } from "@/features/auth/useSession";
import { SITE } from "@/lib/site";
import { DisplayControls } from "./DisplayControls";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/trust", label: "Trust and safety" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/#pros", label: "For tradespeople" },
];

/** The two panels that open under the bar on narrower screens. */
type Panel = "menu" | "display" | null;

/**
 * Sticky site header: brand, primary nav, the display settings, and the
 * primary CTA.
 *
 * The display settings (larger text, light mode, high contrast) are shown as
 * three labelled buttons wherever the bar has room for them. Where it does
 * not, one labelled "Display" button opens a panel holding the same three
 * settings at full size. Three unlabelled icons on a phone would be a puzzle
 * for exactly the people the settings exist for.
 *
 * Which layout is used is decided in header.css by the width of the header,
 * measured in ems, so that the larger-text setting moves the breakpoints with
 * it and the bar never overflows.
 */
export function Header() {
  const [panel, setPanel] = useState<Panel>(null);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "signin">("register");
  const session = useSession();
  const pathname = usePathname();

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const displayButtonRef = useRef<HTMLButtonElement>(null);
  const displayPanelRef = useRef<HTMLDivElement>(null);

  function openAuth(mode: "register" | "signin") {
    setAuthMode(mode);
    setAuthOpen(true);
    setPanel(null);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes whichever panel is open and returns focus to the control
  // that opened it, so keyboard users are never stranded inside a closed panel.
  useEffect(() => {
    if (!panel) return;
    const opener = panel === "menu" ? menuButtonRef : displayButtonRef;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(null);
        opener.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  // The display panel sits below the whole bar, after the other buttons in tab
  // order. Moving focus into it on opening means the next thing a keyboard or
  // screen-reader user meets is the setting they asked for.
  useEffect(() => {
    if (panel === "display") {
      displayPanelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }, [panel]);

  const toggle = (which: Exclude<Panel, null>) => setPanel((open) => (open === which ? null : which));

  /**
   * Tells assistive technology, and the stylesheet, where the visitor is:
   * "page" on the link to this very page, "true" on the link to the section it
   * belongs to (Services, while looking at one service). Links to a part of the
   * home page are never marked.
   */
  function currentFor(href: string): "page" | "true" | undefined {
    if (href.includes("#")) return undefined;
    if (pathname === href) return "page";
    return pathname.startsWith(`${href}/`) ? "true" : undefined;
  }

  return (
    <header className={`site${scrolled ? " scrolled" : ""}`}>
      <div className="site-inner">
        <Link className="logo" href="/">
          <LogoMark />
          {SITE.name}
        </Link>

        <nav className="primary" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={currentFor(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Wide screens: the three settings, in the bar. */}
        <div className="display-inline">
          <DisplayControls />
        </div>

        {/* Narrower screens: one labelled button that opens the same settings. */}
        <button
          ref={displayButtonRef}
          type="button"
          className="display-btn"
          aria-expanded={panel === "display"}
          aria-controls="displayPanel"
          aria-label="Display: text size and colours"
          onClick={() => toggle("display")}
        >
          <Icon name="text-size" />
          <span className="display-btn__label">Display</span>
        </button>

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
          aria-expanded={panel === "menu"}
          aria-label={panel === "menu" ? "Close menu" : "Open menu"}
          aria-controls="mobileMenu"
          onClick={() => toggle("menu")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {panel === "menu" ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
          <span className="menu-btn__label">{panel === "menu" ? "Close" : "Menu"}</span>
        </button>
      </div>

      <div
        className="display-panel"
        id="displayPanel"
        ref={displayPanelRef}
        hidden={panel !== "display"}
      >
        <p className="display-panel__title">Text size and colours</p>
        <DisplayControls variant="panel" />
        <p className="display-panel__note">
          Your choices are remembered on this device.{" "}
          <Link href="/accessibility" onClick={() => setPanel(null)}>
            More about accessibility
          </Link>
        </p>
      </div>

      <div className="mobile-menu" id="mobileMenu" hidden={panel !== "menu"}>
        <nav aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={currentFor(item.href)}
              onClick={() => setPanel(null)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {session ? (
          <button className="btn btn-outline" type="button" onClick={() => { signOut(); setPanel(null); }}>
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
