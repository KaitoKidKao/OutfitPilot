// Camera capture through LiveKit's WebRTC fork (plain react-native-webrtc is not
// supported by Decart). Video only: audio is never requested.
//
// getUserMedia asks for the camera permission itself (Android runtime prompt;
// iOS system prompt using NSCameraUsageDescription from app.json).
import { mediaDevices, type MediaStream } from "@livekit/react-native-webrtc";
import { useCallback, useEffect, useRef, useState } from "react";

import { CAMERA_CAPTURE } from "./decart";

export type Facing = "user" | "environment";
export type CameraStatus = "off" | "starting" | "on" | "denied" | "error";

function releaseStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // already stopped
    }
  });
  try {
    stream.release();
  } catch {
    // already released
  }
}

export function useCamera(initialFacing: Facing = "user") {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>(initialFacing);
  const [status, setStatus] = useState<CameraStatus>("off");
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const facingRef = useRef<Facing>(initialFacing);
  /** Guards against a slow getUserMedia resolving after stop()/unmount. */
  const generationRef = useRef(0);

  /** (Re)captures the camera. Resolves with the new stream, or null on failure / if superseded. */
  const start = useCallback(async (mode: Facing = facingRef.current): Promise<MediaStream | null> => {
    const gen = ++generationRef.current;
    releaseStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setStatus("starting");
    setError(null);
    try {
      const next = await mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: mode,
          frameRate: CAMERA_CAPTURE.fps,
          width: CAMERA_CAPTURE.width,
          height: CAMERA_CAPTURE.height,
        },
      });
      if (gen !== generationRef.current) {
        releaseStream(next);
        return null;
      }
      streamRef.current = next;
      facingRef.current = mode;
      setFacing(mode);
      setStream(next);
      setStatus("on");
      return next;
    } catch (e) {
      if (gen !== generationRef.current) return null;
      const name = (e as { name?: string })?.name;
      const message = String((e as Error)?.message ?? e);
      const denied = name === "SecurityError" || name === "NotAllowedError" || /permission/i.test(message);
      setStatus(denied ? "denied" : "error");
      setError(
        denied
          ? "Camera permission denied. Enable it in Settings to try on. · Hãy bật quyền camera trong Cài đặt."
          : `Camera could not start: ${message}`,
      );
      return null;
    }
  }, []);

  /** Stops every track and releases the native stream. */
  const stop = useCallback(() => {
    generationRef.current++;
    releaseStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setStatus("off");
  }, []);

  /** Flips front/back by recapturing the stream. Callers must reconnect anything using the old stream. */
  const flip = useCallback(async (): Promise<MediaStream | null> => {
    const next: Facing = facingRef.current === "user" ? "environment" : "user";
    return start(next);
  }, [start]);

  useEffect(() => {
    return () => {
      generationRef.current++;
      releaseStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  return { stream, facing, status, error, start, stop, flip };
}
