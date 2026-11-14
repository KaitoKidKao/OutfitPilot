// Screen 3 · Camera Setup (DESIGN.md §6.3).
// Preview frame (illustration until the camera is on, then the mirrored local preview
// with the dashed body outline), three tips, the privacy notice with an explicit
// agreement switch, and the Fitting Dock holding both picks.
//
// Dock centre, one lime action at a time:
//   camera off      "Allow camera"  -> asks for permission, starts the local preview
//   opening         spinner
//   denied          "Settings"      -> Linking.openSettings()
//   failed          "Try again"
//   paused (bg)     "Camera on"     -> camera back on (never auto-resumes)
//   camera on       "Start fitting" -> enabled only after the switch is on and both
//                                      picks exist; giveConsent() then /fitting
// Nothing leaves the phone on this screen: no Decart session is ever started here.
import { useFocusEffect, useRouter } from "expo-router";
import { Camera, Play, RotateCcw, Settings, ShieldCheck } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, StyleSheet, View } from "react-native";

import { type DockCenter } from "@/components/FittingDock";
import { NavBar } from "@/components/NavBar";
import { BodyRow, SizeRow } from "@/components/SizePicker";
import { ConsentSheet } from "@/components/setup/ConsentSheet";
import { CameraFrame, type FrameState } from "@/components/setup/CameraFrame";
import { SetupTips } from "@/components/setup/SetupTips";
import { AppText, Button, Screen, TopBar, Touchable } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { colors, radii, spacing } from "@/lib/theme";
import { useTryOnSession } from "@/lib/tryOnSession";
import { useSafeKeepAwake } from "@/lib/useSafeKeepAwake";

const CAPTION: Record<FrameState, { text: string; vi: string }> = {
  web: { text: "Web preview: the camera and AI run only in the app.", vi: "Bản xem trước web — camera và AI chỉ chạy trong app." },
  off: {
    text: "Allow the camera to check your framing. Nothing is sent anywhere yet.",
    vi: "Bật camera để căn khung hình. Chưa có hình nào được gửi đi.",
  },
  starting: { text: "Waiting for camera access…", vi: "Đang chờ quyền camera…" },
  paused: {
    text: "The camera turned off while OutfitPilot was in the background.",
    vi: "Camera đã tắt khi OutfitPilot chạy nền.",
  },
  on: {
    text: "Fit your head to hips inside the outline. This preview stays on your phone.",
    vi: "Căn người từ đầu tới hông vào khung. Bản xem trước này chỉ ở trên máy bạn.",
  },
  denied: { text: "", vi: "" },
  error: { text: "", vi: "" },
};

