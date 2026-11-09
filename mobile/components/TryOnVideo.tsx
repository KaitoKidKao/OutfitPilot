// Renders a try-on stream (camera preview or Decart output) with RTCView.
// Web uses components/TryOnVideo.web.tsx (renders nothing; there is no stream there).
import { RTCView } from "@livekit/react-native-webrtc";
import type { StyleProp, ViewStyle } from "react-native";

import type { TryOnStream } from "@/lib/tryOnTypes";

export interface TryOnVideoProps {
  stream: TryOnStream | null;
  /** Mirror for the front camera (the SDK's own mirror option is browser-only). */
  mirror?: boolean;
  /** Default "cover". */
  objectFit?: "cover" | "contain";
  style?: StyleProp<ViewStyle>;
  /** Android surface z-order. Default 0. */
  zOrder?: number;
}

export function TryOnVideo({ stream, mirror = false, objectFit = "cover", style, zOrder = 0 }: TryOnVideoProps) {
  if (!stream) return null;
  return <RTCView streamURL={stream.toURL()} mirror={mirror} objectFit={objectFit} zOrder={zOrder} style={style} />;
}
