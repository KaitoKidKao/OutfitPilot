// Native try-on controller for the product screens. A thin wrapper over the Gate 1
// modules, which stay untouched:
//   lib/decart.ts           paid Decart session (start / switchLook / stop, 120 s cap)
//   lib/useCamera.ts        WebRTC camera capture (video only)
//   lib/useAppStateGuard.ts stop everything when the app goes to the background
// It adds what screens need: catalog garment -> Decart look (prompt + base64 photo),
// stop-on-blur (leaving the Fitting Room stops camera + session even though the stack
// keeps the screen mounted), a seconds-left tick, and honest status labels.
//
// Web uses lib/tryOnSession.web.ts instead (stub, no camera, no AI).
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { isApiConfigured } from "./api";
import { getGarment, tryOnPrompt, type GarmentId } from "./catalog";
import { hasLiveVideo, MAX_SESSION_MS, useTryOnSession as useDecartSession, type Look } from "./decart";
import { TRYON_STATE_LABEL, type TryOnController, type TryOnLookInput, type UseTryOnOptions } from "./tryOnTypes";
import { useAppStateGuard } from "./useAppStateGuard";
import { useCamera } from "./useCamera";

export * from "./tryOnTypes";

const MAX_SECONDS = Math.round(MAX_SESSION_MS / 1000);

// ---------- catalog garment -> Decart look ----------

const base64Cache = new Map<GarmentId, Promise<string>>();

function mimeFor(path: string): string {
  if (/\.png$/i.test(path)) return "image/png";
  if (/\.webp$/i.test(path)) return "image/webp";
  return "image/jpeg";
}

/** Reads a bundled catalog photo or user file as base64 (the SDK rejects file:// URIs). Cached per garment. */
function garmentBase64(id: GarmentId): Promise<string> {
  const cached = base64Cache.get(id);
  if (cached) return cached;
  const job = (async () => {
    const garment = getGarment(id);
    if (!garment.image) throw new Error(`${garment.name} has no photo yet.`);
    if (typeof garment.image === "number") {
      const asset = await Asset.fromModule(garment.image).downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      if (!uri) throw new Error(`Could not load the photo of ${garment.name}.`);
      return new File(uri).base64();
    }
    const uri = typeof garment.image === "string" ? garment.image : (garment.image as { uri: string }).uri;
    if (!uri) throw new Error(`Could not load photo for ${garment.name}.`);
    return new File(uri).base64();
  })();
  base64Cache.set(id, job);
  job.catch(() => base64Cache.delete(id));
  return job;
}

/** Preloads and caches base64 strings for catalog garments ahead of the Fitting Room. */
export function preloadGarmentPhotos(ids: readonly GarmentId[]): void {
  ids.forEach((id) => {
    garmentBase64(id).catch(() => undefined);
  });
}

async function resolveLook(input: TryOnLookInput): Promise<Look> {
  if (typeof input !== "string") return input;
  const garment = getGarment(input);
  const base64 = await garmentBase64(input);
  return { prompt: tryOnPrompt(garment), image: { kind: "base64", base64, mimeType: mimeFor(garment.imagePath) } };
}

// ---------- hook ----------

