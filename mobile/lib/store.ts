// App state for the 5-screen flow. Plain React context, no state library.
//
//   occasion + style (screen 1) -> fetchPicks() -> picks A/B (screen 2)
//   -> consent (screen 3) -> activeLook while fitting (screen 4) -> keepLook (screen 5)
//
// Saved looks persist on the device with AsyncStorage (key below). Nothing else is
// persisted: consent is asked again every app launch.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { ApiError, describeApiError, postStyle, type ClientErrorCode, type ErrorCode, type Locale, type Recommendation, type StyleResponse, type StyleSource } from "./api";
import { getGarment, isGarmentId, OCCASION_IDS, type Garment, type GarmentId, type OccasionId } from "./catalog";
import { getLocale, hydrateLocale, setGlobalLocale, useLocale } from "./locale";
import { isStyleChoice, type StyleChoice } from "./occasions";
import { readPreviewSeed } from "./previewSeed";

export type Slot = "a" | "b";
export type PicksStatus = "idle" | "loading" | "ready" | "error";

export interface SavedLook {
  /** Unique id (garmentId + occasionId + savedAt). */
  id: string;
  garmentId: GarmentId;
  occasionId: OccasionId;
  reason: string;
  pairWith: string;
  /** "llm" = AI Stylist pick, "fallback" = default suggestion. Keep the label honest. */
  source: StyleSource;
  /** ISO 8601. */
  savedAt: string;
}

export interface AppState {
  occasionId: OccasionId | null;
  style: StyleChoice;
  /** Language of reason/pairWith requested from /api/style. English is primary. */
  locale: Locale;
  picks: StyleResponse | null;
  picksStatus: PicksStatus;
  /** Human-readable error for the last fetchPicks failure. */
  picksError: string | null;
  /** ApiError code of the last fetchPicks failure ("unknown" for a non-ApiError). Classify on this, not on the text. */
  picksErrorCode: ErrorCode | ClientErrorCode | "unknown" | null;
  /** HTTP status of the last failure, 0 when no response arrived (or no failure). */
  picksErrorStatus: number;
  activeLook: Slot;
  consentGiven: boolean;
  saved: SavedLook[];
  /** false until AsyncStorage has been read once. */
  savedLoaded: boolean;
  /** Explicit override for hooks from Closet or user choice */
  customHooks: [GarmentId | null, GarmentId | null] | null;
  /** Free-form custom occasion text when occasionId is "other" */
  customOccasion: string | null;
}

export interface AppActions {
  /** Changing the occasion drops picks made for the old one. */
  setOccasion: (id: OccasionId) => void;
  setCustomOccasion: (custom: string | null) => void;
  /** Changing the style drops picks made for the old one. */
  setStyle: (style: StyleChoice) => void;
  setLocale: (locale: Locale) => void;
  /**
   * Calls POST /api/style for the current occasion + style. Returns the cached picks
   * when they already match (unless force). Resolves null on failure (see picksError)
   * or when no occasion is chosen. Never throws.
   */
  fetchPicks: (options?: { force?: boolean }) => Promise<StyleResponse | null>;
  setActiveLook: (slot: Slot) => void;
  assignHook: (slot: Slot, id: GarmentId | null) => void;
  giveConsent: () => void;
  revokeConsent: () => void;
  /** Saves the pick in `slot` (dedupes the same garment + occasion). Returns the saved entry. */
  keepLook: (slot: Slot) => SavedLook | null;
  removeSaved: (id: string) => void;
  /** Resets the flow (occasion, style, picks, look, consent). Saved looks stay. */
  clear: () => void;
  /** Deletes every saved look. */
  clearSaved: () => void;
}

export interface AppStore extends AppState, AppActions {
  /** Recommendation in a slot, or null. */
  pickFor: (slot: Slot) => Recommendation | null;
  /** Catalog garment in a slot, or null. */
  garmentFor: (slot: Slot) => Garment | null;
  /** Garment ids for the dock hooks: [A, B]. */
  hookIds: [GarmentId | null, GarmentId | null];
}

export const SAVED_STORAGE_KEY = "outfitpilot.saved.v1";
const MAX_SAVED = 50;

function isSavedLook(v: unknown): v is SavedLook {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    isGarmentId(o.garmentId) &&
    typeof o.occasionId === "string" &&
    (OCCASION_IDS as readonly string[]).includes(o.occasionId) &&
    typeof o.reason === "string" &&
    typeof o.pairWith === "string" &&
    (o.source === "llm" || o.source === "fallback") &&
    typeof o.savedAt === "string"
  );
}

