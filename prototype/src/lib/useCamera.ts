"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraState = "idle" | "requesting" | "live" | "denied" | "unavailable" | "error";

/**
 * Camera only starts from an explicit user tap. Nothing is recorded or uploaded:
 * the stream goes straight into the <video> element and is stopped on unmount.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");
  const [facing, setFacing] = useState<"user" | "environment">("user");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState("idle");
  }, []);

  const start = useCallback(
    async (mode: "user" | "environment" = facing) => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setState("unavailable");
        return;
      }
      setState("requesting");
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 1920 } },
          audio: false,
        });
        streamRef.current = stream;
        setFacing(mode);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setState("live");
      } catch (e) {
        const name = (e as DOMException)?.name;
        if (name === "NotAllowedError" || name === "SecurityError") setState("denied");
        else if (name === "NotFoundError" || name === "OverconstrainedError") setState("unavailable");
        else setState("error");
      }
    },
    [facing],
  );

  const flip = useCallback(() => start(facing === "user" ? "environment" : "user"), [facing, start]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return { videoRef, state, facing, start, stop, flip };
}
