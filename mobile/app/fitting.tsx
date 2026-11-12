// Screen 4 · Live Fitting Room (DESIGN.md §6.4). The one dark screen.
//
// Full-bleed video (the AI stream while live, otherwise the mirrored camera) under:
//   top    exit · flip · Finish, then the honest status pill ("AI LIVE" only while live)
//   left   112 pt lime A/B letter + seconds left of the 120 s cap (readable at 1.5–2 m)
//   bottom Fitting Dock in switch mode, with a phase panel in its `above` slot
//
// Money and privacy rules:
//   - no consent -> back to Camera Setup (Redirect); the camera only auto-starts with consent
//   - the paid Decart session starts only from the explicit "Start AI" / "Try again" tap
//   - Exit, Finish, back gesture, blur, unmount and app background all stop the session and
//     the camera (lib/tryOnSession does blur/background; the handlers here stop explicitly too)
//   - garment photos go to Decart as base64 via lib/tryOnSession (catalog id -> prompt + photo)
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { ArrowRight, Camera, Repeat, RotateCcw, Sparkles, Square, X } from "lucide-react-native";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FittingTopBar } from "@/components/fitting/FittingTopBar";
import { isCapNotice } from "@/components/fitting/status";
import { ActionPanel, ConnectingPanel, LivePanel, ReadyPanel } from "@/components/fitting/StudioPanels";
import { SwitchMoment, type SwitchCue } from "@/components/fitting/SwitchMoment";
import { TryOnRecapModal } from "@/components/fitting/TryOnRecapModal";
import { useAutoCompare } from "@/components/fitting/useAutoCompare";
import { StageMessage, VideoLayer } from "@/components/fitting/VideoStage";
import { DOCK_BODY_HEIGHT, FittingDock, type DockCenter } from "@/components/FittingDock";
import { AppText, Screen, useToast } from "@/components/ui";
import { getGarment, type GarmentId } from "@/lib/catalog";
import { tr, useLocale } from "@/lib/locale";
import { useAppStore, type Slot, type TryOnRecap } from "@/lib/store";
import { colors, radii, sizes, spacing } from "@/lib/theme";
import { useTryOnSession } from "@/lib/tryOnSession";
import { useSafeKeepAwake } from "@/lib/useSafeKeepAwake";

type Phase = "no-looks" | "resume" | "connecting" | "live" | "lost" | "ended" | "ready";

const DOCK_ABOVE_GAP = 10;
const noop = () => undefined;

function announce(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}