function initialState(): AppState {
  const seed = readPreviewSeed();
  return {
    occasionId: seed?.occasionId ?? null,
    style: seed && isStyleChoice(seed.style) ? seed.style : "none",
    locale: getLocale(),
    picks: seed?.picks ?? null,
    picksStatus: seed?.picks ? "ready" : "idle",
    picksError: null,
    picksErrorCode: null,
    picksErrorStatus: 0,
    activeLook: "a",
    consentGiven: seed?.consentGiven ?? false,
    saved: seed?.saved ?? [],
    savedLoaded: false,
    customHooks: null,
    customOccasion: null,
  };
}

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const activeLocale = useLocale();
  const [state, setState] = useState<AppState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = { ...state, locale: activeLocale };
  /** Bumped per fetch; a slower, older response never overwrites a newer one. */
  const requestRef = useRef(0);
  /** occasion+style the current picks were made for. */
  const picksKeyRef = useRef<string | null>(state.picks && state.occasionId ? `${state.occasionId}|${state.style}|${state.locale}` : null);

  // ----- persistence -----
  useEffect(() => {
    hydrateLocale();
    let alive = true;
    AsyncStorage.getItem(SAVED_STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        let saved: SavedLook[] = [];
        if (raw) {
          try {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) saved = parsed.filter(isSavedLook);
          } catch {
            saved = [];
          }
        }
        // Merge with anything kept before storage finished loading.
        setState((s) => {
          const ids = new Set(s.saved.map((l) => l.id));
          return { ...s, saved: [...s.saved, ...saved.filter((l) => !ids.has(l.id))].slice(0, MAX_SAVED), savedLoaded: true };
        });
      })
      .catch((e) => {
        console.warn("[store] could not read saved looks", e);
        if (alive) setState((s) => ({ ...s, savedLoaded: true }));
      });
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((saved: SavedLook[]) => {
    AsyncStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(saved)).catch((e) => console.warn("[store] could not save looks", e));
  }, []);

  // ----- actions -----
  const resetPicks = (s: AppState): AppState => {
    requestRef.current++;
    picksKeyRef.current = null;
    return { ...s, picks: null, picksStatus: "idle", picksError: null, picksErrorCode: null, picksErrorStatus: 0, activeLook: "a" };
  };

  const setOccasion = useCallback((id: OccasionId) => {
    setState((s) => (s.occasionId === id ? { ...s, occasionId: null } : { ...resetPicks(s), occasionId: id }));
  }, []);

  const setCustomOccasion = useCallback((custom: string | null) => {
    setState((s) => ({ ...s, customOccasion: custom }));
  }, []);

  const setStyle = useCallback((style: StyleChoice) => {
    setState((s) => (s.style === style ? s : { ...resetPicks(s), style }));
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    setGlobalLocale(locale, true);
    setState((s) => (s.locale === locale ? s : { ...s, locale }));
  }, []);

  const fetchPicks = useCallback(async (options?: { force?: boolean }): Promise<StyleResponse | null> => {
    const s = stateRef.current;
    if (!s.occasionId) return null;
    const key = `${s.occasionId}|${s.style}|${s.locale}|${s.customOccasion ?? ""}`;
    if (!options?.force && s.picks && picksKeyRef.current === key) return s.picks;

    const req = ++requestRef.current;
    setState((prev) => ({ ...prev, picksStatus: "loading", picksError: null, picksErrorCode: null, picksErrorStatus: 0 }));
    try {
      const apiOccasionId =
        s.occasionId === "other"
          ? (s.customOccasion && /tiệc|cưới|lễ|họp|formal|suit|blazer|party/i.test(s.customOccasion) ? "job_interview" : "coffee_date")
          : s.occasionId;
      const res = await postStyle({
        occasionId: apiOccasionId,
        style: s.style,
        locale: s.locale,
        customOccasion: s.customOccasion ?? undefined,
      });
      if (req !== requestRef.current) return null;
      picksKeyRef.current = key;
      setState((prev) => ({ ...prev, picks: res, picksStatus: "ready", picksError: null, picksErrorCode: null, picksErrorStatus: 0, activeLook: "a" }));
      return res;
    } catch (e) {
      if (req !== requestRef.current) return null;
      const code = e instanceof ApiError ? e.code : "unknown";
      const status = e instanceof ApiError ? e.status : 0;
      setState((prev) => ({ ...prev, picksStatus: "error", picksError: describeApiError(e), picksErrorCode: code, picksErrorStatus: status }));
      return null;
    }
  }, []);

  const setActiveLook = useCallback((slot: Slot) => {
    setState((s) => (s.activeLook === slot ? s : { ...s, activeLook: slot }));
  }, []);

  const assignHook = useCallback((slot: Slot, id: GarmentId | null) => {
    setState((prev) => {
      const curA = prev.customHooks ? prev.customHooks[0] : (prev.picks?.recommendations[0]?.garmentId ?? null);
      const curB = prev.customHooks ? prev.customHooks[1] : (prev.picks?.recommendations[1]?.garmentId ?? null);
      const nextHooks: [GarmentId | null, GarmentId | null] = slot === "a" ? [id, curB] : [curA, id];
      return { ...prev, customHooks: nextHooks };
    });
  }, []);

  const giveConsent = useCallback(() => setState((s) => ({ ...s, consentGiven: true })), []);
  const revokeConsent = useCallback(() => setState((s) => ({ ...s, consentGiven: false })), []);

  const keepLook = useCallback(
    (slot: Slot): SavedLook | null => {
      const s = stateRef.current;
      const hookId = s.customHooks ? s.customHooks[slot === "a" ? 0 : 1] : (s.picks?.recommendations[slot === "a" ? 0 : 1]?.garmentId ?? null);
      if (!hookId) return null;
      const occasionId = s.occasionId ?? "job_interview";
      const rec = s.picks?.recommendations.find((r) => r.garmentId === hookId);
      const garment = getGarment(hookId);
      const savedAt = new Date().toISOString();
      const look: SavedLook = {
        id: `${hookId}-${occasionId}-${Date.parse(savedAt)}`,
        garmentId: hookId,
        occasionId,
        reason: rec?.reason ?? garment.fitAdvice ?? `Món đồ từ Tủ Đồ (${garment.name})`,
        pairWith: rec?.pairWith ?? "Quần phù hợp từ tủ đồ",
        source: rec ? s.picks?.source ?? "llm" : "llm",
        savedAt,
      };
      const next = [look, ...s.saved.filter((l) => !(l.garmentId === look.garmentId && l.occasionId === look.occasionId))].slice(0, MAX_SAVED);
      stateRef.current = { ...s, saved: next };
      setState((prev) => ({ ...prev, saved: next }));
      persist(next);
      return look;
    },
    [persist],
  );

  const removeSaved = useCallback(
    (id: string) => {
      const next = stateRef.current.saved.filter((l) => l.id !== id);
      stateRef.current = { ...stateRef.current, saved: next };
      setState((prev) => ({ ...prev, saved: next }));
      persist(next);
    },
    [persist],
  );

  const clearSaved = useCallback(() => {
    stateRef.current = { ...stateRef.current, saved: [] };
    setState((prev) => ({ ...prev, saved: [] }));
    persist([]);
  }, [persist]);

  const clear = useCallback(() => {
    setState((s) => ({ ...resetPicks(s), occasionId: null, style: "none", consentGiven: false, customOccasion: null }));
  }, []);

  const store = useMemo<AppStore>(() => {
    const hookA = state.customHooks ? state.customHooks[0] : (state.picks?.recommendations[0]?.garmentId ?? null);
    const hookB = state.customHooks ? state.customHooks[1] : (state.picks?.recommendations[1]?.garmentId ?? null);

    const pickFor = (slot: Slot) => {
      const hookId = slot === "a" ? hookA : hookB;
      if (!hookId) return null;
      const rec = state.picks?.recommendations.find((r) => r.garmentId === hookId);
      if (rec) return rec;
      try {
        const g = getGarment(hookId);
        return { garmentId: hookId, reason: g.fitAdvice ?? g.name, pairWith: "Quần phối hợp từ tủ đồ" };
      } catch {
        return null;
      }
    };

    const garmentFor = (slot: Slot) => {
      const hookId = slot === "a" ? hookA : hookB;
      if (!hookId) return null;
      try {
        return getGarment(hookId);
      } catch {
        return null;
      }
    };

    return {
      ...state,
      locale: activeLocale,
      setOccasion,
      setCustomOccasion,
      setStyle,
      setLocale,
      fetchPicks,
      setActiveLook,
      assignHook,
      giveConsent,
      revokeConsent,
      keepLook,
      removeSaved,
      clear,
      clearSaved,
      pickFor,
      garmentFor,
      hookIds: [hookA, hookB],
    };
  }, [state, activeLocale, setOccasion, setStyle, setLocale, fetchPicks, setActiveLook, assignHook, giveConsent, revokeConsent, keepLook, removeSaved, clear, clearSaved]);

  return createElement(StoreContext.Provider, { value: store }, children);
}

/** The whole store. Must be used under <AppStoreProvider> (wired in app/_layout.tsx). */
export function useAppStore(): AppStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside <AppStoreProvider>.");
  return store;
}
