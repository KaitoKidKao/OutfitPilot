// Web stub of lib/tryOnSession.ts. Web exists only to screenshot screens; the camera
// and the Decart session run only in the native app. Always "preview", never AI.
import { useCallback } from "react";

import type { GarmentId } from "./catalog";
import { TRYON_STATE_LABEL, type TryOnController, type TryOnLookInput, type UseTryOnOptions } from "./tryOnTypes";

export * from "./tryOnTypes";

const NOTE = "Web preview — camera and AI run only in the app";
const MAX_SECONDS = 60;

export function preloadGarmentPhotos(_ids: readonly GarmentId[]): void {
  // No-op on web preview.
}

export function useTryOnSession(_options: UseTryOnOptions = {}): TryOnController {
  const noopAsync = useCallback(async () => undefined, []);
  const falseAsync = useCallback(async () => false, []);
  const noop = useCallback(() => undefined, []);
  const noLook = useCallback(async (_look: TryOnLookInput) => undefined, []);
  const noPreload = useCallback((_ids: readonly GarmentId[]) => undefined, []);
  const identityAsync = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => fn(), []);

  return {
    isSupported: false,
    platformNote: NOTE,
    state: "preview",
    aiLive: false,
    statusLabel: TRYON_STATE_LABEL.preview.label,
    statusLabelVi: TRYON_STATE_LABEL.preview.labelVi,
    cameraStatus: "off",
    facing: "user",
    mirror: true,
    localStream: null,
    remoteStream: null,
    videoStream: null,
    showingAi: false,
    error: null,
    notice: NOTE,
    settling: false,
    sessionActive: false,
    secondsLeft: MAX_SECONDS,
    maxSeconds: MAX_SECONDS,
    startBlocker: NOTE,
    startCamera: falseAsync,
    stopCamera: noop,
    start: noLook,
    switchLook: noLook,
    stop: noop,
    flip: noopAsync,
    preload: noPreload,
    needsResumeConsent: false,
    dismissResumePrompt: noop,
    resumeCamera: falseAsync,
    runWithoutGuard: identityAsync,
  };
}
