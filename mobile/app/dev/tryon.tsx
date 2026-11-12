// DEV HARNESS for Gate 1 ("real AI video on iPhone and Android").
// This is deliberately plain: it exists to prove camera -> Decart Lucy VTON -> video
// works on physical devices. The real 5-screen UI (Choose Occasion, AI Picks,
// Camera Setup, Live Fitting Room, Final Look) will be designed later from DESIGN.md.
//
// Honesty rules kept here: "AI OFF" until the AI stream is actually live, no fake
// output, and no paid session without an explicit consent + Start tap.
import { RTCView } from "@livekit/react-native-webrtc";
import * as ImagePicker from "expo-image-picker";
import { useSafeKeepAwake } from "@/lib/useSafeKeepAwake";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_URL, describeApiError, getHealth, isApiConfigured } from "@/lib/api";
import { CATALOG, tryOnPrompt } from "@/lib/catalog";
import { hasLiveVideo, MAX_SESSION_MS, useTryOnSession, type TryOnState } from "@/lib/decart";
import { colors, radii, shadowDock, spacing, type } from "@/lib/theme";
import { useAppStateGuard } from "@/lib/useAppStateGuard";
import { useCamera } from "@/lib/useCamera";

const STATE_LABEL: Record<TryOnState, string> = {
  preview: "Camera preview",
  connecting: "Connecting to AI",
  live: "Live AI try-on",
  switching: "Switching look",
  lost: "Connection lost",
};

const DEFAULT_PROMPT = CATALOG[0] ? tryOnPrompt(CATALOG[0]) : "";

interface PickedGarment {
  uri: string;
  base64: string;
  mimeType: string;
}

type Tone = "lime" | "ink" | "paper" | "quiet";

