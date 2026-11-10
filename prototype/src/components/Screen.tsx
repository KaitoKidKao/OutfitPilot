"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";

export function Screen({
  children,
  className,
  withDock = true,
}: {
  children: React.ReactNode;
  className?: string;
  withDock?: boolean;
}) {
  return (
    <main className={clsx("no-scrollbar h-full overflow-y-auto pt-safe", withDock && "pb-safe-dock", className)}>
      {children}
      <Toast />
    </main>
  );
}

export function LocaleSwitch({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { locale, toggleLocale } = useStore();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={locale === "vi" ? "Switch language to English" : "Chuyển sang tiếng Việt"}
      className={clsx(
        "flex h-9 items-center gap-1 rounded-[12px] px-2.5 text-[12px] font-bold tracking-tight transition-colors",
        tone === "dark"
          ? "bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
          : "bg-surface text-ink hover:bg-surface-deep",
      )}
    >
      <span className={clsx(locale === "vi" ? "font-extrabold opacity-100" : "font-medium opacity-55")}>VI</span>
      <span className="opacity-35">/</span>
      <span className={clsx(locale === "en" ? "font-extrabold opacity-100" : "font-medium opacity-55")}>EN</span>
    </button>
  );
}

/** `title` is the screen's h1; pages that set their own h1 pass no title. */
export function TopBar({
  title,
  back,
  right,
}: {
  title?: string;
  back?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex min-h-[56px] items-center gap-2 px-4">
      {back && (
        <Link
          href={back}
          aria-label="Back"
          className="-ml-1 flex h-11 w-11 items-center justify-center rounded-[14px] text-ink transition-colors hover:bg-surface"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Link>
      )}
      {title && <h1 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h1>}
      <div className="ml-auto flex items-center gap-2">
        {right}
        <LocaleSwitch />
      </div>
    </header>
  );
}

export function Toast() {
  const { toast } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-[max(16px,env(safe-area-inset-top))] z-50 flex justify-center px-4">
      {toast && (
        <div className="animate-rise rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-white shadow-dock">{toast}</div>
      )}
    </div>
  );
}

export function SampleTag({ className }: { className?: string }) {
  const { tr } = useStore();
  return (
    <span className={clsx("rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-muted shadow-sm", className)}>
      {tr("Sample", "Ảnh mẫu")}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${htmlFor}-msg`} className="mt-1.5 text-[13px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-msg`} className="mt-1.5 text-[12px] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const inputCls =
  "h-12 w-full rounded-[14px] border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-muted/80 transition-colors focus:border-ink focus:outline-none aria-[invalid=true]:border-danger";
