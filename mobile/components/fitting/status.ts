// Honest status copy for the Live Fitting Room (DESIGN.md §5.4, §6.4).
// "AI LIVE" appears only while state === "live". Every other state says plainly
// what is (not) happening: preview only, connecting, switching, lost.
import type { StatusPillProps } from "@/components/ui";
import type { CameraStatus, TryOnState } from "@/lib/tryOnSession";

const CAMERA_LABEL: Record<CameraStatus, string> = {
  on: "Camera preview",
  starting: "Starting camera",
  off: "Camera off",
  denied: "Camera blocked",
  error: "Camera error",
};

export function statusPillFor(state: TryOnState, cameraStatus: CameraStatus, statusLabel: string): StatusPillProps {
  switch (state) {
    case "live":
      return { label: statusLabel, dot: "live", ai: "live", aiLabel: "AI LIVE" };
    case "switching":
      return { label: statusLabel, dot: "live", ai: null };
    case "connecting":
      return { label: statusLabel, dot: cameraStatus === "on" ? "on" : "off", ai: "off" };
    case "lost":
      return { label: statusLabel, dot: "warn", ai: "off" };
    case "preview":
    default:
      return {
        label: CAMERA_LABEL[cameraStatus],
        dot: cameraStatus === "on" ? "on" : cameraStatus === "denied" || cameraStatus === "error" ? "warn" : "off",
        ai: "off",
        aiLabel: "AI OFF / preview only",
      };
  }
}

/** The wrapper's cap notice (lib/decart.ts: "Session stopped at the 2-minute limit."). */
export function isCapNotice(notice: string | null): boolean {
  return !!notice && /2-minute limit/i.test(notice);
}
