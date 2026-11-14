// App navigation bar (Sang, 14/11): a dark rounded bottom bar with five icon-only
// tabs. The centre "Thử ngay" is a large lime rounded square raised above the bar;
// the active tab gets a short lime bar above its icon.
//
//   Trang chủ (/) · Mặc gì hôm nay (/trends) · [Thử ngay] · Gợi ý (/picks) · Đã lưu (SavedSheet)
//
// Render it in <Screen overlay={...}>. It positions itself (absolute, above the
// bottom safe area). Screens can override the centre action (setup: "Bật camera")
// and put a small row above the bar (`above`, e.g. Final's Keep A / Keep B).
// Hidden on the live fitting screen (that screen keeps its own dock).
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { Bookmark, Camera, Flame, House, Shirt, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SavedSheet } from "@/components/SavedSheet";
import { Touchable } from "@/components/ui/Touchable";
import { useToast } from "@/components/ui/Toast";
import { tr, useLocale } from "@/lib/locale";
import { navScrolling, showNavNow } from "@/lib/navScroll";
import { useAppStore } from "@/lib/store";
import { AppText } from "@/components/ui/AppText";
import { colors, shadowDock, spacing } from "@/lib/theme";

export type NavTab = "home" | "trends" | "picks" | "saved";

export interface NavCenter {
  /** Spoken label. When labelVi is given (a FittingDock-style centre), it is spoken instead. */
  accessibilityLabel: string;
  labelVi?: string;
  accessibilityHint?: string;
  icon?: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface NavBarProps {
  /** Which tab is lit. Omit on screens that are not a tab (e.g. setup). */
  active?: NavTab;
  /** Override the centre button. Default: "Thử ngay" → /setup when looks are picked. */
  center?: NavCenter;
  /** Row rendered just above the bar (keep buttons, error panel). */
  above?: ReactNode;
  testID?: string;
}

/** Bar body height; the centre button rises CENTER_RISE above it. */
export const NAV_BAR_HEIGHT = 64;
const CENTER_SIZE = 64;
const CENTER_RISE = 18;
const INACTIVE = "#5B6660";
/** iOS 26+ Liquid Glass; older iOS / Android fall back to a translucent ink capsule. */
const GLASS = (() => {
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
})();

export function NavBar({ active, center, above, testID }: NavBarProps) {
  const router = useRouter();
  const toast = useToast();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const { hookIds } = useAppStore();
  const [savedOpen, setSavedOpen] = useState(false);
  const reduced = useReducedMotion();
  // Fade (and, unless Reduce Motion, sink a little) while a page scrolls.
  const fade = useDerivedValue(() => withTiming(navScrolling.value, { duration: navScrolling.value ? 160 : 260 }));
  const fadeStyle = useAnimatedStyle(() => {
    const t = fade.value;
    return {
      opacity: 1 - 0.7 * t,
      transform: reduced ? [] : [{ translateY: 10 * t }, { scale: 1 - 0.04 * t }],
    };
  });

  const hasLooks = hookIds[0] !== null || hookIds[1] !== null;

  // ----- glass "lens": a pill behind the active tab that follows the finger -----
  const barRef = useRef<ComponentRef<typeof View>>(null);
  const barPageX = useRef(0);
  const tabBox = useRef<Partial<Record<NavTab, { x: number; w: number }>>>({});
  const lensX = useSharedValue(0);
  const lensW = useSharedValue(0);
  const lensScale = useSharedValue(1);
  const lensOpacity = useSharedValue(0);
  const spring = { damping: 18, stiffness: 260, mass: 0.7 };

  const restLens = () => {
    const box = active ? tabBox.current[active] : undefined;
    if (box) {
      lensX.value = reduced ? box.x : withSpring(box.x, spring);
      lensW.value = reduced ? box.w : withSpring(box.w, spring);
      lensOpacity.value = withTiming(1, { duration: 150 });
    } else {
      lensOpacity.value = withTiming(0, { duration: 150 });
    }
    lensScale.value = reduced ? 1 : withSpring(1, spring);
  };

  const onTabLayout = (key: NavTab) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabBox.current[key] = { x: x + 4, w: width - 8 };
    if (key === active) {
      lensX.value = x + 4;
      lensW.value = width - 8;
      lensOpacity.value = 1;
    }
  };
  useEffect(() => {
    barRef.current?.measureInWindow((x: number) => {
      barPageX.current = x;
    });
  });

