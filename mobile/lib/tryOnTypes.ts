// Shared types for lib/tryOnSession.ts (native) and lib/tryOnSession.web.ts (stub).
// No runtime imports from the WebRTC / Decart modules here, so web bundles stay clean.
import type { GarmentId } from "./catalog";
import type { Look } from "./decart";

export type TryOnState = "preview" | "connecting" | "live" | "switching" | "lost";
export type CameraStatus = "off" | "starting" | "on" | "denied" | "error";
export type CameraFacing = "user" | "environment";

/** Opaque video stream (a WebRTC MediaStream on native). Render it with <TryOnVideo />. */
export interface TryOnStream {
  toURL(): string;
}

/** A catalog garment id (converted to prompt + base64 photo for you) or a raw Decart look. */
export type TryOnLookInput = GarmentId | Look;

/** Honest labels for each state (DESIGN.md §5.4). */
export const TRYON_STATE_LABEL: Record<TryOnState, { label: string; labelVi: string }> = {
  preview: { label: "Camera preview", labelVi: "Xem trước camera" },
  connecting: { label: "Connecting to AI", labelVi: "Đang kết nối AI" },
  live: { label: "Live AI try-on", labelVi: "Đang thử đồ bằng AI" },
  switching: { label: "Switching look", labelVi: "Đang đổi look" },
  lost: { label: "Connection lost", labelVi: "Mất kết nối" },
};

export interface UseTryOnOptions {
  /** From the store. start() is a no-op until true (paid session needs explicit consent). */
  consentGiven?: boolean;
  /** Initial camera. Default "user" (front). */
  facing?: CameraFacing;
  /** Start the camera whenever the screen gains focus. Default false. */
  autoStartCamera?: boolean;
}

export interface TryOnController {
  /** false on web: there is no camera or AI there. */
  isSupported: boolean;
  /** Shown instead of video when not supported (web preview). */
  platformNote: string | null;

  state: TryOnState;
  /** True only while a remote AI stream is live (state live or switching). Drives "AI LIVE" vs "AI OFF". */
  aiLive: boolean;
  statusLabel: string;
  statusLabelVi: string;

  cameraStatus: CameraStatus;
  facing: CameraFacing;
  /** Mirror the video (front camera). Pass to <TryOnVideo mirror>. */
  mirror: boolean;
  localStream: TryOnStream | null;
  /** Decart output. Only meaningful while aiLive. */
  remoteStream: TryOnStream | null;
  /** What to render: the AI stream when live, otherwise the camera preview. */
  videoStream: TryOnStream | null;
  /** True when videoStream is the AI output (label it "AI output"). */
  showingAi: boolean;

  /** Camera, session or look-loading failure, human-readable. */
  error: string | null;
  /** Queue position, reconnecting, cap reached ... */
  notice: string | null;
  /** A stopped session's connect() has not settled yet; keep Start disabled. */
  settling: boolean;
  /** Paid session in progress (connecting, live or switching). */
  sessionActive: boolean;
  /** Seconds left of the 120 s cap (120 when no session). */
  secondsLeft: number;
  maxSeconds: number;
  /** Why start() would do nothing right now, or null when it can start. */
  startBlocker: string | null;

  /** Turns the camera on (asks for permission). Resolves true when it is on. */
  startCamera: () => Promise<boolean>;
  /** Stops the session (if any) and the camera. */
  stopCamera: () => void;
  /** Opens a paid Decart session with this look. Starts the camera if needed. Never throws. */
  start: (look: TryOnLookInput) => Promise<void>;
  /** Changes the garment inside the live session (no reconnect). */
  switchLook: (look: TryOnLookInput) => Promise<void>;
  /** Ends the paid session, keeps the camera preview. */
  stop: (notice?: string) => void;
  /** Flips front/back camera. Ends a running session first (it is bound to the old stream). */
  flip: () => Promise<void>;
  /** Converts catalog photos ahead of time so start/switch are faster. */
  preload: (ids: readonly GarmentId[]) => void;

  /** The app came back from background: camera and AI are off until the user chooses. */
  needsResumeConsent: boolean;
  dismissResumePrompt: () => void;
  /** Dismisses the prompt and turns the camera back on (does NOT restart the paid session). */
  resumeCamera: () => Promise<boolean>;
}