export function useTryOnSession(options: UseTryOnOptions = {}): TryOnController {
  const { consentGiven = false, facing: initialFacing = "user", autoStartCamera = false } = options;
  const camera = useCamera(initialFacing);
  const session = useDecartSession();
  const [localError, setLocalError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const { stop: stopSession } = session;
  const { stop: stopCameraRaw, start: startCameraRaw } = camera;

  const sessionActive = session.state === "connecting" || session.state === "live" || session.state === "switching";
  const aiLive = session.state === "live" || session.state === "switching";

  // Background: end the paid session and turn the camera off. No auto-resume.
  const onBackground = useCallback(() => {
    stopSession("Paused because the app went to the background.");
    stopCameraRaw();
  }, [stopSession, stopCameraRaw]);
  const guard = useAppStateGuard(onBackground);

  // Leaving the screen (push to another route, back, or unmount) stops everything.
  useFocusEffect(
    useCallback(() => {
      if (autoStartCamera && AppState.currentState === "active") void startCameraRaw();
      return () => {
        stopSession();
        stopCameraRaw();
      };
    }, [autoStartCamera, startCameraRaw, stopSession, stopCameraRaw]),
  );

  // Countdown tick while a session has a deadline.
  useEffect(() => {
    if (session.endsAt === null) return;
    const tick = () => setNow(Date.now());
    // First tick on the next frame (not synchronously in the effect body), then 4 Hz.
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 250);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [session.endsAt]);

  // A finished session stops the camera track it used. Re-capture so the preview never
  // shows a dead stream (same rule as the Gate 1 harness).
  const wasActiveRef = useRef(false);
  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = sessionActive;
    if (wasActive && !sessionActive && camera.status === "on" && AppState.currentState === "active") {
      void startCameraRaw();
    }
  }, [sessionActive, camera.status, startCameraRaw]);

  const startCamera = useCallback(async () => {
    setLocalError(null);
    return (await startCameraRaw()) !== null;
  }, [startCameraRaw]);

  const stopCamera = useCallback(() => {
    stopSession();
    stopCameraRaw();
  }, [stopSession, stopCameraRaw]);

  const startBlocker = !isApiConfigured()
    ? "The app has no API address (EXPO_PUBLIC_API_URL)."
    : !consentGiven
      ? "Agree to the camera notice first."
      : session.settling
        ? "Closing the previous AI connection…"
        : sessionActive
          ? "A session is already running."
          : null;

  const start = useCallback(
    async (input: TryOnLookInput) => {
      if (startBlocker) {
        setLocalError(startBlocker);
        return;
      }
      setLocalError(null);
      let look: Look;
      try {
        look = await resolveLook(input);
      } catch (e) {
        setLocalError(String((e as Error)?.message ?? e));
        return;
      }
      // Each paid session consumes its camera stream; re-capture if the current one ended.
      const stream = hasLiveVideo(camera.stream) ? camera.stream : await startCameraRaw();
      if (!stream) return;
      await session.start(stream, look);
    },
    [startBlocker, camera.stream, startCameraRaw, session],
  );

  const switchLook = useCallback(
    async (input: TryOnLookInput) => {
      try {
        const look = await resolveLook(input);
        await session.switchLook(look);
      } catch (e) {
        setLocalError(String((e as Error)?.message ?? e));
      }
    },
    [session],
  );

  const flip = useCallback(async () => {
    if (sessionActive) stopSession("Camera flipped. Start again to reconnect the AI.");
    await camera.flip();
  }, [sessionActive, stopSession, camera]);

  const preload = useCallback((ids: readonly GarmentId[]) => {
    ids.forEach((id) => {
      garmentBase64(id).catch(() => undefined);
    });
  }, []);

  const resumeCamera = useCallback(async () => {
    guard.dismissResumePrompt();
    return startCamera();
  }, [guard, startCamera]);

  const showingAi = aiLive && session.remoteStream !== null;
  const secondsLeft = session.endsAt !== null ? Math.max(0, Math.ceil((session.endsAt - now) / 1000)) : MAX_SECONDS;
  const label = TRYON_STATE_LABEL[session.state];

  return {
    isSupported: true,
    platformNote: null,
    state: session.state,
    aiLive,
    statusLabel: label.label,
    statusLabelVi: label.labelVi,
    cameraStatus: camera.status,
    facing: camera.facing,
    mirror: camera.facing === "user",
    localStream: camera.stream,
    remoteStream: session.remoteStream,
    videoStream: showingAi ? session.remoteStream : camera.stream,
    showingAi,
    error: session.error ?? camera.error ?? localError,
    notice: session.notice,
    settling: session.settling,
    sessionActive,
    secondsLeft,
    maxSeconds: MAX_SECONDS,
    startBlocker,
    startCamera,
    stopCamera,
    start,
    switchLook,
    stop: stopSession,
    flip,
    preload,
    needsResumeConsent: guard.needsResumeConsent,
    dismissResumePrompt: guard.dismissResumePrompt,
    resumeCamera,
  };
}
