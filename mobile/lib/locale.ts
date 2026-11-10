// Lightweight reactive locale store ("en" | "vi") shared by AppText, AppStore,
// and UI components so English and Vietnamese are rendered separately (never stacked
// or concatenated together on the same line).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

import type { Locale } from "./api";

export const LOCALE_STORAGE_KEY = "outfitpilot.locale.v1";

let currentLocale: Locale = "vi";
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setGlobalLocale(next: Locale, persist = true): void {
  if (next !== "en" && next !== "vi") return;
  if (currentLocale !== next) {
    currentLocale = next;
    emit();
  }
  if (persist) {
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, next).catch(() => undefined);
  }
}

export function toggleGlobalLocale(): Locale {
  const next: Locale = currentLocale === "vi" ? "en" : "vi";
  setGlobalLocale(next, true);
  return next;
}

export function hydrateLocale(): void {
  if (hydrated) return;
  hydrated = true;
  AsyncStorage.getItem(LOCALE_STORAGE_KEY)
    .then((raw) => {
      if (raw === "en" || raw === "vi") {
        setGlobalLocale(raw, false);
      }
    })
    .catch(() => undefined);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Reactive hook returning the active UI language ("en" | "vi"). */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, getLocale);
}

/** Picks the string matching the active locale. */
export function tr(locale: Locale, en: string, vi: string): string {
  return locale === "vi" ? vi : en;
}
