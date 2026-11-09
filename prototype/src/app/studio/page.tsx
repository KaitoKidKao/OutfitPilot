"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { ArrowRight, Camera, Play, RotateCcw, Square, SwitchCamera, X } from "lucide-react";
import { Dock } from "@/components/Dock";
import { Toast } from "@/components/Screen";
import { useStore } from "@/lib/store";
import type { Slot } from "@/lib/types";
import { useCamera } from "@/lib/useCamera";

const PREP_MS = 3000;
const LOOK_MS = 8000;
const SWITCH_MS = 700;

type Phase = "idle" | "countdown" | "showing" | "switching" | "done";

export default function StudioPage() {
  const router = useRouter();
  const { look, slots, products } = useStore();
  const cam = useCamera();
  const order = useMemo(
    () => (["a", "b"] as Slot[]).filter((s) => products.some((p) => p.id === slots[s])),
    [slots, products],
  );
  const [active, setActive] = useState<Slot | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!active && order.length) setActive(order[0]);
  }, [active, order]);

  // Start the camera automatically only when permission was already granted on Setup.
  useEffect(() => {
    let cancelled = false;
    navigator.permissions
      ?.query({ name: "camera" as PermissionName })
      .then((p) => {
        if (!cancelled && p.state === "granted") cam.start("user");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const begin = useCallback((next: Phase) => {
    startedAt.current = performance.now();
    setElapsed(0);
    setPhase(next);
  }, []);

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const id = window.setInterval(() => {
      const t = performance.now() - startedAt.current;
      setElapsed(t);
      if (phase === "countdown" && t >= PREP_MS) {
        setActive(order[0]);
        setStep(0);
        begin("showing");
      } else if (phase === "showing" && t >= LOOK_MS) {
        if (step + 1 < order.length) begin("switching");
        else setPhase("done");
      } else if (phase === "switching" && t >= SWITCH_MS) {
        setActive(order[step + 1]);
        setStep((s) => s + 1);
        begin("showing");
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, step, order, begin]);

  const running = phase === "countdown" || phase === "showing" || phase === "switching";
  const stopAuto = () => setPhase("idle");
  const shown: Slot | undefined = active ?? order[0];
  const current = shown ? look(shown) : undefined;
  const live = cam.state === "live";
  const countdown = Math.max(1, Math.ceil((PREP_MS - elapsed) / 1000));
  const remaining = Math.max(0, Math.ceil((LOOK_MS - elapsed) / 1000));

  const status =
    phase === "countdown" ? "Get ready" : phase === "switching" ? "Switching look" : live ? "Camera preview" : cam.state === "requesting" ? "Starting camera" : "Camera off";

  return (
    <main className="on-dark relative h-full overflow-hidden bg-studio text-white">
      <video
        ref={cam.videoRef}
        playsInline
        muted
        className={clsx(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          cam.facing === "user" && "-scale-x-100",
          live ? "opacity-100" : "opacity-0",
        )}
      />
      {!live && <CameraOff state={cam.state} onStart={() => cam.start("user")} />}

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/55 to-transparent px-3 pb-10 pt-safe">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              cam.stop();
              router.push("/looks");
            }}
            aria-label="Stop camera and leave studio"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="flex h-11 min-w-0 items-center gap-2 rounded-full bg-black/40 px-3.5 text-[13px] font-semibold backdrop-blur-md" role="status">
            <span className={clsx("h-2 w-2 shrink-0 rounded-full", live ? "bg-lime" : "bg-white/40")} />
            <span className="truncate">{status}</span>
            <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold tracking-wide text-lime">AI OFF</span>
          </div>
          <div className="ml-auto flex gap-2">
            {live && (
              <button type="button" onClick={cam.flip} aria-label="Switch camera" className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60">
                <SwitchCamera className="h-5 w-5" strokeWidth={1.75} />
              </button>
            )}
            <Link href="/decide" onClick={() => cam.stop()} className="flex h-11 items-center rounded-full bg-white px-4 text-[14px] font-semibold text-ink hover:bg-surface">
              Finish
            </Link>
          </div>
        </div>
        <p className="mt-2 px-1 text-[12px] text-white/75">Preview only: the outfit isn&apos;t drawn on you until AI try-on is connected.</p>
      </div>

      {/* current look card */}
      {current && (
        <figure key={current.id} className="absolute right-3 top-[124px] z-10 w-[148px] animate-wipe overflow-hidden rounded-[22px] bg-white text-ink shadow-dock">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.image} alt="" className="aspect-[4/5] w-full object-cover" />
          <figcaption className="px-3 py-2">
            <span className="block text-[13px] font-extrabold">Look {shown?.toUpperCase()}</span>
            <span className="block truncate text-[12px] text-muted">{current.name}</span>
          </figcaption>
        </figure>
      )}

      {/* readable from 1–2 m: which look is showing and how long is left */}
      {phase === "showing" && shown && (
        <div className="pointer-events-none absolute left-4 top-[124px] z-10 flex flex-col" aria-live="polite">
          <span key={shown} className="animate-rise text-[112px] font-extrabold leading-[0.85] tracking-[-0.04em] text-lime [text-shadow:0_4px_24px_rgba(0,0,0,0.45)]">
            {shown.toUpperCase()}
          </span>
          <span className="tnum mt-2 text-[44px] font-extrabold leading-none tracking-[-0.03em] [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]">
            {remaining}s
          </span>
        </div>
      )}

      {/* countdown */}
      {phase === "countdown" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30" aria-live="assertive">
          <span key={countdown} className="tnum animate-count text-[132px] font-extrabold leading-none tracking-[-0.04em] text-lime">
            {countdown}
          </span>
          <span className="mt-2 text-[15px] font-semibold">Step back into the frame</span>
        </div>
      )}

      {phase === "switching" && (
        <div className="absolute inset-0 z-[15] flex animate-wipe flex-col items-center justify-center bg-lime text-ink" role="status">
          <span className="text-[15px] font-bold">Switching look</span>
          <span className="flex items-center gap-4 text-[120px] font-extrabold leading-none tracking-[-0.04em]">
            <span className="opacity-30">{order[step]?.toUpperCase()}</span>
            <ArrowRight className="h-14 w-14" strokeWidth={2.5} aria-hidden />
            <span>{order[step + 1]?.toUpperCase()}</span>
          </span>
          <span className="mt-2 max-w-[80%] truncate text-[17px] font-semibold">{order[step + 1] ? look(order[step + 1])?.name : ""}</span>
        </div>
      )}

      {!order.length && (
        <div className="absolute inset-x-6 top-1/2 z-10 -translate-y-1/2 rounded-[22px] bg-white p-5 text-center text-ink">
          <p className="text-[17px] font-bold">No looks to try yet</p>
          <p className="mt-1 text-[14px] text-muted">Add at least one product photo first.</p>
          <Link href="/looks?new=1" className="mt-4 inline-flex h-12 items-center rounded-[14px] bg-lime px-5 text-[15px] font-semibold">
            Add a product
          </Link>
        </div>
      )}

      <Toast />

      <Dock
        scrim="dark"
        mode={{
          kind: "switch",
          active: phase === "countdown" ? null : active,
          onSelect: (s) => {
            if (running) stopAuto();
            setActive(s);
          },
        }}
        above={
          phase === "showing" ? (
            <div className="rounded-[18px] bg-black/55 px-4 py-2.5 backdrop-blur-md">
              <div className="flex items-center justify-between text-[13px] font-semibold">
                <span>
                  Look {active?.toUpperCase()} · {step + 1} of {order.length}
                </span>
                <span className="tnum text-white/80">0:{String(remaining).padStart(2, "0")}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-lime transition-[width] duration-100 ease-linear" style={{ width: `${Math.min(100, (elapsed / LOOK_MS) * 100)}%` }} />
              </div>
            </div>
          ) : phase === "done" ? (
            <div className="flex animate-rise items-center gap-3 rounded-[20px] bg-white p-2 pl-4 text-ink">
              <p className="flex-1 text-[14px] font-semibold">{order.length > 1 ? "You've seen both looks." : "Look tried."}</p>
              <button type="button" onClick={() => begin("countdown")} aria-label="Run again" className="flex h-11 w-11 items-center justify-center rounded-[14px] hover:bg-surface">
                <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <Link href="/decide" onClick={() => cam.stop()} className="flex h-11 items-center gap-1.5 rounded-[14px] bg-lime px-4 text-[14px] font-semibold">
                Decide <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </Link>
            </div>
          ) : undefined
        }
        center={
          running
            ? { label: "Stop", icon: <Square fill="currentColor" strokeWidth={0} />, showLabel: true, tone: "light", onClick: stopAuto }
            : {
                label: order.length > 1 ? "Auto compare" : "Timer",
                icon: <Play fill="currentColor" strokeWidth={0} />,
                showLabel: true,
                onClick: () => begin("countdown"),
                disabled: !order.length,
              }
        }
      />
    </main>
  );
}