export default function CameraSetup() {
  useSafeKeepAwake();
  const router = useRouter();
  const { hookIds, activeLook, setActiveLook, consentGiven, giveConsent, occasionId, gender } = useAppStore();
  const tryOn = useTryOnSession({ consentGiven });
  const [agreed, setAgreed] = useState(consentGiven);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentAsk, setConsentAsk] = useState(false);
  /** What to do once the user agrees in the popup (turn the camera on, or enter the fitting room). */
  const afterAgreeRef = useRef<(() => void) | null>(null);

  const { startCamera, stopCamera, resumeCamera, cameraStatus, needsResumeConsent, isSupported } = tryOn;

  // The hook turns the camera off whenever this screen loses focus. If the user had it
  // on here (e.g. they come back from the Fitting Room), turn it back on: permission
  // was already given, and this is only the local preview, not a paid session.
  const wantCameraRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (wantCameraRef.current && AppState.currentState === "active") void startCamera();
    }, [startCamera]),
  );

  const allowCamera = useCallback(async () => {
    wantCameraRef.current = true;
    await startCamera();
  }, [startCamera]);

  const turnCameraBackOn = useCallback(async () => {
    wantCameraRef.current = true;
    await resumeCamera();
  }, [resumeCamera]);


  const hasPicks = hookIds[0] !== null || hookIds[1] !== null;
  const isSingleLook = (hookIds[0] !== null && hookIds[1] === null) || (hookIds[0] === null && hookIds[1] !== null);

  useEffect(() => {
    if (hookIds[0] !== null && hookIds[1] === null && activeLook !== "a") {
      setActiveLook("a");
    } else if (hookIds[0] === null && hookIds[1] !== null && activeLook !== "b") {
      setActiveLook("b");
    }
  }, [hookIds, activeLook, setActiveLook]);

  const frameState: FrameState = !isSupported
    ? "web"
    : cameraStatus === "on"
      ? "on"
      : cameraStatus === "starting"
        ? "starting"
        : cameraStatus === "denied"
          ? "denied"
          : cameraStatus === "error"
            ? "error"
            : needsResumeConsent
              ? "paused"
              : "off";

  const startFitting = useCallback(() => {
    giveConsent();
    // Release this screen's camera before the Fitting Room captures its own.
    stopCamera();
    router.push("/fitting");
  }, [giveConsent, stopCamera, router]);

  /** Run `action` now if the user already agreed; otherwise show the consent popup first. */
  const withConsent = useCallback(
    (action: () => void) => {
      if (agreed) {
        action();
        return;
      }
      afterAgreeRef.current = action;
      setConsentAsk(true);
      setConsentOpen(true);
    },
    [agreed],
  );
  const onAgree = useCallback(() => {
    setAgreed(true);
    giveConsent();
    setConsentOpen(false);
    setConsentAsk(false);
    const next = afterAgreeRef.current;
    afterAgreeRef.current = null;
    next?.();
  }, [giveConsent]);

  const startHint = !hasPicks
    ? "Pick a garment first"
    : isSingleLook
        ? "Opens the fitting room to try on your selected piece."
        : "Opens the fitting room. The AI session starts only when you press start there.";

  const center: DockCenter = (() => {
    switch (frameState) {
      case "web":
      case "on":
        return {
          label: "Start fitting",
          labelVi: "Vào thử đồ",
          accessibilityLabel: "Start fitting",
          accessibilityHint: startHint,
          icon: Play,
          tone: "lime",
          disabled: !hasPicks,
          onPress: () => withConsent(startFitting),
        };
      case "starting":
        return { label: "Opening", labelVi: "Đang mở", accessibilityLabel: "Opening the camera", icon: Camera, tone: "lime", loading: true, onPress: () => undefined };
      case "denied":
        return {
          label: "Settings",
          labelVi: "Cài đặt",
          accessibilityLabel: "Open settings to allow the camera",
          icon: Settings,
          tone: "lime",
          onPress: () => {
            void Linking.openSettings().catch(() => undefined);
          },
        };
      case "error":
        return { label: "Try again", labelVi: "Thử lại", accessibilityLabel: "Try the camera again", icon: RotateCcw, tone: "lime", onPress: () => void allowCamera() };
      case "paused":
        return {
          label: "Camera on",
          labelVi: "Bật lại",
          accessibilityLabel: "Turn the camera back on",
          icon: Camera,
          tone: "lime",
          onPress: () => void turnCameraBackOn(),
        };
      case "off":
      default:
        return {
          label: "Allow camera",
          labelVi: "Bật camera",
          accessibilityLabel: "Allow camera",
          accessibilityHint: "Asks for camera access and shows a preview. Nothing is sent yet.",
          icon: Camera,
          tone: "lime",
          onPress: () => withConsent(() => void allowCamera()),
        };
    }
  })();

  const caption = CAPTION[frameState];

  return (
    <Screen
      header={<TopBar title="Camera setup" titleVi="Chuẩn bị camera" />}
      overlay={
        <>
          <NavBar
            center={center}
            above={<SetupCta center={center} />}
          />
          <ConsentSheet visible={consentOpen} agreed={agreed && !consentAsk} onAgree={onAgree} onClose={() => setConsentOpen(false)} />
        </>
      }
    >
      <View style={styles.content}>
        <View style={styles.preview}>
          <CameraFrame
            state={frameState}
            stream={tryOn.localStream}
            mirror={tryOn.mirror}
            errorDetail={frameState === "error" ? tryOn.error : null}
            onRetry={() => void allowCamera()}
          />
          {caption.text ? (
            <AppText variant="bodySm" weight={500} helper={caption.vi} align="center" accessibilityLiveRegion="polite">
              {caption.text}
            </AppText>
          ) : null}
        </View>

        {!hasPicks ? (
          <View style={styles.noPicks}>
            <AppText variant="bodyStrong" helper="Chưa có bộ đồ nào trên dock">
              No looks on the dock yet
            </AppText>
            <AppText variant="bodySm" helper="Chọn dịp hoặc chọn bộ đồ từ tủ đồ để thử.">
              Choose an occasion first or pick a piece from your wardrobe to try on.
            </AppText>
            <Button
              label={occasionId ? "Get my picks" : "Choose an occasion"}
              labelVi={occasionId ? "Nhận gợi ý" : "Chọn dịp"}
              variant="ink"
              onPress={() => (occasionId ? router.dismissTo("/picks") : router.dismissTo("/"))}
            />
          </View>
        ) : null}

        <SetupTips />

        {hasPicks ? (
          <View style={styles.sizeCard}>
            <BodyRow />
            {hookIds.map((id, i) =>
              id ? <SizeRow key={`${i}-${id}`} garmentId={id} gender={gender} slot={hookIds[0] && hookIds[1] ? (i === 0 ? "A" : "B") : undefined} /> : null,
            )}
            <AppText variant="tag" tone="muted">
              Bảng size mẫu, không phải size thật của hãng.
            </AppText>
          </View>
        ) : null}

        <Touchable
          accessibilityRole="button"
          accessibilityLabel="Quyền riêng tư khi thử đồ"
          onPress={() => {
            afterAgreeRef.current = null;
            setConsentAsk(!agreed);
            setConsentOpen(true);
          }}
          style={styles.privacy}
        >
          <ShieldCheck size={14} color={colors.muted} strokeWidth={2} />
          <AppText variant="caption" tone="muted">
            Quyền riêng tư
          </AppText>
        </Touchable>
      </View>
    </Screen>
  );
}

/** The one labelled main button above the tab bar ("Bật camera" / "Vào thử đồ"). */
function SetupCta({ center }: { center: DockCenter }) {
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={center.labelVi ?? center.accessibilityLabel}
      accessibilityHint={center.accessibilityHint}
      accessibilityState={{ disabled: !!center.disabled, busy: !!center.loading }}
      disabled={center.disabled || center.loading}
      onPress={center.onPress}
      bg={colors.lime}
      pressedBg={colors.limePress}
      style={[styles.cta, center.disabled && styles.ctaDim]}
      testID="setup-cta"
    >
      <AppText variant="label" weight={800}>
        {center.loading ? "Đang mở camera…" : (center.labelVi ?? center.label)}
      </AppText>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.gap + 4, paddingTop: 4 },
  sizeCard: { gap: 12, padding: 14, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.line },
  privacy: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 6, minHeight: 44, paddingHorizontal: 12 },
  cta: { minHeight: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  ctaDim: { opacity: 0.5 },
  preview: { gap: 12 },
  noPicks: {
    gap: 8,
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
