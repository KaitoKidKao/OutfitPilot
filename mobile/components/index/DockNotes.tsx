// Panels that sit in the Fitting Dock's `above` slot on Choose Occasion, right over
// the thumb that just pressed "Style me":
//   PendingNote      shown only if the request is still running after a beat
//   PicksErrorPanel  a failed /api/style call; the dock centre becomes "Try again"
// Both float over scrolling content, so they carry the Lift shadow (DESIGN.md:
// shadows only on things that float). They rise in over 360 ms; instant under
// reduced motion.
import { X } from "lucide-react-native";
import { useEffect, type ReactNode } from "react";
import { AccessibilityInfo, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { AppText, IconButton } from "@/components/ui";
import { colors, motion, radii, shadowLift } from "@/lib/theme";

import { picksErrorCopy } from "./pickErrors";

function Rise({ children, onLayout }: { children: ReactNode; onLayout?: (e: LayoutChangeEvent) => void }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) p.set(1);
    else p.set(withTiming(1, { duration: motion.duration.rise, easing: motion.easing }));
  }, [reduced, p]);

  const style = useAnimatedStyle(() => ({
    opacity: p.get(),
    transform: [{ translateY: (1 - p.get()) * 8 }],
  }));

  return (
    <Animated.View onLayout={onLayout} style={style}>
      {children}
    </Animated.View>
  );
}

// ---------- Pending ----------

export function PendingNote({ occasionLabel, onLayout }: { occasionLabel: string; onLayout?: (e: LayoutChangeEvent) => void }) {
  return (
    <Rise onLayout={onLayout}>
      <View style={styles.pending} accessible accessibilityLiveRegion="polite" accessibilityLabel={`Picking two pieces for ${occasionLabel}`}>
        <AppText variant="bodySm" weight={600} align="center" helper="Đang chọn hai bộ đồ cho bạn" helperInline helperVariant="caption">
          {`Picking two pieces for ${occasionLabel}`}
        </AppText>
      </View>
    </Rise>
  );
}

// ---------- Error ----------

export interface PicksErrorPanelProps {
  /** The store's picksError line (English, may be technical). */
  message: string | null;
  /** The store's picksErrorCode / picksErrorStatus; the copy is chosen from these. */
  code?: string | null;
  status?: number;
  onDismiss: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

export function PicksErrorPanel({ message, code, status, onDismiss, onLayout }: PicksErrorPanelProps) {
  const copy = picksErrorCopy({ message, code, status });
  const Icon = copy.icon;

  // Announce once per error so VoiceOver / TalkBack users hear it without hunting.
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${copy.title}. ${copy.recovery}`);
  }, [copy.title, copy.recovery, message]);

  return (
    <Rise onLayout={onLayout}>
      <View style={styles.panel}>
        <View
          style={styles.panelBody}
          accessible
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          accessibilityLabel={`${copy.title}. ${copy.recovery}`}
        >
          <Icon size={20} color={colors.danger} strokeWidth={1.75} style={styles.panelIcon} />
          <View style={styles.panelText}>
            <AppText variant="bodyStrong" helper={copy.titleVi}>
              {copy.title}
            </AppText>
            <AppText variant="bodySm" helper={copy.recoveryVi} helperVariant="caption">
              {copy.recovery}
            </AppText>
            {__DEV__ && message ? (
              <AppText variant="caption" tone="muted" numberOfLines={2}>
                {message}
              </AppText>
            ) : null}
          </View>
        </View>
        <IconButton icon={X} accessibilityLabel="Dismiss this message" onPress={onDismiss} variant="ghost" iconSize={18} />
      </View>
    </Rise>
  );
}

const styles = StyleSheet.create({
  pending: {
    alignSelf: "center",
    maxWidth: "100%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadowLift,
  },
  panel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 4,
    borderRadius: radii.xl,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadowLift,
  },
  panelBody: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 2 },
  panelIcon: { marginTop: 1 },
  panelText: { flex: 1, minWidth: 0, gap: 6 },
});