function CameraOff({ state, onStart }: { state: string; onStart: () => void }) {
  const msg =
    state === "denied"
      ? "Camera access is blocked. Allow it in your browser's site settings."
      : state === "unavailable"
        ? "No camera on this device. You can still switch between looks."
        : state === "error"
          ? "The camera didn't start. Close other apps using it and try again."
          : "The camera turns on only when you tap. Nothing is recorded.";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_40%,#1C2A23_0%,#0B100E_70%)] px-8 text-center">
      <svg viewBox="0 0 120 170" className="h-[200px] w-auto opacity-70" aria-hidden>
        <path
          d="M60 10c11 0 19 9 19 20s-8 21-19 21-19-10-19-21 8-20 19-20Zm-40 82c3-17 17-29 34-30h12c17 1 31 13 34 30l5 74H15l5-74Z"
          fill="none"
          stroke="#C8F169"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
      </svg>
      <p className="mt-6 max-w-[30ch] text-[14px] leading-relaxed text-white/80">{msg}</p>
      {state !== "unavailable" && (
        <button
          type="button"
          onClick={onStart}
          disabled={state === "requesting"}
          className="mt-4 flex h-12 items-center gap-2 rounded-[16px] bg-white px-5 text-[15px] font-semibold text-ink hover:bg-surface disabled:opacity-60"
        >
          <Camera className="h-5 w-5" strokeWidth={1.75} />
          {state === "requesting" ? "Starting…" : state === "idle" ? "Turn on camera" : "Try again"}
        </button>
      )}
    </div>
  );
}
