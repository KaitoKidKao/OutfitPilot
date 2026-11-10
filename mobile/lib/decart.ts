// The ONLY module that touches @decartai/sdk.
//
// Flow (docs/plan.md "Tích hợp AI try-on"):
//   app --POST /api/realtime-token--> our API --(permanent key)--> Decart
//   app <==== camera video / try-on video over WebRTC ====> Decart (direct)
// The app never holds a permanent key: apiKeyProvider hands the SDK a short-lived
// client token from our API, reused across redials and re-minted near expiry.
//
// Source of the API shapes used here: @decartai/sdk 0.2.14 type definitions
// (node_modules/@decartai/sdk/dist) and DecartAI/decart-example-expo-realtime.
// Anything not confirmed there is marked TODO(verify).

import {
  createDecartClient,
  ERROR_CODES,
  isRealtimeModel,
  models,
  resolveFpsNumber,
  type ConnectionState,
  type DecartSDKError,
  type RealTimeClient,
  type SessionEnded,
} from "@decartai/sdk";
import type { MediaStream } from "@livekit/react-native-webrtc";
import { LocalParticipant } from "livekit-client";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { ApiError, describeApiError, postRealtimeToken, type RealtimeTokenResponse } from "./api";

// Disable LiveKit multi-layer simulcast for 1-to-1 AI try-on rooms.
// @decartai/sdk enables 3-layer simulcast for VP8/H264 by default, which causes
// software encoding on Android/emulators to exceed LiveKit's 15 s negotiation timeout.
const origPublishTrack = LocalParticipant.prototype.publishTrack;
LocalParticipant.prototype.publishTrack = function (track, options) {
  const opts = { ...options, simulcast: false };
  return origPublishTrack.call(this, track, opts);
};

// ---------- Model + camera capture ----------

/** Fallback only; the server's token response names the model to use. */
export const DEFAULT_MODEL = "lucy-vton-3.6" as const;

const defaultModel = models.realtime(DEFAULT_MODEL);

/** Camera constraints that match the model (lucy-vton-3.6: 1280x720 @ 30 fps). */
export const CAMERA_CAPTURE = {
  fps: resolveFpsNumber(defaultModel.fps),
  width: defaultModel.width,
  height: defaultModel.height,
} as const;

/** Hard cap per paid session (DESIGN.md / plan: 120 s). The server token TTL is the backstop. */
export const MAX_SESSION_MS = 120_000;

function resolveModel(name: string) {
  if (!isRealtimeModel(name)) {
    throw new Error(`The API returned model "${name}", which @decartai/sdk 0.2.14 does not know.`);
  }
  return models.realtime(name);
}

// ---------- Garment image adapter ----------

/**
 * A garment image in a form the SDK accepts on React Native.
 * - base64: e.g. from expo-image-picker with `base64: true`.
 * - https: a public https URL; the SDK fetches it and base64-encodes it.
 * file:// and blob: URIs are NOT accepted by the SDK ("Unsupported image URL scheme").
 */
export type GarmentImage =
  | { kind: "base64"; base64: string; mimeType?: string }
  | { kind: "https"; url: string };

/** Size above which we warn; Decart's real limit is unknown. */
const LARGE_IMAGE_BASE64_CHARS = 4_000_000; // ~3 MB of image bytes

/**
 * Converts our GarmentImage into the value passed to set({ image }) / initialState.image.
 *
 * TODO(verify on device, Gate 1):
 *  - We send a data: URL string because the SDK decodes it locally (utils/media.ts).
 *    Whether React Native Blob objects work with set() is UNVERIFIED, so we avoid Blobs.
 *  - Garment image size / format / resolution limits for lucy-vton-3.6 are UNVERIFIED.
 *    Plan says JPEG/PNG/WebP, ideally >= 512x512, plain background.
 *  - Alternative not tried yet: client.files.upload({ uri, type, name }) -> "file_..." id,
 *    which set() sends as a server-side reference.
 */
