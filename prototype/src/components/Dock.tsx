"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useStore } from "@/lib/store";
import type { Product, Slot } from "@/lib/types";

type Center = {
  label: string;
  icon: React.ReactNode;
  /** Show the label next to the icon (pill); otherwise icon-only with aria-label. */
  showLabel?: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** lime = the next action; light = a strong secondary (Stop); quiet = recedes into the dock. */
  tone?: "lime" | "light" | "quiet";
};

type HookMode =
  | { kind: "edit" }
  | { kind: "switch"; active: Slot | null; onSelect: (slot: Slot) => void; disabled?: boolean }
  | { kind: "keep"; onKeep: (slot: Slot) => void };

export function Dock({
  center,
  mode = { kind: "edit" },
  above,
  scrim = "light",
}: {
  center: Center;
  mode?: HookMode;
  above?: React.ReactNode;
  scrim?: "light" | "dark";
}) {
  const compact = center.showLabel && mode.kind !== "keep";
  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-[calc(16px+var(--safe-bottom))] pt-10",
        scrim === "light"
          ? "bg-gradient-to-t from-white from-40% via-white/85 to-transparent"
          : "bg-gradient-to-t from-black/70 from-30% to-transparent",
      )}
    >
      {above && <div className="pointer-events-auto mb-2">{above}</div>}
      <nav
        aria-label="Fitting dock"
        className={clsx(
          "on-dark pointer-events-auto grid items-center gap-2 rounded-[30px] bg-ink p-2.5 shadow-dock",
          compact ? "grid-cols-[auto_minmax(0,1fr)_auto]" : "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
        )}
      >
        <Hook slot="a" mode={mode} compact={compact} />
        <CenterButton {...center} />
        <Hook slot="b" mode={mode} compact={compact} />
      </nav>
    </div>
  );
}

function CenterButton({ label, icon, showLabel, href, onClick, disabled, tone = "lime" }: Center) {
  const cls = clsx(
    "flex h-16 min-w-16 items-center justify-center gap-2 rounded-[22px] font-semibold transition-[transform,background-color] duration-200 ease-out active:scale-[0.96]",
    showLabel ? "whitespace-nowrap px-4 text-[15px]" : "text-[0px]",
    tone === "lime" && "bg-lime text-ink hover:bg-lime-press",
    tone === "light" && "bg-white text-ink hover:bg-surface",
    tone === "quiet" && "w-14 min-w-14 bg-transparent text-muted-dark hover:bg-ink-well hover:text-white",
    disabled && "pointer-events-none opacity-40",
  );
  const content = (
    <>
      <span aria-hidden className="[&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </span>
      <span className={showLabel ? "" : "sr-only"}>{label}</span>
    </>
  );
  if (href && !disabled)
    return (
      <Link href={href} className={cls} aria-label={showLabel ? undefined : label}>
        {content}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {content}
    </button>
  );
}

function Hook({ slot, mode, compact }: { slot: Slot; mode: HookMode; compact?: boolean }) {
  const { look, tr } = useStore();
  const p = look(slot);
  const letter = slot.toUpperCase();
  const lit = (mode.kind === "switch" && mode.active === slot) || (mode.kind === "keep" && Boolean(p));

  const base = clsx(
    "group relative flex h-[76px] min-w-0 items-center rounded-[22px] px-2 text-left transition-colors duration-200 ease-out",
    compact ? "gap-1.5" : "gap-2.5",
    lit ? "bg-lime text-ink hover:bg-lime-press" : "bg-ink-well text-white hover:bg-ink-line",
  );

  const face =
    mode.kind === "keep" ? (
      <>
        <HookThumb product={p} lit={lit} />
        <span className="min-w-0 leading-tight">
          <span className="block whitespace-nowrap text-[15px] font-bold">
            {p ? tr(`Keep ${letter}`, `Giữ ${letter}`) : tr(`${letter} empty`, `${letter} trống`)}
          </span>
          {p && <span className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-[1.2] text-ink/70">{p.name}</span>}
        </span>
      </>
    ) : compact ? (
      <>
        <HookThumb product={p} lit={lit} />
        <span className="w-4 text-center text-[17px] font-extrabold">{letter}</span>
      </>
    ) : (
      <>
        <HookThumb product={p} lit={lit} />
        <span className="min-w-0 leading-tight">
          <span className="block whitespace-nowrap text-[13px] font-bold">Look {letter}</span>
          <span className={clsx("mt-0.5 line-clamp-2 text-[12px] leading-[1.2]", lit ? "text-ink/70" : "text-muted-dark")}>
            {p ? p.name : tr("Empty · add", "Trống · thêm")}
          </span>
        </span>
      </>
    );

  if (mode.kind === "edit")
    return (
      <Link href={`/looks?slot=${slot}`} className={base} aria-label={p ? `Look ${letter}: ${p.name}. Change` : `Add Look ${letter}`}>
        {face}
      </Link>
    );

  if (mode.kind === "switch")
    return (
      <button
        type="button"
        className={clsx(base, (!p || mode.disabled) && "opacity-50")}
        disabled={!p || mode.disabled}
        aria-pressed={lit}
        aria-label={p ? `Show Look ${letter}: ${p.name}` : `Look ${letter} is empty`}
        onClick={() => mode.onSelect(slot)}
      >
        {face}
      </button>
    );

  return (
    <button
      type="button"
      className={clsx(base, !p && "opacity-50")}
      disabled={!p}
      onClick={() => mode.onKeep(slot)}
      aria-label={p ? `Keep Look ${letter}: ${p.name}` : `Look ${letter} is empty`}
    >
      {face}
    </button>
  );
}

/** The thumbnail hangs from the dock's rail: a short rod above it, and it swings in when a look changes. */
function HookThumb({ product, lit }: { product?: Product; lit: boolean }) {
  return (
    <span className="relative flex h-14 w-11 shrink-0 items-start justify-center">
      <span aria-hidden className={clsx("absolute -top-[5px] h-[3px] w-6 rounded-full", lit ? "bg-ink/40" : "bg-muted")} />
      {product ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={product.id}
          src={product.image}
          alt=""
          className="h-full w-full animate-hang rounded-[12px] bg-white object-cover"
          style={{ transformOrigin: "50% 0%" }}
        />
      ) : (
        <span className="h-full w-full rounded-[12px] border-[1.5px] border-dashed border-muted" />
      )}
    </span>
  );
}
