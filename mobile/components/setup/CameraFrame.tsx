// The 4:3.4 preview frame on Camera Setup (DESIGN.md §6.3), radius 24.
//   off / starting / paused / web  -> authored illustration + status pill
//   on                             -> mirrored local camera preview, dashed lime body
//                                     outline, "Camera preview" pill (AI OFF: nothing is
//                                     streamed from this screen)
//   denied / error                 -> recovery copy inside the same frame
import { CameraOff, RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { TryOnVideo } from "@/components/TryOnVideo";
import { AppText, Button, StatusPill } from "@/components/ui";
import type { TryOnStream } from "@/lib/tryOnTypes";
import { colors, radii } from "@/lib/theme";

import { BodyGuide, CornerMask } from "./BodyGuide";
import { SetupIllustration } from "./SetupIllustration";

export type FrameState = "web" | "off" | "starting" | "paused" | "on" | "denied" | "error";

export const FRAME_ASPECT = 4 / 3.4;

const ILLUSTRATION_LABEL =
  "Illustration: a phone on a stand at chest height, and you standing about 1.5 metres away inside a dashed outline.";

const PILL: Record<Exclude<FrameState, "on" | "denied" | "error">, string> = {
  web: "Camera off",
  off: "Camera off",
  starting: "Opening camera…",
  paused: "Camera paused",
};

const PILL_VI: Record<Exclude<FrameState, "on" | "denied" | "error">, string> = {
  web: "Camera đang tắt",
  off: "Camera đang tắt",
  starting: "Đang mở camera…",
  paused: "Camera tạm dừng",
};

export interface CameraFrameProps {
  state: FrameState;
  stream: TryOnStream | null;
  mirror: boolean;
  /** Raw error from the camera, shown small under the recovery copy. */
  errorDetail?: string | null;
  /** Ask for the camera again (Android can re-prompt after a plain "Deny"). */
  onRetry: () => void;
}

export function CameraFrame({ state, stream, mirror, errorDetail, onRetry }: CameraFrameProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const message = state === "denied" || state === "error";
  const showVideo = state === "on" && stream !== null;

  return (
    <View
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      style={[
        styles.frame,
        message ? [styles.frameMessage, { minHeight: size.width > 0 ? size.width / FRAME_ASPECT : undefined }] : { aspectRatio: FRAME_ASPECT },
      ]}
    >
      {message ? (
        <FrameMessage state={state} errorDetail={errorDetail} onRetry={onRetry} />
      ) : showVideo ? (
        <View
          style={StyleSheet.absoluteFill}
          accessible
          accessibilityRole="image"
          accessibilityLabel="Your camera preview, mirrored. Fit your head to hips inside the dashed outline."
        >
          <TryOnVideo stream={stream} mirror={mirror} objectFit="cover" style={StyleSheet.absoluteFill} />
          <BodyGuide />
          {Platform.OS !== "web" ? <CornerMask width={size.width} height={size.height} radius={radii.hero} /> : null}
        </View>
      ) : (
        <View style={StyleSheet.absoluteFill} accessible accessibilityRole="image" accessibilityLabel={ILLUSTRATION_LABEL}>
          <SetupIllustration />
        </View>
      )}

      {!message ? (
        <StatusPill
          style={styles.pill}
          label={state === "on" ? "Camera preview" : PILL[state]}
          labelVi={state === "on" ? "Xem trước camera" : PILL_VI[state]}
          dot={state === "on" ? "on" : "off"}
          ai={state === "on" ? "off" : null}
        />
      ) : null}
    </View>
  );
}

function FrameMessage({ state, errorDetail, onRetry }: { state: "denied" | "error"; errorDetail?: string | null; onRetry: () => void }) {
  const denied = state === "denied";
  return (
    <View style={styles.message} accessibilityLiveRegion="polite">
      <View style={styles.iconTile}>
        <CameraOff size={22} color={colors.ink} strokeWidth={1.75} />
      </View>
      <View style={styles.messageText} accessibilityRole="alert">
        <AppText variant="section" helper={denied ? "Quyền camera đang tắt" : "Camera chưa khởi động được"}>
          {denied ? "Camera access is off" : "The camera didn't start"}
        </AppText>
        <AppText
          variant="bodySm"
          helper={
            denied
              ? "Chạm Settings bên dưới, bật Camera cho OutfitPilot rồi quay lại app."
              : "Có thể một app khác đang dùng camera. Đóng app đó rồi thử lại."
          }
        >
          {denied
            ? "Tap Settings below, allow Camera for OutfitPilot, then come back here."
            : "Another app may be using it. Close that app, then try again."}
        </AppText>
        {!denied && errorDetail ? (
          <AppText variant="caption" tone="muted" numberOfLines={2}>
            {errorDetail}
          </AppText>
        ) : null}
      </View>
      {denied ? (
        <View style={styles.messageActions}>
          <Button label="Ask again" labelVi="Hỏi lại quyền" icon={RotateCcw} variant="quiet" onPress={onRetry} accessibilityHint="Asks for camera access again" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    borderRadius: radii.hero,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  frameMessage: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  pill: { position: "absolute", top: 12, left: 12, maxWidth: "80%" },
  message: { flex: 1, padding: 20, gap: 14, justifyContent: "center" },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: { gap: 8 },
  messageActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