export function toDecartImage(image: GarmentImage): string {
  if (image.kind === "https") {
    if (!image.url.startsWith("https://")) throw new Error("Garment image URL must be https://");
    return image.url;
  }
  const base64 = image.base64.replace(/^data:[^,]*,/, "");
  if (!base64) throw new Error("Garment image is empty.");
  if (base64.length > LARGE_IMAGE_BASE64_CHARS) {
    console.warn(`[decart] garment image is large (${Math.round(base64.length / 1024)} KB base64); Decart limits are unverified.`);
  }
  return `data:${image.mimeType ?? "image/jpeg"};base64,${base64}`;
}

// ---------- Session state ----------

/** UI-facing states (DESIGN.md "Không giả lập trạng thái AI"). */
export type TryOnState = "preview" | "connecting" | "live" | "switching" | "lost";

export interface Look {
  prompt: string;
  image: GarmentImage;
}

export interface StartOptions {
  /** "fast": US region only, billed at 2x. Chosen at connect time; set() cannot change it. */
  speed?: "fast";
}

export interface TryOnSnapshot {
  state: TryOnState;
  /** Decart's output stream. Only show it while state is "live" or "switching". */
  remoteStream: MediaStream | null;
  /** Last failure, human-readable. */
  error: string | null;
  /** Informational line (queue position, reconnecting, session cap reached ...). */
  notice: string | null;
  /** Model name actually used for this session. */
  model: string | null;
  /** Epoch ms when the 120 s cap stops the session; null when not connected. */
  endsAt: number | null;
  /**
   * True while a connect() from a stopped session has not settled yet. The SDK has
   * no abort for connect(), so Start stays disabled until it does (no overlapping paid sessions).
   */
  settling: boolean;
}

const INITIAL: TryOnSnapshot = {
  state: "preview",
  remoteStream: null,
  error: null,
  notice: null,
  model: null,
  endsAt: null,
  settling: false,
};

const SDK_ERROR_CODES: readonly string[] = Object.values(ERROR_CODES);

function isSdkError(e: unknown): e is DecartSDKError {
  return typeof e === "object" && e !== null && typeof (e as { code?: unknown }).code === "string" && SDK_ERROR_CODES.includes((e as { code: string }).code);
}

function describeSdkError(e: DecartSDKError): string {
  switch (e.code) {
    case ERROR_CODES.REACT_NATIVE_SETUP_REQUIRED:
      return "WebRTC globals missing: registerGlobals() did not run before the app (see index.ts).";
    case ERROR_CODES.UNSUPPORTED_PLATFORM_FEATURE:
      return `Not supported on React Native: ${e.message}`;
    case ERROR_CODES.INVALID_API_KEY:
    case ERROR_CODES.TOKEN_EXPIRED:
    case ERROR_CODES.TOKEN_INVALID:
      return "Token kết nối AI không hợp lệ hoặc đã hết hạn · Invalid or expired AI token.";
    case ERROR_CODES.WEBRTC_WEBSOCKET_ERROR:
    case ERROR_CODES.WEBRTC_ICE_ERROR:
    case ERROR_CODES.WEBRTC_TIMEOUT_ERROR:
    case ERROR_CODES.WEBRTC_SIGNALING_ERROR:
      return "Lỗi mạng khi kết nối tới AI. Hãy kiểm tra kết nối mạng · Network problem reaching the AI. Try a stronger connection.";
    case ERROR_CODES.WEBRTC_SERVER_ERROR:
      return "Dịch vụ AI phản hồi lỗi tạm thời. Vui lòng thử lại · The AI service returned an error. Please try again.";
    default:
      return `${e.message}`;
  }
}

function describeError(e: unknown): string {
  if (e instanceof ApiError) return describeApiError(e);
  if (isSdkError(e)) {
    if (e.cause instanceof ApiError) return describeApiError(e.cause);
    return describeSdkError(e);
  }
  return String((e as Error)?.message ?? e);
}

