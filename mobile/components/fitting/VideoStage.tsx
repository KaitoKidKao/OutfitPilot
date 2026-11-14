// Full-bleed video layer of the Live Fitting Room, plus the message shown when there
// is no video to look at (camera starting / off / blocked / failed, or web preview).
//   - remote AI stream while live, otherwise the mirrored local camera (tryOn.videoStream)
//   - lime dashed body frame while the plain camera preview is up (DESIGN.md Shapes:
//     the only guide shape on video), so the shopper can step back into frame
import { Camera, CameraOff, MonitorSmartphone, RotateCcw, Settings, type LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";

import { TryOnVideo } from "@/components/TryOnVideo";
import { AppText, Button } from "@/components/ui";
import type { TryOnController } from "@/lib/tryOnSession";
import { alpha, colors, radii, sizes } from "@/lib/theme";

type StageSource = Pick<TryOnController, "videoStream" | "mirror" | "showingAi" | "cameraStatus" | "isSupported">;

/** The video itself, edge to edge behind every control. */
export function VideoLayer({ tryOn }: { tryOn: StageSource }) {
  const showGuide = tryOn.isSupported && tryOn.cameraStatus === "on" && !tryOn.showingAi;
  return (
    <View pointerEvents="none" style={styles.layer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <TryOnVideo stream={tryOn.videoStream} mirror={tryOn.mirror} objectFit="cover" style={StyleSheet.absoluteFill} zOrder={0} />
      {showGuide ? (
        <View style={styles.guideWrap}>
          <View style={styles.guide} />
        </View>
      ) : null}
    </View>
  );
}

interface StageMessageProps {
  tryOn: Pick<TryOnController, "isSupported" | "platformNote" | "cameraStatus" | "error" | "startCamera">;
}

/** Centred explanation + recovery when there is no picture. Returns null while video plays. */
export function StageMessage({ tryOn }: StageMessageProps) {
  if (!tryOn.isSupported) {
    return (
      <Message
        icon={MonitorSmartphone}
        title={tryOn.platformNote ?? "Web preview — camera and AI run only in the app"}
        helper="Bản xem trước trên web: camera và AI chỉ chạy trong ứng dụng"
      />
    );
  }

  switch (tryOn.cameraStatus) {
    case "starting":
      return (
        <Message
          busy
          title="Starting camera"
          helper="Đang bật camera"
          body="Allow camera access if your phone asks."
          bodyVi="Cho phép quyền truy cập camera nếu máy hỏi."
        />
      );
    case "denied":
      return (
        <Message
          icon={CameraOff}
          title="Camera access is off"
          helper="Quyền camera đang tắt"
          body="Allow camera for OutfitPilot in Settings, then come back here."
          bodyVi="Hãy cấp quyền camera cho OutfitPilot trong Cài đặt rồi quay lại."
          action={{ label: "Settings", labelVi: "Cài đặt", icon: Settings, onPress: () => void Linking.openSettings().catch(() => undefined) }}
        />
      );
    case "error":
      return (
        <Message
          icon={CameraOff}
          title="The camera didn't start"
          helper="Camera chưa bật được"
          body={tryOn.error ?? "Another app may be using it. Close it and try again."}
          bodyVi={tryOn.error ?? "Có thể một ứng dụng khác đang dùng camera. Hãy đóng ứng dụng đó rồi thử lại."}
          action={{ label: "Retry", labelVi: "Thử lại", icon: RotateCcw, onPress: () => void tryOn.startCamera() }}
        />
      );
    case "off":
      return (
        <Message
          icon={Camera}
          title="Camera is off"
          helper="Camera đang tắt"
          body="Turn it on to see yourself, then start the AI try-on."
          bodyVi="Bật camera để xem khung hình, sau đó bắt đầu thử đồ bằng AI."
          action={{ label: "Turn on camera", labelVi: "Bật camera", icon: Camera, onPress: () => void tryOn.startCamera() }}
        />
      );
    case "on":
    default:
      return null;
  }
}

interface MessageProps {
  title: string;
  helper: string;
  body?: string;
  bodyVi?: string;
  icon?: LucideIcon;
  busy?: boolean;
  action?: { label: string; labelVi?: string; icon: LucideIcon; onPress: () => void };
}

function Message({ title, helper, body, bodyVi, icon: Icon, busy = false, action }: MessageProps) {
  return (
    <View style={styles.message}>
      <View style={styles.iconWell} importantForAccessibility="no" accessibilityElementsHidden>
        {busy ? <ActivityIndicator color={colors.paper} /> : Icon ? <Icon size={26} color={colors.paper} strokeWidth={1.75} /> : null}
      </View>
      <AppText variant="section" tone="paper" align="center" helper={helper} accessibilityRole="header">
        {title}
      </AppText>
      {body ? (
        <AppText variant="bodySm" tone="mutedDark" align="center" helper={bodyVi} style={styles.body}>
          {body}
        </AppText>
      ) : null}
      {action ? <Button label={action.label} labelVi={action.labelVi} icon={action.icon} variant="onDark" onPress={action.onPress} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, backgroundColor: colors.studio },
  guideWrap: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  guide: {
    width: "54%",
    height: "58%",
    maxWidth: 260,
    borderWidth: sizes.dashedBorder,
    borderStyle: "dashed",
    borderColor: colors.lime,
    borderRadius: radii.hero * 4,
    opacity: 0.7,
  },
  message: { alignItems: "center", gap: 8, paddingHorizontal: 24, maxWidth: 320, alignSelf: "center" },
  iconWell: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: alpha.studioOverlay,
    borderWidth: 1,
    borderColor: colors.inkLine,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  body: { maxWidth: 280 },
  action: { alignSelf: "center", marginTop: 6 },
});
