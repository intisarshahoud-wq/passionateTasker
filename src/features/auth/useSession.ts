"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  syncFromStorage,
} from "./demo-auth";

/**
 * Reads the demo session. The store lives outside React (localStorage is the
 * source of truth), so this subscribes rather than owning the state — which
 * also means every component showing signed-in state updates together.
 */
export function useSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // The server always renders signed-out, so adopt storage after mount.
  useEffect(syncFromStorage, []);

  return session;
}