function describeSessionEnd(ended: SessionEnded): string {
  switch (ended.reason) {
    case "moderation_violation":
      return "Phiên kết thúc do vi phạm kiểm duyệt nội dung · AI ended the session (content moderation).";
    case "policy_violation":
      return "Phiên kết thúc do chính sách nhà cung cấp · AI ended the session (policy).";
    case "insufficient_credits":
      return "Tài khoản Decart AI đã hết lượt thử đồ · Decart account is out of credits.";
    case "session_limit":
      // SDK 0.2.14: the API key's CONCURRENT-session limit (close 1013), not the 120 s cap.
      return "Đang có phiên AI khác mở, hãy đợi vài giây rồi thử lại · Another AI session is still open. Wait a few seconds and try again.";
    default:
      return `Phiên thử kết thúc · Session ended (${ended.reason}).`;
  }
}

/** Mint a new token once the cached one is this close to expiry. */
const TOKEN_REUSE_MARGIN_MS = 15_000;

/**
 * Thrown by apiKeyProvider for a session the user already stopped. The message must
 * contain "not allowed": @decartai/sdk 0.2.14 treats that substring as a permanent
 * error (config-realtime.js permanentErrorSubstrings) and stops redialing at once.
 */
const STALE_SESSION_MESSAGE = "Session stopped by the user: redial not allowed.";

/**
 * The camera stream handed to connect() is consumed by the session: on disconnect the
 * SDK's LiveKit room unpublishes it with livekit-client's default
 * stopLocalTrackOnUnpublish: true, which stops (disables) the camera track. We also stop
 * it ourselves on stop()/fail() so video stops flowing even while connect() is still
 * in flight. The caller must capture a fresh stream for the next session.
 */
const originalTrackStop = new WeakMap<object, () => void>();

/**
 * Shields local camera tracks from being stopped by livekit-client's internal
 * unpublish during automatic SDK reconnects; stopStreamTracks() restores and
 * invokes the real stop() when the session genuinely tears down.
 */
function shieldStreamTracks(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => {
    if (!originalTrackStop.has(track)) {
      originalTrackStop.set(track, track.stop.bind(track));
      track.stop = () => undefined;
    }
  });
}

function stopStreamTracks(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => {
    try {
      const orig = originalTrackStop.get(track);
      if (orig) {
        track.stop = orig;
        originalTrackStop.delete(track);
      }
      track.stop();
    } catch {
      // already stopped
    }
  });
}

/** True when the stream still has a live video track (a stopped track sends black frames). */
export function hasLiveVideo(stream: MediaStream | null | undefined): stream is MediaStream {
  const track = stream?.getVideoTracks()[0];
  return !!track && track.readyState === "live";
}

export class TryOnSession {
  private snapshot: TryOnSnapshot = INITIAL;
  private readonly listeners = new Set<() => void>();
  /** Bumped on every start/stop; async results from an older generation are dropped. */
  private generation = 0;
  private client: RealTimeClient | null = null;
  private remote: MediaStream | null = null;
  private capTimer: ReturnType<typeof setTimeout> | null = null;
  /** Camera stream used by the current session; stopped in teardown(). */
  private localStream: MediaStream | null = null;
  /** connect() calls that have not resolved or rejected yet (current or stale). */
  private pendingConnects = 0;

