// DESIGN.md TopBar: 56 tall, 44 pt Back (radius 14), 17/600 title.
// Back uses router.back() so it mirrors the system back gesture / Android Back;
// it is hidden when there is nothing to go back to (unless onBack is given).
// useCanGoBack() is the reactive hook: calling router.canGoBack() during render
// reads navigation focus mid-render (React Navigation warns about stale values).
import { useCanGoBack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { toggleGlobalLocale, tr, useLocale } from "@/lib/locale";
import { alpha, colors, MIN_TARGET, radii, sizes, spacing } from "@/lib/theme";

import { AppText } from "./AppText";
import { IconButton } from "./IconButton";
import { Touchable } from "./Touchable";

export interface TopBarProps {
  title?: string;
  titleVi?: string;
  /** Replaces the default router.back(). */
  onBack?: () => void;
  /** Default: shown when there is a screen to go back to, or onBack is set. */
  showBack?: boolean;
  /** Default "Back". */
  backLabel?: string;
  /** Replaces the back button slot (e.g. <BrandMark /> on Choose Occasion). */
  left?: ReactNode;
  /** Right slot (e.g. Saved button, Finish). */
  right?: ReactNode;
  /** Show the EN/VI language toggle in the right slot. Default true. */
  showLocaleToggle?: boolean;
  /** "dark" for the Live Fitting Room. */
  tone?: "light" | "dark";
  /**
   * Side-slot inset. "edge" (default) keeps the slots 12 pt from the screen edge,
   * which suits a 44 pt Back button. "gutter" lines custom slot content (brand row,
   * text buttons) up with the 20 pt content gutter.
   */
  inset?: "edge" | "gutter";
}

/** Screen pads the header 12 pt; "gutter" adds the rest of the 20 pt content gutter. */
const GUTTER_PAD = spacing.gutter - 12;

export function LocaleToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  const locale = useLocale();
  const dark = tone === "dark";
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={tr(locale, "Switch language to Vietnamese", "Chuyển ngôn ngữ sang tiếng Anh")}
      onPress={() => {
        toggleGlobalLocale();
      }}
      bg={dark ? alpha.studioOverlay : colors.surface}
      pressedBg={dark ? colors.inkLine : colors.surfaceDeep}
      style={styles.localeBtn}
      testID="locale-toggle"
    >
      <AppText variant="caption" weight={locale === "vi" ? 800 : 500} tone={locale === "vi" ? (dark ? "lime" : "ink") : dark ? "mutedDark" : "muted"}>
        VI
      </AppText>
      <AppText variant="caption" tone={dark ? "mutedDark" : "muted"}>
        /
      </AppText>
      <AppText variant="caption" weight={locale === "en" ? 800 : 500} tone={locale === "en" ? (dark ? "lime" : "ink") : dark ? "mutedDark" : "muted"}>
        EN
      </AppText>
    </Touchable>
  );
}

export function TopBar({
  title,
  titleVi,
  onBack,
  showBack,
  backLabel,
  left,
  right,
  showLocaleToggle = true,
  tone = "light",
  inset = "edge",
}: TopBarProps) {
  const router = useRouter();
  const locale = useLocale();
  const canGoBack = useCanGoBack();
  const canBack = showBack ?? (onBack !== undefined || canGoBack);
  const pad = inset === "gutter" ? GUTTER_PAD : 0;
  const handleBack = onBack ?? (() => router.back());
  const resolvedBackLabel = backLabel ?? tr(locale, "Back", "Quay lại");

  return (
    <View style={styles.bar}>
      <View style={[styles.side, { paddingLeft: pad }]}>
        {left ??
          (canBack ? (
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel={resolvedBackLabel}
              onPress={handleBack}
              variant={tone === "dark" ? "onDark" : "ghost"}
              iconSize={24}
            />
          ) : null)}
      </View>
      <View style={styles.titleWrap}>
        {title ? (
          <AppText variant="topBar" tone={tone === "dark" ? "paper" : "ink"} helper={titleVi} numberOfLines={1} align="center" accessibilityRole="header">
            {title}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, styles.right, { paddingRight: pad }]}>
        {showLocaleToggle ? <LocaleToggle tone={tone} /> : null}
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: sizes.topBar, flexDirection: "row", alignItems: "center", gap: 8 },
  side: { minWidth: MIN_TARGET, flexDirection: "row", alignItems: "center", gap: 8 },
  right: { justifyContent: "flex-end" },
  titleWrap: { flex: 1, alignItems: "center" },
  localeBtn: {
    minHeight: MIN_TARGET,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
});
