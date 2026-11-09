"use client";

import { clsx } from "clsx";
import { ArrowRight, Camera, Lightbulb, MoveHorizontal, ShieldCheck, Smartphone } from "lucide-react";
import { Dock } from "@/components/Dock";
import { Screen, TopBar } from "@/components/Screen";
import { useCamera } from "@/lib/useCamera";

const tips = [
  {
    icon: Smartphone,
    title: "Prop it at chest height",
    vi: "Dựng máy trên bàn hoặc giá đỡ chắc chắn",
  },
  {
    icon: MoveHorizontal,
    title: "Step back about 1.5 m",
    vi: "Lùi lại đến khi thấy từ đầu tới hông",
  },
  {
    icon: Lightbulb,
    title: "Face the light",
    vi: "Đứng đối diện cửa sổ hoặc đèn, tránh ngược sáng",
  },
];

export default function SetupPage() {
  const cam = useCamera();
  const live = cam.state === "live";

  return (
    <Screen>
      <TopBar back="/looks" title="Camera setup" />

      <section className="px-5">
        <div className="relative aspect-[4/3.4] overflow-hidden rounded-[24px] bg-surface">
          <video
            ref={cam.videoRef}
            playsInline
            muted
            className={clsx("absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity duration-500", live ? "opacity-100" : "opacity-0")}
          />
          {!live && <SetupIllustration />}
          {live && <BodyGuide />}
          <span
            className={clsx(
              "absolute left-3 top-3 flex h-8 items-center gap-2 rounded-full px-3 text-[12px] font-semibold",
              live ? "bg-ink/80 text-white" : "bg-white text-ink",
            )}
          >
            <span className={clsx("h-2 w-2 rounded-full", live ? "bg-lime" : "bg-muted/50")} />
            {live ? "Camera preview" : "Camera off"}
          </span>
        </div>
        {live && <p className="mt-3 text-center text-[14px] font-medium">Fit your head to hips inside the outline. · Căn người vào khung.</p>}
      </section>

      <ul className="mx-5 mt-5 space-y-1">
        {tips.map(({ icon: Icon, title, vi }) => (
          <li key={title} className="flex items-center gap-3.5 py-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-surface">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">{title}</span>
              <span className="block text-[13px] text-muted">{vi}</span>
            </span>
          </li>
        ))}
      </ul>

      <section className="mx-5 mt-4 rounded-[18px] bg-lime-soft px-4 py-4" aria-live="polite">
        {cam.state === "denied" ? (
          <>
            <p className="text-[15px] font-semibold">Camera access is blocked</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/80">
              Open your browser&apos;s site settings, allow Camera for this page, then tap Try again. · Hãy bật quyền Camera trong cài đặt trình duyệt.
            </p>
          </>
        ) : cam.state === "unavailable" ? (
          <>
            <p className="text-[15px] font-semibold">No camera found</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/80">
              This device or browser doesn&apos;t offer a camera. You can still open the studio and switch between looks. · Không tìm thấy camera.
            </p>
          </>
        ) : cam.state === "error" ? (
          <>
            <p className="text-[15px] font-semibold">The camera didn&apos;t start</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/80">Another app may be using it. Close it and tap Try again.</p>
          </>
        ) : (
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <p className="text-[13px] leading-relaxed text-ink/80">
              <span className="font-semibold text-ink">Your camera stays on this phone.</span> Nothing is recorded or uploaded, and it turns off when you leave the
              studio. · Không ghi hình, không tải lên.
            </p>
          </div>
        )}
      </section>

      <Dock
        center={
          live || cam.state === "unavailable"
            ? { label: "Studio", icon: <ArrowRight strokeWidth={2.25} />, showLabel: true, href: "/studio" }
            : {
                label: cam.state === "requesting" ? "Waiting…" : cam.state === "idle" ? "Allow camera" : "Try again",
                icon: <Camera strokeWidth={2} />,
                showLabel: true,
                onClick: () => cam.start("user"),
                disabled: cam.state === "requesting",
              }
        }
      />
    </Screen>
  );
}

function BodyGuide() {
  return (
    <svg viewBox="0 0 300 255" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <path
        d="M150 28c16 0 28 13 28 30s-12 31-28 31-28-14-28-31 12-30 28-30Zm-62 120c4-26 26-44 52-46h20c26 2 48 20 52 46l8 107H80l8-107Z"
        fill="none"
        stroke="#C8F169"
        strokeWidth="2.5"
        strokeDasharray="7 6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SetupIllustration() {
  return (
    <svg viewBox="0 0 340 290" className="absolute inset-0 h-full w-full" role="img" aria-label="Phone propped on a stand, person standing about 1.5 metres away">
      <rect x="0" y="232" width="340" height="58" fill="#EAEEEC" />
      {/* stand + phone */}
      <path d="M58 232l14-52h10l14 52" fill="none" stroke="#0F1713" strokeWidth="3" strokeLinejoin="round" />
      <rect x="62" y="118" width="30" height="58" rx="6" fill="#0F1713" />
      <rect x="66" y="123" width="22" height="46" rx="3" fill="#C8F169" />
      <circle cx="77" cy="127" r="1.6" fill="#0F1713" />
      {/* view cone */}
      <path d="M92 132L232 70v178L92 160Z" fill="#C8F169" opacity="0.22" />
      {/* person */}
      <circle cx="252" cy="92" r="17" fill="#0F1713" />
      <path d="M222 168c2-30 14-48 30-48s28 18 30 48v64h-60v-64Z" fill="#0F1713" />
      <path d="M236 232v-40M268 232v-40" stroke="#F4F6F5" strokeWidth="2" opacity="0.4" />
      {/* distance */}
      <path d="M96 258h120" stroke="#5B6660" strokeWidth="1.5" />
      <path d="M102 253l-6 5 6 5M210 253l6 5-6 5" fill="none" stroke="#5B6660" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="132" y="247" width="48" height="22" rx="11" fill="#FFFFFF" />
      <text x="156" y="262" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F1713" fontFamily="inherit">
        ≈1.5 m
      </text>
    </svg>
  );
}
