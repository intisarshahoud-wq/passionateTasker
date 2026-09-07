/**
 * Demo-only account store.
 *
 * THIS IS NOT AUTHENTICATION. There is no server, no password verification and
 * no token of any kind — the "session" is a plain object in localStorage that
 * anyone can read or edit from their own dev tools. It exists so the signed-in
 * parts of the interface can be designed and reviewed before the real backend
 * decision is made.
 *
 * Passwords are deliberately never stored, not even hashed: a password sitting
 * in localStorage is a liability with no upside, and people reuse passwords
 * across sites even on ones they know are demos.
 *
 * When this is replaced with real auth (Clerk / NextAuth / Supabase), the
 * component API below — `useSession()`, `register()`, `signIn()`, `signOut()` —
 * is the seam to keep. Everything above it can stay as it is.
 */

export type Role = "customer" | "tasker";
export type Provider = "password" | "google";

export interface Session {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: Provider;
  /** Optional avatar URL, only set for the simulated Google accounts. */
  avatar?: string;
  createdAt: string;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: Provider;
  avatar?: string;
  createdAt: string;
}

const SESSION_KEY = "pt-session";
const ACCOUNTS_KEY = "pt-accounts";

let snapshot: Session | null = null;
let listeners: (() => void)[] = [];

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getSnapshot(): Session | null {
  return snapshot;
}

/**
 * The server has no idea who anyone is, so it always renders the signed-out
 * state. `syncFromStorage` corrects that after mount.
 */
export function getServerSnapshot(): Session | null {
  return null;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full storage — the session just will not persist */
  }
}

export function syncFromStorage() {
  const stored = readJson<Session | null>(SESSION_KEY, null);
  if (stored?.email === snapshot?.email) return;
  snapshot = stored;
  emit();
}

function setSession(session: Session | null) {
  snapshot = session;
  if (session) writeJson(SESSION_KEY, session);
  else {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  }
  emit();
}

function getAccounts(): StoredAccount[] {
  return readJson<StoredAccount[]>(ACCOUNTS_KEY, []);
}

function saveAccount(account: StoredAccount) {
  const accounts = getAccounts().filter(
    (a) => a.email.toLowerCase() !== account.email.toLowerCase()
  );
  accounts.push(account);
  writeJson(ACCOUNTS_KEY, accounts);
}

export function findAccount(email: string): StoredAccount | undefined {
  return getAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

function newId() {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): AuthResult {
  const name = input.name.trim();
  const email = input.email.trim();

  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "That does not look like an email address." };
  if (input.password.length < 8)
    return { ok: false, error: "Please use at least 8 characters for the password." };
  if (findAccount(email))
    return { ok: false, error: "There is already an account with that email on this device." };

  const account: StoredAccount = {
    id: newId(),
    name,
    email,
    role: input.role,
    provider: "password",
    createdAt: new Date().toISOString(),
  };
  saveAccount(account);
  setSession(account);
  return { ok: true };
}

/**
 * Demo sign-in. The password is checked for length only — there is nothing to
 * check it against, because no password was ever stored. Said plainly in the
 * dialog so nobody mistakes this for a real login.
 */
export function signIn(input: { email: string; password: string }): AuthResult {
  const account = findAccount(input.email);
  if (!account)
    return {
      ok: false,
      error: "No account with that email on this device. Create one first.",
    };
  if (input.password.length < 8)
    return { ok: false, error: "Please enter the password you used to sign up." };

  setSession(account);
  return { ok: true };
}

/** The accounts offered by the simulated Google chooser. */
export const DEMO_GOOGLE_ACCOUNTS = [
  {
    name: "Alex Whitfield",
    email: "alex.whitfield@gmail.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&q=70&auto=format&fit=crop",
  },
  {
    name: "Nadia Rahman",
    email: "nadia.rahman@gmail.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&q=70&auto=format&fit=crop",
  },
];

/**
 * Stands in for Google Sign-In.
 *
 * No Google API is contacted and no real Google account is involved — the
 * chooser is our own UI, clearly labelled, and never asks for a password.
 * Replace with Google Identity Services once there is a client id and a
 * backend to verify the returned credential.
 */
export function signInWithGoogle(account: (typeof DEMO_GOOGLE_ACCOUNTS)[number], role: Role): AuthResult {
  const existing = findAccount(account.email);
  const record: StoredAccount = existing ?? {
    id: newId(),
    name: account.name,
    email: account.email,
    role,
    provider: "google",
    avatar: account.avatar,
    createdAt: new Date().toISOString(),
  };
  saveAccount(record);
  setSession(record);
  return { ok: true };
}

export function signOut() {
  setSession(null);
}