function Btn(props: { label: string; onPress: () => void; tone: Tone; disabled?: boolean; style?: StyleProp<ViewStyle>; hint?: string }) {
  const { label, onPress, tone, disabled, style, hint } = props;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, btnTone[tone], pressed && btnPressed[tone], disabled && styles.btnDisabled, style]}
    >
      <Text style={[styles.btnText, { color: tone === "ink" ? colors.paper : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export default function TryOnHarness() {
  useSafeKeepAwake();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const camera = useCamera("user");
  const tryOn = useTryOnSession();

  const [consent, setConsent] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [garment, setGarment] = useState<PickedGarment | null>(null);
  const [fast, setFast] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [health, setHealth] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const { stop: stopSession } = tryOn;
  const { stop: stopCamera, start: startCamera } = camera;

  // Leaving the foreground ends the paid session and turns the camera off.
  const onBackground = useCallback(() => {
    stopSession("Paused because the app went to the background.");
    stopCamera();
  }, [stopSession, stopCamera]);
  const guard = useAppStateGuard(onBackground);

  // Countdown tick while a session has a deadline.
  useEffect(() => {
    if (tryOn.endsAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [tryOn.endsAt]);

  const sessionActive = tryOn.state === "connecting" || tryOn.state === "live" || tryOn.state === "switching";

  // A finished session leaves the camera track stopped (the SDK's LiveKit room stops it on
  // disconnect, and TryOnSession stops it too). Re-capture so the preview never shows a dead
  // stream. Skipped when the camera was turned off or is already restarting (background, flip).
  const wasActiveRef = useRef(false);
  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = sessionActive;
    if (wasActive && !sessionActive && camera.status === "on" && AppState.currentState === "active") {
      void startCamera();
    }
  }, [sessionActive, camera.status, startCamera]);
  const aiLive = tryOn.state === "live" || tryOn.state === "switching";
  const showRemote = aiLive && tryOn.remoteStream !== null;
  const streamURL = showRemote ? tryOn.remoteStream?.toURL() : camera.stream?.toURL();
  const secondsLeft = tryOn.endsAt !== null ? Math.max(0, Math.ceil((tryOn.endsAt - now) / 1000)) : Math.round(MAX_SESSION_MS / 1000);

  const look = garment && prompt.trim() ? { prompt: prompt.trim(), image: { kind: "base64" as const, base64: garment.base64, mimeType: garment.mimeType } } : null;

  const canStart =
    consent && camera.status === "on" && look !== null && isApiConfigured() && !tryOn.settling && (tryOn.state === "preview" || tryOn.state === "lost");
  const startBlocker = !isApiConfigured()
    ? "Set EXPO_PUBLIC_API_URL first (https:// outside development builds)."
    : camera.status !== "on"
      ? "Turn on the camera first."
      : tryOn.settling
        ? "Closing the previous AI connection…"
      : !consent
        ? "Tick the consent box first."
        : !garment
          ? "Pick a garment photo first."
          : !prompt.trim()
            ? "Write a prompt first."
            : null;

  const onStart = async () => {
    if (!look) return;
    setLocalError(null);
    // Each paid session consumes its camera stream; re-capture if the current one has ended.
    const stream = hasLiveVideo(camera.stream) ? camera.stream : await startCamera();
    if (!stream) return;
    void tryOn.start(stream, look, fast ? { speed: "fast" } : {});
  };

  const onSwitch = () => {
    if (!look) return;
    void tryOn.switchLook(look);
  };

  const onFlip = async () => {
    // The Decart session is bound to the old stream; end it rather than silently reconnecting (paid).
    if (sessionActive) stopSession("Camera flipped. Tap Start AI try-on to reconnect.");
    await camera.flip();
  };

  const onPick = () => {
    // Never pick during a paid session: on iOS the picker is an in-app modal, so leaving
    // the app from it must still hit the background guard with nothing billing.
    if (sessionActive) return Promise.resolve();
    return guard.runWithoutGuard(async () => {
      setLocalError(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.7,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.base64) {
        setLocalError("The picker returned no image data. Try another photo.");
        return;
      }
      setGarment({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType ?? "image/jpeg" });
    });
  };

  const onHealth = async () => {
    setHealth("Checking…");
    try {
      await getHealth();
      setHealth("API reachable (ok: true).");
    } catch (e) {
      setHealth(describeApiError(e));
    }
  };

  const onResumeCamera = () => {
    guard.dismissResumePrompt();
    void startCamera();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>‹</Text>
          </Pressable>
          <View style={styles.pill} accessibilityLiveRegion="polite" accessibilityLabel={`Status: ${STATE_LABEL[tryOn.state]}`}>
            <View style={[styles.dot, { backgroundColor: aiLive ? colors.lime : camera.status === "on" ? colors.paper : colors.mutedDark }]} />
            <Text style={styles.pillText}>{STATE_LABEL[tryOn.state]}</Text>
            <Text style={[styles.pillText, styles.aiChip]}>{aiLive ? "AI LIVE" : "AI OFF"}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
            disabled={camera.status !== "on"}
            onPress={onFlip}
            style={[styles.iconBtn, camera.status !== "on" && styles.btnDisabled]}
          >
            <Text style={styles.iconBtnText}>⟲</Text>
          </Pressable>
        </View>

        {/* Video */}
        <View style={styles.videoBox}>
          {streamURL ? (
            // Mirror in the view (both local and AI output) for the front camera:
            // the SDK `mirror` option is rejected on React Native.
            <RTCView streamURL={streamURL} mirror={camera.facing === "user"} objectFit="cover" zOrder={0} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.videoEmpty}>
              <Text style={styles.videoEmptyText}>{camera.status === "starting" ? "Starting camera…" : "Camera off"}</Text>
            </View>
          )}
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>{showRemote ? "AI output · Decart" : "Your camera · preview only"}</Text>
          </View>
          {sessionActive && tryOn.endsAt !== null && (
            <Text style={styles.countdown} accessibilityLabel={`${secondsLeft} seconds left`}>
              {secondsLeft}s
            </Text>
          )}
        </View>

        {tryOn.notice && <Text style={styles.notice}>{tryOn.notice}</Text>}
        {(tryOn.error || camera.error || localError) && (
          <Text style={styles.error} accessibilityRole="alert">
            {tryOn.error ?? camera.error ?? localError}
          </Text>
        )}

        {guard.needsResumeConsent && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardBody}>The camera and AI were turned off while the app was in the background. Nothing reconnects until you choose.</Text>
            <Text style={styles.cardHelper}>Camera và AI đã tắt khi app chạy nền. Chỉ bật lại khi bạn đồng ý.</Text>
            <View style={styles.row}>
              <Btn label="Turn camera on" tone="paper" onPress={onResumeCamera} style={styles.flex} />
              <Btn label="Not now" tone="quiet" onPress={guard.dismissResumePrompt} style={styles.flex} />
            </View>
          </View>
        )}

        {/* Consent */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Before you start</Text>
          <Text style={styles.cardBody}>
            While an AI session runs, your camera video is sent directly to Decart, the AI try-on service, to draw the garment on you. Nothing is recorded or saved by OutfitPilot. A session stops after 2 minutes, when you tap Stop, leave this screen, or the app goes to the background. The result is a visual preview, not a size or fit guarantee.
          </Text>
          <Text style={styles.cardHelper}>
            Khi phiên AI chạy, hình camera được gửi thẳng tới Decart để mặc thử. OutfitPilot không ghi hay lưu video. Phiên tự dừng sau 2 phút.
          </Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
            accessibilityLabel="I understand and agree to send camera video to the AI during the session"
            onPress={() => setConsent((c) => !c)}
            style={styles.checkRow}
          >
            <View style={[styles.checkbox, consent && styles.checkboxOn]}>{consent && <Text style={styles.checkMark}>✓</Text>}</View>
            <Text style={styles.checkLabel}>I understand · Tôi đồng ý</Text>
          </Pressable>
        </View>

        {/* Camera */}
        {camera.status !== "on" ? (
          <Btn label={camera.status === "starting" ? "Starting camera…" : "Turn on camera"} tone="paper" disabled={camera.status === "starting"} onPress={() => void startCamera()} />
        ) : null}

        {/* Garment + prompt */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Garment</Text>
          <View style={styles.row}>
            {garment ? (
              <Image source={{ uri: garment.uri }} style={styles.thumb} accessibilityLabel="Selected garment photo" />
            ) : (
              <View style={[styles.thumb, styles.thumbEmpty]}>
                <Text style={styles.thumbEmptyText}>Empty</Text>
              </View>
            )}
            <View style={styles.flex}>
              <Btn
                label={garment ? "Replace photo" : "Pick garment photo"}
                tone="quiet"
                disabled={sessionActive}
                hint={sessionActive ? "Stop the AI session to change the photo" : undefined}
                onPress={() => void onPick()}
              />
              <Text style={styles.cardHelper}>Plain background, garment only. Use photos you are allowed to use.</Text>
            </View>
          </View>

          <Text style={[styles.cardTitle, styles.mt]}>Prompt</Text>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe only the garment"
            placeholderTextColor={colors.mutedDark}
            style={styles.input}
            multiline
            accessibilityLabel="Try-on prompt"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {CATALOG.map((g) => (
              <Pressable key={g.id} accessibilityRole="button" accessibilityLabel={`Use prompt for ${g.name}`} onPress={() => setPrompt(tryOnPrompt(g))} style={styles.chip}>
                <Text style={styles.chipText}>
                  {g.id} {g.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.cardHelper}>Chips only fill the prompt text; catalog photos are not bundled yet.</Text>

          <View style={[styles.checkRow, styles.mt]}>
            <Switch value={fast} onValueChange={setFast} disabled={sessionActive} accessibilityLabel="Fast mode" />
            <Text style={styles.checkLabel}>Fast mode (US region only, 2x cost)</Text>
          </View>
        </View>

        {/* Session controls */}
        <View style={styles.controls}>
          {sessionActive ? (
            <Btn label="Stop" tone="paper" onPress={() => stopSession()} hint="Ends the AI session" style={styles.flex} />
          ) : (
            <Btn label={tryOn.state === "lost" ? "Retry AI try-on" : "Start AI try-on"} tone="lime" disabled={!canStart} onPress={() => void onStart()} style={styles.flex} />
          )}
          <Btn label="Switch look" tone="ink" disabled={tryOn.state !== "live" || look === null} onPress={onSwitch} style={styles.flex} />
        </View>
        {!sessionActive && startBlocker && <Text style={styles.hint}>{startBlocker}</Text>}

        {/* Diagnostics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diagnostics</Text>
          <Text style={styles.cardHelper}>API: {API_URL ?? "not set"}</Text>
          <Text style={styles.cardHelper}>Model: {tryOn.model ?? "from /api/realtime-token on Start"}</Text>
          <Text style={styles.cardHelper}>Camera: {camera.status} · {camera.facing === "user" ? "front" : "back"}</Text>
          <Btn label="Check API health" tone="quiet" onPress={() => void onHealth()} style={styles.mt} />
          {health && <Text style={styles.cardHelper}>{health}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const btnTone: Record<Tone, ViewStyle> = {
  lime: { backgroundColor: colors.lime },
  ink: { backgroundColor: colors.ink, borderWidth: 1, borderColor: colors.inkLine },
  paper: { backgroundColor: colors.paper },
  quiet: { backgroundColor: colors.inkWell },
};

const btnPressed: Record<Tone, ViewStyle> = {
  lime: { backgroundColor: colors.limePress, transform: [{ scale: 0.98 }] },
  ink: { backgroundColor: colors.inkWell, transform: [{ scale: 0.98 }] },
  paper: { backgroundColor: colors.surfaceDeep, transform: [{ scale: 0.98 }] },
  quiet: { backgroundColor: colors.inkLine, transform: [{ scale: 0.98 }] },
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.studio },
  content: { paddingHorizontal: spacing.gutter, gap: spacing.stack },
  topBar: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  iconBtnText: { color: colors.paper, fontSize: 22, fontWeight: "600" },
  pill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: radii.full, paddingHorizontal: 12, height: 36 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { ...type.label, color: colors.paper },
  aiChip: { color: colors.lime, fontWeight: "800" },
  videoBox: { width: "100%", aspectRatio: 3 / 4, borderRadius: radii.hero, overflow: "hidden", backgroundColor: colors.inkWell },
  videoEmpty: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.inkLine, borderRadius: radii.hero },
  videoEmptyText: { ...type.body, color: colors.mutedDark },
  videoBadge: { position: "absolute", left: 12, bottom: 12, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  videoBadgeText: { fontSize: 11, fontWeight: "600", color: colors.paper },
  countdown: { position: "absolute", right: 14, top: 10, fontSize: 44, fontWeight: "800", color: colors.lime, fontVariant: ["tabular-nums"], letterSpacing: -1.5 },
  notice: { ...type.bodySm, color: colors.mutedDark },
  error: { ...type.bodySm, fontWeight: "500", color: "#FFB4AB" },
  hint: { ...type.bodySm, color: colors.mutedDark, textAlign: "center", marginTop: -8 },
  card: { backgroundColor: colors.inkWell, borderRadius: radii.xl, padding: 16, gap: 8 },
  cardTitle: { ...type.section, color: colors.paper },
  cardBody: { ...type.bodySm, color: colors.paper },
  cardHelper: { fontSize: 12, lineHeight: 17, color: colors.mutedDark },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.mutedDark, alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  checkMark: { color: colors.ink, fontWeight: "800", fontSize: 14 },
  checkLabel: { ...type.label, color: colors.paper, flexShrink: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  mt: { marginTop: 8 },
  thumb: { width: 64, height: 80, borderRadius: radii.sm, backgroundColor: colors.inkLine },
  thumbEmpty: { borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.mutedDark, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" },
  thumbEmptyText: { fontSize: 11, color: colors.mutedDark },
  input: { minHeight: 48, borderRadius: radii.md, backgroundColor: colors.paper, color: colors.ink, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  chips: { gap: 8, paddingVertical: 4 },
  chip: { borderRadius: radii.full, backgroundColor: colors.inkLine, paddingHorizontal: 12, height: 32, justifyContent: "center" },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.paper },
  controls: { flexDirection: "row", gap: 10, padding: 10, borderRadius: radii.dock, backgroundColor: colors.ink, ...shadowDock },
  btn: { height: 52, borderRadius: radii.lg, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  btnDisabled: { opacity: 0.45 },
  btnText: { ...type.button },
});
