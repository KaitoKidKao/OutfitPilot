// Screen shell: safe area, one vertical ScrollView, 20 pt gutter, a 440 pt max
// column on tablets, and bottom clearance so the Fitting Dock never covers content
// (168 + bottom inset). `overlay` renders above the scroll view (FittingDock, sheets).
import { StatusBar } from "expo-status-bar";
import type { ComponentRef, ReactNode, Ref } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { navScrollHandlers } from "@/lib/navScroll";
import { colors, sizes, spacing } from "@/lib/theme";

export interface ScreenProps {
  children?: ReactNode;
  /** "light" = paper (default); "dark" = studio black (Live Fitting Room only). */
  tone?: "light" | "dark";
  /** Default true. false renders a plain flex View (e.g. full-bleed video). */
  scroll?: boolean;
  /** Keep 168 + inset free at the bottom for the dock. Default true. */
  dockClearance?: boolean;
  /** Pinned above the scroll area (usually <TopBar />). */
  header?: ReactNode;
  /** Absolute layer above everything (usually <FittingDock /> and sheets). */
  overlay?: ReactNode;
  /** Apply the 20 pt side gutter to the content. Default true. */
  gutter?: boolean;
  /** Apply the top safe-area inset. Default true (turn off for full-bleed video). */
  safeTop?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Forwarded to the ScrollView. */
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
  testID?: string;
}

export function useDockClearance(): number {
  const insets = useSafeAreaInsets();
  return spacing.dockClearance + insets.bottom;
}

export function Screen({
  children,
  tone = "light",
  scroll = true,
  dockClearance = true,
  header,
  overlay,
  gutter = true,
  safeTop = true,
  contentStyle,
  scrollRef,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bg = tone === "dark" ? colors.studio : colors.paper;
  const bottom = dockClearance ? spacing.dockClearance + insets.bottom : insets.bottom + spacing.section;
  const column: ViewStyle = {
    width: "100%",
    maxWidth: sizes.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: gutter ? spacing.gutter : 0,
  };

  return (
    <SafeAreaView testID={testID} edges={safeTop ? ["top", "left", "right"] : ["left", "right"]} style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar style={tone === "dark" ? "light" : "dark"} />
      {header ? <View style={[column, styles.header]}>{header}</View> : null}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[column, { paddingBottom: bottom }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          {...navScrollHandlers}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, column, { paddingBottom: dockClearance ? bottom : 0 }, contentStyle]}>{children}</View>
      )}
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 12 },
});