export default function LiveFittingRoom() {
  useSafeKeepAwake();
  const router = useRouter();
  const toast = useToast();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const { hookIds, activeLook, setActiveLook, consentGiven, setLatestRecap, latestRecap } = useAppStore();
  const tryOn = useTryOnSession({ consentGiven, autoStartCamera: consentGiven });

  const [capEnded, setCapEnded] = useState(false);
  const [cue, setCue] = useState<SwitchCue | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [peekingOriginal, setPeekingOriginal] = useState(false);
  const [recapModalOpen, setRecapModalOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsOpacity = useSharedValue(1);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiSessionStartRef = useRef<number | null>(null);

  // Latest values for timers and async callbacks.
  const tryOnRef = useRef(tryOn);
  const activeLookRef = useRef<Slot>(activeLook);
  const hookIdsRef = useRef(hookIds);
  useLayoutEffect(() => {
    tryOnRef.current = tryOn;
    activeLookRef.current = activeLook;
    hookIdsRef.current = hookIds;
  });
  const cueCounter = useRef(0);
  /** The user (not the 120 s cap) ended the last session: End AI, Cancel or flip. */
  const userStoppedRef = useRef(false);

  const idFor = (slot: Slot): GarmentId | null => hookIds[slot === "a" ? 0 : 1];
  const hasLooks = hookIds[0] !== null || hookIds[1] !== null;
  const isComparing = hookIds[0] !== null && hookIds[1] !== null;
  const activeId = idFor(activeLook) ?? hookIds[0] ?? hookIds[1];
  const activeName = activeId ? getGarment(activeId).name : null;
  const letter = activeLook.toUpperCase();

  // Convert both catalog photos to base64 early so Start / switch are quick.
  const { preload } = tryOn;
  const [hookA, hookB] = hookIds;
  useEffect(() => {
    const ids = [hookA, hookB].filter((id): id is GarmentId => id !== null);
    if (ids.length > 0) preload(ids);
  }, [hookA, hookB, preload]);

  // ----- switching looks -----

  const showLook = useCallback(
    (slot: Slot) => {
      const id = hookIdsRef.current[slot === "a" ? 0 : 1];
      if (!id || slot === activeLookRef.current) return;
      activeLookRef.current = slot;
      setActiveLook(slot);
      const name = getGarment(id).name;
      cueCounter.current += 1;
      setCue({ id: cueCounter.current, slot, garmentName: name });
      announce(`Showing Look ${slot.toUpperCase()}, ${name}`);
      // Inside a live session the garment changes without reconnecting; in preview the
      // choice just decides which look Start AI uses.
      if (tryOnRef.current.state === "live") void tryOnRef.current.switchLook(id);
    },
    [setActiveLook],
  );

  const auto = useAutoCompare({
    available: tryOn.aiLive && isComparing,
    canSwitchNow: () => tryOnRef.current.state === "live" && isComparing,
    onSwitch: () => showLook(activeLookRef.current === "a" ? "b" : "a"),
  });
  const { stop: stopAuto } = auto;

  const onHookSelect = useCallback(
    (slot: Slot) => {
      stopAuto(); // a manual tap always takes over from auto compare
      showLook(slot);
    },
    [stopAuto, showLook],
  );

  // ----- session lifecycle -----

  // Leaving the screen (push to Final, back gesture, Android Back, unmount) stops
  // auto compare, the paid session and the camera. The wrapper does the same; this
  // keeps the screen's own state honest when it comes back into focus.
  const { stopCamera } = tryOn;
  useFocusEffect(
    useCallback(
      () => () => {
        stopAuto();
        stopCamera();
        setCapEnded(false);
      },
      [stopAuto, stopCamera],
    ),
  );

  // Detect the 60 s cap: an active session ended without the user stopping it.
  const wasActiveRef = useRef(false);
  const lastSecondsRef = useRef(tryOn.maxSeconds);

  useEffect(() => {
    if (tryOn.state === "live" && !aiSessionStartRef.current) {
      aiSessionStartRef.current = Date.now();
    }
  }, [tryOn.state]);

  const recordRecap = useCallback(() => {
    if (!activeId) return;
    const duration = 30;
    aiSessionStartRef.current = null;
    const garment = getGarment(activeId);
    const recap: TryOnRecap = {
      garmentId: activeId,
      garmentName: garment.name,
      garmentNameVi: garment.nameVi,
      slot: activeLookRef.current,
      durationSeconds: duration,
      recordedAt: new Date().toISOString(),
    };
    setLatestRecap(recap);
  }, [activeId, setLatestRecap]);

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = tryOn.sessionActive;
    if (tryOn.sessionActive) {
      lastSecondsRef.current = tryOn.secondsLeft;
      return;
    }
    if (wasActive && tryOn.state === "preview" && !userStoppedRef.current && (isCapNotice(tryOn.notice) || lastSecondsRef.current <= 1)) {
      recordRecap();
      setCapEnded(true);
      announce("Time's up. The AI session stopped at the 60-second limit.");
      setRecapModalOpen(true);
    }
  }, [tryOn.sessionActive, tryOn.secondsLeft, tryOn.state, tryOn.notice, recordRecap]);

  // Announce the moments a shopper standing 2 m away needs to hear.
  const prevStateRef = useRef(tryOn.state);
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = tryOn.state;
    if (prev === tryOn.state) return;
    if (tryOn.state === "live" && prev === "connecting") {
      if (isComparing) announce(`AI try-on is live. Showing Look ${activeLookRef.current.toUpperCase()}.`);
      else announce(`AI try-on is live for ${activeName ?? "garment"}.`);
    }
    if (tryOn.state === "lost") announce(`Connection lost. ${tryOn.error ?? ""}`.trim());
    if (tryOn.state !== "live" && tryOn.state !== "switching") setPeekingOriginal(false);
  }, [tryOn.state, tryOn.error]);

  useEffect(() => {
    if (tryOn.error && tryOn.state !== "live") {
      toast.show(tryOn.error);
    }
  }, [tryOn.error, tryOn.state, toast]);

  // Control visibility for immersive full-screen camera view
  const resetAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    if (tryOnRef.current.state === "live") {
      autoHideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 4000);
    }
  }, []);

  const toggleControls = useCallback(() => {
    setControlsVisible((prev) => {
      const next = !prev;
      if (next) resetAutoHideTimer();
      return next;
    });
  }, [resetAutoHideTimer]);

  useEffect(() => {
    controlsOpacity.value = withTiming(controlsVisible ? 1 : 0, { duration: 250 });
  }, [controlsVisible, controlsOpacity]);

  // When AI goes live, show controls initially then schedule auto-hide
  useEffect(() => {
    if (tryOn.state === "live") {
      setControlsVisible(true);
      resetAutoHideTimer();
    } else {
      setControlsVisible(true);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    }
  }, [tryOn.state, resetAutoHideTimer]);

  // When session is ending soon (last 5s), bring controls back up
  useEffect(() => {
    if (tryOn.state === "live" && tryOn.secondsLeft !== null && tryOn.secondsLeft <= 5) {
      setControlsVisible(true);
    }
  }, [tryOn.state, tryOn.secondsLeft]);

  const topAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
    transform: [{ translateY: (1 - controlsOpacity.value) * -20 }],
  }));

  const bottomAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
    transform: [{ translateY: (1 - controlsOpacity.value) * 40 }],
  }));

  // ----- actions -----

  const handleStart = () => {
    if (!activeId) return;
    aiSessionStartRef.current = Date.now();
    userStoppedRef.current = false;
    setCapEnded(false);
    stopAuto();
    void tryOn.start(activeId);
  };

  const handleEndSession = () => {
    recordRecap();
    userStoppedRef.current = true;
    stopAuto();
    tryOn.stop("AI session ended. The camera preview stays on.");
    setRecapModalOpen(true);
  };

  const handleCancelConnect = () => {
    userStoppedRef.current = true;
    tryOn.stop("Connection cancelled before the AI started.");
  };

  const handleFlip = () => {
    if (tryOn.sessionActive) userStoppedRef.current = true;
    stopAuto();
    void tryOn.flip();
  };

  const handleExit = () => {
    stopAuto();
    tryOn.stopCamera();
    if (router.canGoBack()) router.back();
    else router.replace("/setup");
  };

  const handleFinish = () => {
    recordRecap();
    stopAuto();
    tryOn.stopCamera();
    router.push("/final");
  };

  // Hooks above; guard last so hook order never changes.
  if (!consentGiven) return <Redirect href="/setup" />;

  // ----- derived view state -----

  const phase: Phase = !hasLooks
    ? "no-looks"
    : tryOn.needsResumeConsent
      ? "resume"
      : tryOn.state === "connecting"
        ? "connecting"
        : tryOn.state === "live" || tryOn.state === "switching"
          ? "live"
          : tryOn.state === "lost"
            ? "lost"
            : capEnded
              ? "ended"
              : "ready";

  const cameraBlocked = tryOn.cameraStatus === "denied";
  const canStart = tryOn.isSupported && !!activeId && !cameraBlocked && tryOn.startBlocker === null;
  const startReason = !tryOn.isSupported ? null : cameraBlocked ? "Camera access is off. Allow it in Settings to start." : tryOn.startBlocker;

  const center: DockCenter = (() => {
    switch (phase) {
      case "ready":
        return {
          label: "Start AI",
          labelVi: "Bật AI",
          icon: Sparkles,
          tone: "lime",
          accessibilityLabel: isComparing ? `Start AI try-on with Look ${letter}` : `Start AI try-on with ${activeName ?? "garment"}`,
          accessibilityHint: "Paid session. Sends your camera to Decart for up to 60 seconds.",
          onPress: handleStart,
          disabled: !canStart,
          loading: tryOn.settling,
        };
      case "connecting":
        return { label: "Cancel", labelVi: "Huỷ", icon: X, tone: "light", accessibilityLabel: "Cancel connecting to AI", onPress: handleCancelConnect };
      case "live":
        if (isComparing) {
          return auto.running
            ? { label: "Stop", labelVi: "Dừng", icon: Square, tone: "light", accessibilityLabel: "Stop auto compare", onPress: stopAuto }
            : {
                label: "Auto compare",
                labelVi: "Tự đổi A/B",
                icon: Repeat,
                tone: "lime",
                accessibilityLabel: "Auto compare: switch looks every 8 seconds",
                accessibilityHint: "Tap a hook any time to take over",
                onPress: auto.start,
              };
        }
        return {
          label: "Finish",
          labelVi: "Xem kết quả",
          icon: ArrowRight,
          tone: "lime",
          accessibilityLabel: "Finish fitting and view result",
          accessibilityHint: "Opens Final Look to view and keep your fitted garment",
          onPress: handleFinish,
        };
      default:
        return {
          label: isComparing ? "Auto compare" : "Fitting",
          labelVi: isComparing ? "Tự đổi A/B" : "Đang thử đồ",
          icon: isComparing ? Repeat : Sparkles,
          tone: "quiet",
          accessibilityLabel: isComparing ? "Auto compare" : "Fitting",
          accessibilityHint: "Available while the AI try-on is live",
          onPress: noop,
          disabled: true,
        };
    }
  })();

  const onPanelLayout = (e: LayoutChangeEvent) => setPanelHeight(Math.round(e.nativeEvent.layout.height));
  const retry = {
    label: "Try again",
    labelVi: "Thử lại",
    icon: RotateCcw,
    onPress: handleStart,
    disabled: !canStart,
    loading: tryOn.settling,
    accessibilityHint: "Starts a new paid AI session of up to 60 seconds",
  };
  const finish = { label: "Finish", labelVi: "Xong", icon: ArrowRight, onPress: handleFinish, accessibilityHint: "Opens Final Look to choose what to keep" };

  const panel = (() => {
    switch (phase) {
      case "no-looks":
        return (
          <ActionPanel
            onLayout={onPanelLayout}
            title="No looks on the hooks yet"
            helper="Chưa có bộ đồ nào trên móc"
            body="Choose an occasion first or pick a piece from your closet to try here."
            bodyVi="Hãy chọn dịp hoặc chọn bộ đồ từ tủ đồ để thử tại đây."
            primary={{ label: "Choose an occasion", labelVi: "Chọn dịp", icon: ArrowRight, onPress: () => router.replace("/") }}
          />
        );
      case "resume":
        return (
          <ActionPanel
            onLayout={onPanelLayout}
            title="Paused while you were away"
            helper="Đã tạm dừng khi bạn rời ứng dụng"
            body="The camera and the AI turned off when OutfitPilot went to the background. Nothing runs until you choose."
            bodyVi="Camera và AI đã tự tắt khi ứng dụng chạy nền. Không có gì chạy cho tới khi bạn chọn."
            primary={{ label: "Turn camera on", labelVi: "Bật lại camera", icon: Camera, onPress: () => void tryOn.resumeCamera() }}
            secondary={{ label: "Not now", labelVi: "Để sau", onPress: tryOn.dismissResumePrompt }}
          />
        );
      case "connecting":
        return <ConnectingPanel onLayout={onPanelLayout} notice={tryOn.notice} />;
      case "live":
        return (
          <LivePanel
            onLayout={onPanelLayout}
            secondsLeft={tryOn.secondsLeft}
            maxSeconds={tryOn.maxSeconds}
            switching={tryOn.state === "switching"}
            secondsToNext={auto.secondsToNext}
            error={tryOn.error}
            onEnd={handleEndSession}
          />
        );
      case "lost":
        return (
          <ActionPanel
            onLayout={onPanelLayout}
            title="Connection lost"
            helper="Mất kết nối với AI"
            body={tryOn.error ?? "The AI connection dropped. Your camera preview is still on."}
            bodyVi={tryOn.error ?? "Kết nối AI bị gián đoạn. Xem trước camera của bạn vẫn đang bật."}
            primary={retry}
            secondary={finish}
          />
        );
      case "ended":
        return (
          <ActionPanel
            onLayout={onPanelLayout}
            title="Time's up: 60s"
            helper="Hết 60 giây thử đồ"
            body="The AI session stopped at its 60-second limit. Review your recorded clip or try again."
            bodyVi="Phiên thử AI đã tự dừng sau 60 giây. Bạn có thể xem lại video clip đã quay, thử lại hoặc chuyển sang Final Look."
            primary={retry}
            secondary={finish}
          />
        );
      case "ready":
      default: {
        const isDress = activeId ? getGarment(activeId).type === "dress" : false;
        return (
          <ReadyPanel
            onLayout={onPanelLayout}
            letter={letter}
            isDress={isDress}
            notice={tryOn.isSupported ? tryOn.notice : null}
            blocker={startReason}
          />
        );
      }
    }
  })();

  const bottomReserve = insets.bottom + spacing.dockInset + DOCK_BODY_HEIGHT + DOCK_ABOVE_GAP + panelHeight + 8;
  const stageSource = peekingOriginal && tryOn.showingAi ? { ...tryOn, videoStream: tryOn.localStream, showingAi: false } : tryOn;

  return (
    <Screen
      tone="dark"
      scroll={false}
      dockClearance={false}
      gutter={false}
      safeTop={false}
      testID="fitting-room"
      overlay={
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={toggleControls}
            onLongPress={() => {
              if (tryOn.showingAi) setPeekingOriginal(true);
            }}
            onPressOut={() => {
              if (tryOn.showingAi) setPeekingOriginal(false);
            }}
            delayLongPress={220}
          >
            <VideoLayer tryOn={stageSource} />
          </Pressable>

          {/* Hint when in full screen clean view */}
          {!controlsVisible && (
            <View pointerEvents="none" style={[styles.cleanScreenHint, { top: insets.top + 16 }]}>
              <View style={styles.hintPill}>
                <AppText variant="tag" weight={700} tone="paper">
                  {tr(locale, "Tap screen to show controls", "Chạm màn hình để hiện bảng điều khiển")}
                </AppText>
              </View>
            </View>
          )}

          <Animated.View
            pointerEvents={controlsVisible ? "box-none" : "none"}
            style={[styles.chrome, { paddingTop: insets.top }, topAnimatedStyle]}
          >
            <View pointerEvents="box-none" style={styles.column}>
              <FittingTopBar
                isLive={tryOn.aiLive}
                isConnecting={tryOn.state === "connecting"}
                secondsLeft={tryOn.aiLive ? tryOn.secondsLeft : null}
                garmentName={activeName}
                slot={activeLook}
                isComparing={isComparing}
                onExit={handleExit}
                onFlip={handleFlip}
                flipDisabled={!tryOn.isSupported || tryOn.cameraStatus === "starting" || cameraBlocked}
                flipHint={tryOn.sessionActive ? "Ends the AI session. Start again after flipping." : undefined}
                canPeekOriginal={tryOn.showingAi}
                peekingOriginal={peekingOriginal}
                onToggleOriginal={() => setPeekingOriginal((v) => !v)}
                onFinish={handleFinish}
              />
              <View pointerEvents="box-none" style={[styles.middle, { paddingBottom: bottomReserve }]}>
                <StageMessage tryOn={tryOn} />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            pointerEvents={controlsVisible ? "box-none" : "none"}
            style={[StyleSheet.absoluteFill, bottomAnimatedStyle]}
          >
            <FittingDock
              mode="switch"
              scrim="dark"
              hooks={hookIds}
              lit={hasLooks ? activeLook : null}
              onSelect={onHookSelect}
              hooksDisabled={!hasLooks || phase === "connecting" || tryOn.state === "switching"}
              center={center}
              above={panel}
            />
          </Animated.View>

          {/* Last, so the lime cut covers the dock and its scrim too (full screen). */}
          <SwitchMoment cue={cue} />
          <TryOnRecapModal
            visible={recapModalOpen}
            onClose={() => setRecapModalOpen(false)}
            recap={latestRecap}
            onKeepLook={handleFinish}
          />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  chrome: { ...StyleSheet.absoluteFill, alignItems: "center" },
  column: { flex: 1, width: "100%", maxWidth: sizes.maxContentWidth, paddingHorizontal: 16 },
  middle: { flex: 1, justifyContent: "center", minHeight: 0 },
  cleanScreenHint: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  hintPill: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
});
