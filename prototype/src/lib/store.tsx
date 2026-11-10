k"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_PRODUCTS } from "./samples";
import type { Product, SavedLook, Slot } from "./types";

export type Locale = "vi" | "en";

type State = {
  products: Product[];
  slots: Record<Slot, string | null>;
  saved: SavedLook[];
  locale?: Locale;
};

type Store = State & {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  tr: (en: string, vi: string) => string;
  ready: boolean;
  byId: (id: string | null | undefined) => Product | undefined;
  look: (slot: Slot) => Product | undefined;
  addProduct: (p: Omit<Product, "id" | "addedAt">, slot?: Slot) => string;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  assign: (slot: Slot, id: string | null) => void;
  save: (id: string) => void;
  unsave: (id: string) => void;
  isSaved: (id: string) => boolean;
  toast: string | null;
  notify: (msg: string) => void;
  persistError: boolean;
};

const KEY = "outfitpilot:v1";

const INITIAL: State = {
  products: SAMPLE_PRODUCTS,
  slots: { a: "s-bomber", b: "s-leather" },
  saved: [{ productId: "s-dress", savedAt: 1 }, { productId: "s-shirt", savedAt: 0 }],
  locale: "vi",
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [persistError, setPersistError] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (Array.isArray(parsed.products) && parsed.slots) {
          setState({
            ...parsed,
            locale: parsed.locale === "en" || parsed.locale === "vi" ? parsed.locale : "vi",
          });
        }
      }
    } catch {
      /* private mode or corrupt data: keep the demo state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      setPersistError(false);
    } catch {
      setPersistError(true);
    }
  }, [state, ready]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const byId = useCallback((id: string | null | undefined) => state.products.find((p) => p.id === id), [state.products]);
  const locale: Locale = state.locale === "en" ? "en" : "vi";

  const store = useMemo<Store>(
    () => ({
      ...state,
      locale,
      setLocale: (next) => setState((s) => ({ ...s, locale: next })),
      toggleLocale: () => setState((s) => ({ ...s, locale: s.locale === "en" ? "vi" : "en" })),
      tr: (en, vi) => (locale === "vi" ? vi : en),
      ready,
      toast,
      notify,
      persistError,
      byId,
      look: (slot) => byId(state.slots[slot]),
      addProduct: (p, slot) => {
        const id = `p-${Date.now().toString(36)}`;
        setState((s) => ({
          ...s,
          products: [{ ...p, id, addedAt: Date.now() }, ...s.products],
          slots: slot ? { ...s.slots, [slot]: id } : s.slots,
        }));
        return id;
      },
      updateProduct: (id, patch) =>
        setState((s) => ({ ...s, products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removeProduct: (id) =>
        setState((s) => ({
          products: s.products.filter((p) => p.id !== id),
          slots: { a: s.slots.a === id ? null : s.slots.a, b: s.slots.b === id ? null : s.slots.b },
          saved: s.saved.filter((x) => x.productId !== id),
        })),
      assign: (slot, id) =>
        setState((s) => {
          const other: Slot = slot === "a" ? "b" : "a";
          const slots = { ...s.slots, [slot]: id };
          if (id && s.slots[other] === id) slots[other] = s.slots[slot];
          return { ...s, slots };
        }),
      save: (id) =>
        setState((s) =>
          s.saved.some((x) => x.productId === id)
            ? s
            : { ...s, saved: [{ productId: id, savedAt: Date.now() }, ...s.saved] },
        ),
      unsave: (id) => setState((s) => ({ ...s, saved: s.saved.filter((x) => x.productId !== id) })),
      isSaved: (id) => state.saved.some((x) => x.productId === id),
    }),
    [state, locale, ready, toast, notify, persistError, byId],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
