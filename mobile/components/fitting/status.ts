// Honest status copy for the Live Fitting Room (DESIGN.md §5.4, §6.4).
// "AI LIVE" appears only while state === "live". Every other state says plainly
// what is (not) happening: preview only, connecting, switching, lost.
import type { StatusPillProps } from "@/components/ui";
import type { CameraStatus, TryOnState } from "@/lib/tryOnSession";

const CAMERA_LABEL: Record<CameraStatus, { en: string; vi: string }> = {
  on: { en: "Camera preview", vi: "Xem trước camera" },
  starting: { en: "Starting camera", vi: "Đang bật camera" },
  off: { en: "Camera off", vi: "Camera đang tắt" },
  denied: { en: "Camera blocked", vi: "Camera bị chặn" },
  error: { en: "Camera error", vi: "Lỗi camera" },
};

export function statusPillFor(state: TryOnState, cameraStatus: CameraStatus, statusLabel: string, statusLabelVi?: string): StatusPillProps {
  switch (state) {
    case "live":
      return { label: statusLabel, labelVi: statusLabelVi, dot: "live", ai: "live", aiLabel: "AI LIVE", aiLabelVi: "AI TRỰC TIẾP" };
    case "switching":
      return { label: statusLabel, labelVi: statusLabelVi, dot: "live", ai: null };
    case "connecting":
      return { label: statusLabel, labelVi: statusLabelVi, dot: cameraStatus === "on" ? "on" : "off", ai: "off" };
    case "lost":
      return { label: statusLabel, labelVi: statusLabelVi, dot: "warn", ai: "off" };
    case "preview":
    default:
      return {
        label: CAMERA_LABEL[cameraStatus].en,
        labelVi: CAMERA_LABEL[cameraStatus].vi,
        dot: cameraStatus === "on" ? "on" : cameraStatus === "denied" || cameraStatus === "error" ? "warn" : "off",
        ai: "off",
        aiLabel: "AI OFF / preview only",
        aiLabelVi: "AI TẮT / xem trước",
      };
  }
}

/** The wrapper's cap notice (lib/decart.ts: "Session stopped at the 2-minute limit."). */
export function isCapNotice(notice: string | null): boolean {
  return !!notice && /2-minute limit/i.test(notice);
}
