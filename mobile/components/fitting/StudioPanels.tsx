// Panels that sit in the dock's `above` slot of the Live Fitting Room, one per phase.
// Dark translucent block over the video (a floating card, so it carries the dock
// shadow), paper text with the Vietnamese helper in muted-dark.
//   ReadyPanel       before the paid session: how to stand, what Start does
//   ConnectingPanel  queue / connecting notice (Cancel is the dock centre)
//   LivePanel        session progress (4 px lime bar), auto compare countdown, End AI
//   ActionPanel      time's up / connection lost / paused / no looks, with buttons
import type { LucideIcon } from "lucide-react-native";
import { Info, Square } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View, type LayoutChangeEvent } from "react-native";

import { AppText, Button, Touchable } from "@/components/ui";
import { alpha, colors, MIN_TARGET, radii, shadowDock } from "@/lib/theme";

// ---------- container ----------

export function StudioPanel({ children, onLayout }: { children: ReactNode; onLayout?: (e: LayoutChangeEvent) => void }) {
  return (
    <View style={styles.panel} onLayout={onLayout}>
      {children}
    </View>
  );
}

function NoteLine({ text, icon: Icon = Info }: { text: string; icon?: LucideIcon }) {
  return (
    <View style={styles.note} accessible accessibilityRole="text" accessibilityLabel={text} accessibilityLiveRegion="polite">
      <Icon size={16} color={colors.mutedDark} strokeWidth={1.75} style={styles.noteIcon} />
      <AppText variant="bodySm" tone="paper" style={styles.flex}>
        {text}
      </AppText>
    </View>
  );
}

// ---------- ready ----------

export interface ReadyPanelProps {
  letter: string;
  isDress?: boolean;
  /** Last informational notice from the wrapper (flip, background, user stop). */
  notice: string | null;
  /** Why Start is disabled (shown only when it is a real, fixable reason). */
  blocker: string | null;
  onLayout?: (e: LayoutChangeEvent) => void;
}

export function ReadyPanel({ letter, isDress = false, notice, blocker, onLayout }: ReadyPanelProps) {
  return (
    <StudioPanel onLayout={onLayout}>
      <AppText
        variant="section"
        tone="paper"
        helper={isDress ? "Lùi lại 1,8–2 m để thấy toàn bộ đầm trên người" : "Lùi lại khoảng 1,5 m, đứng gọn trong khung"}
      >
        {isDress ? "Step back 1.8–2 m for full dress view" : "Step back about 1.5 m"}
      </AppText>
      <AppText
        variant="bodySm"
        tone="mutedDark"
        helper={`Bấm Bật AI để thử trực tiếp Look ${letter}${isDress ? " (Đầm liền toàn thân)" : ""}. Phiên thử tự dừng sau 2 phút. Chạm vào móc bên dưới để đổi look trước khi bật.`}
      >
        {`Start AI puts Look ${letter}${isDress ? " (full-body dress)" : ""} on you live. It is a paid session and stops by itself after 2 minutes. Tap a hook to choose which look goes first.`}
      </AppText>
      {blocker ? <NoteLine text={blocker} /> : notice ? <NoteLine text={notice} /> : null}
    </StudioPanel>
  );
}

// ---------- connecting ----------

export function ConnectingPanel({ notice, onLayout }: { notice: string | null; onLayout?: (e: LayoutChangeEvent) => void }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <StudioPanel onLayout={onLayout}>
      <View style={styles.row}>
        <ActivityIndicator color={colors.lime} />
        <AppText variant="section" tone="paper" helper="Đang kết nối AI" containerStyle={styles.flex}>
          Connecting to AI
        </AppText>
      </View>

      {/* Hands-free step-back prompt */}
      <View style={styles.countdownRow}>
        <View style={styles.countdownPill}>
          <AppText variant="bodyStrong" tone="ink" style={styles.countdownNum}>
            {countdown}
          </AppText>
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong" tone="lime" helper="Lùi lại ~1,5 m và đứng trọn trong khung hình">
            Step back ~1.5 m
          </AppText>
          <AppText variant="caption" tone="mutedDark">
            Căn người từ đầu đến hông để AI vẽ áo chuẩn nhất
          </AppText>
        </View>
      </View>

      <AppText
        variant="caption"
        tone="mutedDark"
        helper={notice ?? "OutfitPilot không ghi hay lưu video; Decart xử lý trực tiếp để vẽ trang phục."}
        accessibilityLiveRegion="polite"
      >
        {notice ?? "OutfitPilot does not record or save video; Decart processes live to draw clothing."}
      </AppText>
    </StudioPanel>
  );
}