  // ----- store plumbing (useSyncExternalStore) -----

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): TryOnSnapshot => this.snapshot;

  private patch(next: Partial<TryOnSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...next, settling: this.pendingConnects > 0 };
    this.listeners.forEach((l) => l());
  }

  // ----- public API -----

  /**
   * Opens a paid Decart session. Call only after an explicit user action (consent + Start).
   * Resolves when connected or failed; never throws (failures land in state "lost").
   */
  start = async (localStream: MediaStream, look: Look, options: StartOptions = {}): Promise<void> => {
    if (this.snapshot.state !== "preview" && this.snapshot.state !== "lost") return;
    if (this.pendingConnects > 0) return; // a stopped session's connect() has not settled yet
    const gen = ++this.generation;
    this.remote = null;
    this.patch({ state: "connecting", remoteStream: null, error: null, notice: null, endsAt: null });

    if (!hasLiveVideo(localStream)) {
      this.fail("The camera stream has ended. Turn the camera on again.");
      return;
    }
    this.localStream = localStream;
    shieldStreamTracks(localStream);

    try {
      const image = toDecartImage(look.image);

      // Pre-fetch one token so we learn which model the server scoped it to.
      let cached: RealtimeTokenResponse = await postRealtimeToken();
      if (gen !== this.generation) return;
      const model = resolveModel(cached.model);
      this.patch({ model: model.name });

      const decart = createDecartClient({
        // Called before every dial, retry and reconnect. Reuse the cached token until it
        // is near expiry so SDK redials do not burn the API's per-IP token rate limit.
        // TODO(verify on device, Gate 1): that Decart accepts the same client token for
        // more than one dial within its TTL. If not, mint a fresh token per call here.
        apiKeyProvider: async () => {
          if (gen !== this.generation) throw new Error(STALE_SESSION_MESSAGE);
          if (Date.parse(cached.expiresAt) - Date.now() <= TOKEN_REUSE_MARGIN_MS) {
            const fresh = await postRealtimeToken();
            if (gen !== this.generation) throw new Error(STALE_SESSION_MESSAGE);
            cached = fresh;
          }
          return cached.token;
        },
      });

      const CONNECT_TIMEOUT_MS = 18_000;
      this.pendingConnects++;
      // Promise.resolve().then: a synchronous throw from connect() becomes a rejection,
      // so the pendingConnects bookkeeping below always runs.
      const connectPromise = Promise.resolve().then(() =>
        decart.realtime.connect<MediaStream>(localStream, {
          model,
          // Native camera capture uses VP8. `mirror` is browser-only and throws on
          // React Native, so the preview is mirrored in RTCView instead.
          preferredVideoCodec: "vp8",
          ...(options.speed ? { speed: options.speed } : {}),
          // set() replaces the whole state, so prompt and image always travel together.
          initialState: { image, prompt: { text: look.prompt, enhance: false } },
          onRemoteStream: (stream) => this.onRemoteStream(gen, stream),
          onConnectionChange: (state) => this.onConnectionChange(gen, state),
          onQueuePosition: ({ position, queueSize }) => {
            if (gen === this.generation) this.patch({ notice: `Đang chờ: ${position}/${queueSize} · In queue: ${position} of ${queueSize}` });
          },
          onCapacityWait: ({ retryAfterMs }) => {
            if (gen === this.generation) this.patch({ notice: `Hệ thống bận, thử lại sau ${Math.ceil(retryAfterMs / 1000)}s · AI busy, retrying in ${Math.ceil(retryAfterMs / 1000)}s` });
          },
        }),
      );
      // pendingConnects follows the REAL connect(), not the timeout race: start() stays
      // blocked until it settles, so a retry can never open a second paid session.
      void connectPromise
        .then(
          () => undefined,
          () => undefined,
        )
        .finally(() => {
          this.pendingConnects--;
          this.patch({});
        });

      let timedOut = false;
      let connectTimer: ReturnType<typeof setTimeout> | undefined;
      let realtime: RealTimeClient;
      try {
        realtime = await Promise.race([
          connectPromise,
          new Promise<never>((_, reject) => {
            connectTimer = setTimeout(() => {
              timedOut = true;
              reject(new Error("Quá thời gian kết nối AI (18s) · AI connection timed out"));
            }, CONNECT_TIMEOUT_MS);
          }),
        ]);
      } catch (e) {
        if (timedOut) {
          // The real connect() may still succeed after the deadline: close that session
          // the moment it arrives so it is never left running (and billed) unseen.
          void connectPromise.then(
            (late) => late.disconnect(),
            () => undefined,
          );
        }
        throw e;
      } finally {
        clearTimeout(connectTimer);
      }

      if (gen !== this.generation) {
        // stop() was called while connecting.
        realtime.disconnect();
        return;
      }

      this.client = realtime;
      realtime.on("error", (err) => {
        if (gen === this.generation) this.patch({ error: describeError(err) });
      });
      realtime.on("sessionEnded", (ended) => {
        // Terminal: the SDK will not reconnect.
        if (gen === this.generation) this.fail(describeSessionEnd(ended));
      });

      const endsAt = Date.now() + MAX_SESSION_MS;
      this.capTimer = setTimeout(() => {
        if (gen === this.generation) this.stop("Session stopped at the 2-minute limit.");
      }, MAX_SESSION_MS);

      this.patch({
        endsAt,
        notice: this.remote ? null : "Connected. Waiting for the first AI frame…",
        state: this.remote ? "live" : "connecting",
        remoteStream: this.remote,
      });
    } catch (e) {
      if (gen !== this.generation) return;
      this.fail(describeError(e));
    }
  };

  /** Changes the garment inside the running session (no reconnect). */
  switchLook = async (look: Look): Promise<void> => {
    const client = this.client;
    if (!client || this.snapshot.state !== "live") return;
    const gen = this.generation;
    this.patch({ state: "switching", notice: "Đang đổi look · Updating look…", error: null });
    try {
      const SET_TIMEOUT_MS = 10_000;
      await Promise.race([
        client.set({ prompt: look.prompt, enhance: false, image: toDecartImage(look.image) }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Quá thời gian đổi look (10s) · Switch look timed out")), SET_TIMEOUT_MS)
        ),
      ]);
      if (gen === this.generation && this.currentState() === "switching") this.patch({ state: "live", notice: null });
    } catch (e) {
      if (gen !== this.generation) return;
      this.patch({
        state: this.currentState() === "switching" ? "live" : this.currentState(),
        notice: null,
        error: `Không thể đổi look · Could not switch look: ${describeError(e)}`,
      });
    }
  };

  /** Ends the paid session (if any) and returns to camera preview. Safe to call any time. */
  stop = (notice?: string): void => {
    this.generation++;
    this.teardown();
    this.patch({ ...INITIAL, notice: notice ?? null });
  };

  // ----- internals -----

  /** Read through a method so TypeScript does not keep a stale narrowing across awaits. */
  private currentState(): TryOnState {
    return this.snapshot.state;
  }

  private teardown(): void {
    if (this.capTimer) clearTimeout(this.capTimer);
    this.capTimer = null;
    const client = this.client;
    this.client = null;
    this.remote = null;
    try {
      client?.disconnect();
    } catch (e) {
      console.warn("[decart] disconnect failed", e);
    }
    // Also covers a connect() still in flight: its published track sends nothing from now on.
    stopStreamTracks(this.localStream);
    this.localStream = null;
  }

  private fail(message: string): void {
    this.generation++;
    this.teardown();
    this.patch({ ...INITIAL, model: this.snapshot.model, state: "lost", error: message });
  }

  private onRemoteStream(gen: number, stream: MediaStream): void {
    if (gen !== this.generation) return;
    this.remote = stream;
    if (this.client && this.snapshot.state === "connecting") {
      this.patch({ state: "live", remoteStream: stream, notice: null });
    } else {
      this.patch({ remoteStream: stream });
    }
  }

  private onConnectionChange(gen: number, state: ConnectionState): void {
    if (gen !== this.generation) return;
    switch (state) {
      case "connected":
      case "generating":
        if (this.client && this.remote && this.snapshot.state === "connecting") {
          this.patch({ state: "live", notice: null });
        }
        break;
      case "reconnecting":
        // The SDK reconnects by itself; show the camera preview meanwhile (honest label).
        if (this.client) this.patch({ state: "connecting", notice: "Connection dropped. Reconnecting…" });
        break;
      case "disconnected":
        // Before connect() resolves the SDK may still be retrying; connect() rejects if it gives up.
        if (this.client) this.fail(this.snapshot.error ?? "Connection to the AI was lost.");
        break;
      default:
        break;
    }
  }
}

/** One TryOnSession per mounted screen; stops the paid session on unmount. */
export function useTryOnSession() {
  const session = useMemo(() => new TryOnSession(), []);
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(() => () => session.stop(), [session]);
  return { ...snapshot, start: session.start, switchLook: session.switchLook, stop: session.stop };
}