  const tabAt = (pageX: number): NavTab | null => {
    const x = pageX - barPageX.current;
    let best: NavTab | null = null;
    let dist = Infinity;
    for (const [k, b] of Object.entries(tabBox.current) as [NavTab, { x: number; w: number }][]) {
      const d = Math.abs(x - (b.x + b.w / 2));
      if (d < dist) {
        dist = d;
        best = k;
      }
    }
    return best;
  };
  const inTabArea = (pageX: number) => {
    const x = pageX - barPageX.current;
    return Object.values(tabBox.current).some((b) => b && x >= b.x - 4 && x <= b.x + b.w + 4);
  };
  const followFinger = (pageX: number) => {
    const w = lensW.value || 64;
    lensX.value = pageX - barPageX.current - w / 2;
  };
  const responder = {
    onStartShouldSetResponder: (e: GestureResponderEvent) => inTabArea(e.nativeEvent.pageX),
    onMoveShouldSetResponder: () => false,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: GestureResponderEvent) => {
      showNavNow();
      const k = tabAt(e.nativeEvent.pageX);
      const box = k ? tabBox.current[k] : undefined;
      if (box) lensW.value = box.w;
      followFinger(e.nativeEvent.pageX);
      lensOpacity.value = withTiming(1, { duration: 100 });
      if (!reduced) lensScale.value = withSpring(1.15, spring);
    },
    onResponderMove: (e: GestureResponderEvent) => followFinger(e.nativeEvent.pageX),
    onResponderRelease: (e: GestureResponderEvent) => {
      const k = tabAt(e.nativeEvent.pageX);
      const box = k ? tabBox.current[k] : undefined;
      if (k && box) {
        lensX.value = reduced ? box.x : withSpring(box.x, spring);
        lensScale.value = reduced ? 1 : withSpring(1, spring);
        tabs.find((t) => t.key === k)?.onPress();
        // Saved opens a sheet (no navigation): settle back on the current tab.
        if (k === "saved" || k === active) setTimeout(restLens, 250);
      } else restLens();
    },
    onResponderTerminate: () => restLens(),
  };

  const lensStyle = useAnimatedStyle(() => ({
    opacity: lensOpacity.value,
    width: lensW.value,
    transform: [{ translateX: lensX.value }, { scale: lensScale.value }],
  }));

  const needLooks = () =>
    toast.show(tr(locale, "Ask the Stylist for two looks first", "Hãy hỏi Stylist để có 2 look trước nhé"));

  const go = (path: "/" | "/picks" | "/trends") => {
    if (path === "/") {
      router.dismissTo("/");
      return;
    }
    if (path === "/trends") {
      if (active !== "trends") router.push("/trends");
      return;
    }
    // Gợi ý is useful on its own (weather + upcoming events), so it always opens.
    if (active !== "picks") router.push(path);
  };

  const centre: NavCenter = center ?? {
    accessibilityLabel: "Thử ngay",
    accessibilityHint: hasLooks ? "Mở camera để thử 2 look" : "Hãy hỏi Stylist để có 2 look trước",
    icon: Camera,
    onPress: () => (hasLooks ? router.push("/setup") : needLooks()),
  };
  const CentreIcon = centre.icon ?? Camera;

  const tabs: { key: NavTab; icon: LucideIcon; label: string; short: string; onPress: () => void }[] = [
    { key: "home", icon: House, label: "Trang chủ", short: "Trang chủ", onPress: () => go("/") },
    { key: "trends", icon: Flame, label: "Mặc gì hôm nay", short: "Mặc gì", onPress: () => go("/trends") },
    { key: "picks", icon: Shirt, label: "Gợi ý", short: "Gợi ý", onPress: () => go("/picks") },
    { key: "saved", icon: Bookmark, label: "Đã lưu", short: "Đã lưu", onPress: () => setSavedOpen(true) },
  ];

  const renderTab = (t: (typeof tabs)[number]) => {
    const on = active === t.key;
    const Icon = t.icon;
    return (
      <View
        key={t.key}
        accessible
        accessibilityRole="tab"
        accessibilityLabel={t.label}
        accessibilityState={{ selected: on }}
        onAccessibilityTap={t.onPress}
        onLayout={onTabLayout(t.key)}
        style={styles.tab}
        testID={`nav-${t.key}`}
      >
        <Icon size={22} color={on ? colors.ink : INACTIVE} strokeWidth={on ? 2.3 : 1.9} />
        <AppText variant="tag" weight={on ? 800 : 600} tone={on ? "ink" : "muted"} numberOfLines={1} style={styles.tabLabel}>
          {t.short}
        </AppText>
      </View>
    );
  };

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        onTouchStart={showNavNow}
        style={[styles.wrap, { bottom: insets.bottom + spacing.dockInset }, fadeStyle]}
        testID={testID}
      >
        {above ? <View style={styles.above}>{above}</View> : null}
        <View style={styles.barShell}>
          {GLASS ? (
            <GlassView style={[StyleSheet.absoluteFill, styles.glass]} glassEffectStyle="regular" colorScheme="light" tintColor="rgba(255,255,255,0.18)" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.fallbackFill]} />
          )}
          <View ref={barRef} style={styles.bar} {...responder}>
          <Animated.View pointerEvents="none" style={[styles.lens, lensStyle]}>
            {GLASS ? <GlassView style={[StyleSheet.absoluteFill, styles.lensGlass]} glassEffectStyle="clear" colorScheme="light" isInteractive /> : null}
          </Animated.View>
          {tabs.slice(0, 2).map(renderTab)}
          <View style={styles.centreSlot}>
            <Touchable
              accessibilityRole="button"
              accessibilityLabel={centre.labelVi ?? centre.accessibilityLabel}
              accessibilityHint={centre.accessibilityHint}
              accessibilityState={{ disabled: !!centre.disabled, busy: !!centre.loading }}
              disabled={centre.disabled || centre.loading}
              onPress={centre.onPress}
              bg={colors.lime}
              pressedBg={colors.limePress}
              style={styles.centre}
              testID="nav-try-on"
            >
              {centre.loading ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <CentreIcon size={28} color={colors.ink} strokeWidth={2.2} />
              )}
            </Touchable>
          </View>
          {tabs.slice(2).map(renderTab)}
          </View>
        </View>
      </Animated.View>
      <SavedSheet
        visible={savedOpen}
        onClose={() => setSavedOpen(false)}
        onRemoved={() => toast.show(tr(locale, "Removed", "Đã xoá"))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "stretch",
  },
  above: {
    marginBottom: 10,
  },
  barShell: {
    height: NAV_BAR_HEIGHT,
    borderRadius: NAV_BAR_HEIGHT / 2,
    overflow: "visible",
    ...shadowDock,
  },
  fallbackFill: {
    borderRadius: NAV_BAR_HEIGHT / 2,
    backgroundColor: "rgba(255,255,255,0.86)",
  },
  bar: {
    height: NAV_BAR_HEIGHT,
    borderRadius: NAV_BAR_HEIGHT / 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  glass: {
    borderRadius: NAV_BAR_HEIGHT / 2,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15,23,19,0.12)",
  },
  tab: {
    flex: 1,
    height: NAV_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: { fontSize: 10, marginTop: 2 },
  lens: {
    position: "absolute",
    left: 0,
    top: 6,
    height: NAV_BAR_HEIGHT - 12,
    borderRadius: (NAV_BAR_HEIGHT - 12) / 2,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15,23,19,0.10)",
    overflow: "hidden",
  },
  lensGlass: { borderRadius: (NAV_BAR_HEIGHT - 12) / 2 },
  indicator: {
    position: "absolute",
    top: 8,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  indicatorOn: {
    backgroundColor: colors.lime,
    height: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15,23,19,0.25)",
  },
  centreSlot: {
    width: CENTER_SIZE + 16,
    height: NAV_BAR_HEIGHT,
    alignItems: "center",
  },
  centre: {
    position: "absolute",
    top: -CENTER_RISE,
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