// ---------- live ----------

export interface LivePanelProps {
  secondsLeft: number;
  maxSeconds: number;
  switching: boolean;
  /** Auto compare countdown, or null when auto compare is off. */
  secondsToNext: number | null;
  error: string | null;
  onEnd: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

export function LivePanel({ secondsLeft, maxSeconds, switching, secondsToNext, error, onEnd, onLayout }: LivePanelProps) {
  const fraction = Math.max(0, Math.min(1, secondsLeft / maxSeconds));
  const [title, helper] = switching
    ? ["Switching look…", "Đang đổi look"]
    : secondsToNext !== null
      ? [`Next look in ${secondsToNext} s`, `Tự động đổi sau ${secondsToNext} giây`]
      : ["Tap a hook to switch looks", "Chạm vào móc để đổi look"];

  return (
    <StudioPanel onLayout={onLayout}>
      <View style={styles.row}>
        <AppText variant="bodyStrong" tone="paper" tabular helper={helper} containerStyle={styles.flex}>
          {title}
        </AppText>
        <Touchable
          accessibilityRole="button"
          accessibilityLabel="End AI session"
          accessibilityHint="Stops the paid session and keeps the camera preview"
          onPress={onEnd}
          bg="transparent"
          pressedBg={alpha.paper12}
          style={styles.endButton}
        >
          <Square size={14} color={colors.paper} strokeWidth={1.75} fill={colors.paper} />
          <AppText variant="label" tone="paper" helper="Dừng AI">
            End AI
          </AppText>
        </Touchable>
      </View>
      <View
        style={styles.track}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="AI session time left"
        accessibilityValue={{ min: 0, max: maxSeconds, now: secondsLeft, text: `${secondsLeft} seconds left` }}
      >
        <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
      </View>
      {error ? <NoteLine text={error} /> : null}
    </StudioPanel>
  );
}

// ---------- action (time's up / lost / paused / no looks) ----------

export interface PanelAction {
  label: string;
  labelVi?: string;
  icon?: LucideIcon;
  onPress: () => void;
  accessibilityHint?: string;
  loading?: boolean;
  disabled?: boolean;
}

export interface ActionPanelProps {
  title: string;
  helper: string;
  body: string;
  bodyVi?: string;
  /** The panel's next action (lime). */
  primary: PanelAction;
  /** White pill on dark. */
  secondary?: PanelAction;
  onLayout?: (e: LayoutChangeEvent) => void;
}

export function ActionPanel({ title, helper, body, bodyVi, primary, secondary, onLayout }: ActionPanelProps) {
  return (
    <StudioPanel onLayout={onLayout}>
      <AppText variant="section" tone="paper" helper={helper} accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="bodySm" tone="mutedDark" helper={bodyVi}>
        {body}
      </AppText>
      <View style={styles.actions}>
        <Button
          label={primary.label}
          labelVi={primary.labelVi}
          icon={primary.icon}
          variant="next"
          onPress={primary.onPress}
          loading={primary.loading}
          disabled={primary.disabled}
          accessibilityHint={primary.accessibilityHint}
          style={styles.actionButton}
        />
        {secondary ? (
          <Button
            label={secondary.label}
            labelVi={secondary.labelVi}
            icon={secondary.icon}
            variant="onDark"
            onPress={secondary.onPress}
            disabled={secondary.disabled}
            accessibilityHint={secondary.accessibilityHint}
            style={styles.actionButton}
          />
        ) : null}
      </View>
    </StudioPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: alpha.studioPanel,
    borderRadius: radii.xl,
    padding: 16,
    gap: 10,
    ...shadowDock,
  },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  noteIcon: { marginTop: 1 },
  endButton: {
    minHeight: MIN_TARGET,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.inkLine,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  track: { height: 4, borderRadius: 2, backgroundColor: alpha.paper12, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2, backgroundColor: colors.lime },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 },
  actionButton: { flexGrow: 1 },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: alpha.paper12,
    borderRadius: radii.lg,
    padding: 10,
    gap: 12,
    marginVertical: 4,
  },
  countdownPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownNum: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "800",
  },
});
