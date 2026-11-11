// The Fitting Dock (DESIGN.md signature): a solid ink bar pinned above the bottom
// safe area. Three columns: hook A · centre action · hook B. The hooks hold the two
// picks on every screen; their thumbnails hang from a 24x3 rail and swing into place
// (`hang`, 520 ms) whenever the garment on a hook changes.
//
// Modes
//   display  hooks show the picks; tapping one calls onHookPress (optional)
//   switch   Live Fitting Room: tap a hook to show that look (accessibilityState.selected)
//   keep     Final Look: hooks become lime "Keep A" / "Keep B" actions
//
// Render it in <Screen overlay={...}>. It positions itself (absolute, bottom inset + 16).
import { LinearGradient } from "expo-linear-gradient";
import { Check, type LucideIcon } from "lucide-react-native";
import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { Touchable } from "@/components/ui/Touchable";
import { getGarment, type GarmentId } from "@/lib/catalog";
import { tr, useLocale } from "@/lib/locale";
import { alpha, colors, motion, radii, shadowDock, sizes, spacing } from "@/lib/theme";

export type DockMode = "display" | "switch" | "keep";
export type DockSlot = "a" | "b";
export type DockCenterTone = "lime" | "light" | "quiet";

export interface DockCenter {
  /** Visible label under the icon (e.g. "Style me", "Set up camera", "Stop"). Omit for icon-only. */
  label?: string;
  labelVi?: string;
  /** Required. Spoken label (include the action, e.g. "Style me: get two AI picks"). */
  accessibilityLabel: string;
  accessibilityHint?: string;
  icon?: LucideIcon;
  /** lime = next action, light = Stop (white), quiet = transparent when the hooks are the action. */
  tone: DockCenterTone;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface FittingDockProps {
  /** Default "display". */
  mode?: DockMode;
  /** Garment on hook A and hook B (null = empty dashed hook). */
  hooks: readonly [GarmentId | null, GarmentId | null];
  /** display/switch: which hook is lit (lime). keep mode lights both. */
  lit?: DockSlot | null;
  /** display mode: tap on a filled hook. Without it, hooks are not buttons. */
  onHookPress?: (slot: DockSlot) => void;
  /** switch mode: tap on a hook to show that look. */
  onSelect?: (slot: DockSlot) => void;
  /** keep mode: tap "Keep A" / "Keep B". */
  onKeep?: (slot: DockSlot) => void;
  /** Disable both hooks (e.g. while switching). */
  hooksDisabled?: boolean;
  center: DockCenter;
  /** Slot above the dock body (progress bar, "You've seen both looks" panel). */
  above?: ReactNode;
  /** Gradient behind the dock: light on paper screens, dark in the studio. Default "light". */
  scrim?: "light" | "dark" | "none";
  /** Short names for the hooks. Default { a: "Look A", b: "Look B" }. */
  hookLabels?: { a: string; b: string };
  testID?: string;
}

/** Height of the dock body (padding 10 + hook 76 + padding 10). */
export const DOCK_BODY_HEIGHT = sizes.dockPadding * 2 + sizes.dockHook;

/** Centre column width; the hooks share the rest (about 113 pt each on a 390 pt phone). */
const CENTER_WIDTH = 96;

/**
 * Compact dock for phones narrower than ~400 pt or larger text: a smaller hanging
 * thumbnail and a slightly narrower centre give the hook names about 30% more room
 * (68 pt instead of 51 pt on a 390 pt phone), so "White Oxford Shirt" and "Keep A"
 * stop truncating. Heights and touch targets are unchanged.
 */
const COMPACT = {
  maxWidth: 400,
  fontScale: 1.15,
  centerWidth: 88,
  thumb: { width: 34, height: 44 },
  hookPaddingX: 5,
} as const;

function useCompactDock(): boolean {
  const { width, fontScale } = useWindowDimensions();
  return width < COMPACT.maxWidth || fontScale >= COMPACT.fontScale;
}

const DOCK_TEXT_SCALE = 1.2; // fixed-size control; full text is in accessibilityLabel

export function FittingDock({
  mode = "display",
  hooks,
  lit = null,
  onHookPress,
  onSelect,
  onKeep,
  hooksDisabled = false,
  center,
  above,
  scrim = "light",
  hookLabels = { a: "Look A", b: "Look B" },
  testID,
}: FittingDockProps) {
  const insets = useSafeAreaInsets();
  const compact = useCompactDock();
  const scrimColors = scrim === "dark" ? ([alpha.studio0, colors.studio] as const) : ([alpha.paper0, colors.paper] as const);

  const hookA = hooks[0];
  const hookB = hooks[1];
  const isSingle = (hookA !== null && hookB === null) || (hookA === null && hookB !== null);
  const singleSlot: DockSlot = hookA !== null ? "a" : "b";
  const singleGarmentId = hookA ?? hookB;

  const hookProps = (slot: DockSlot) => ({
    slot,
    mode,
    garmentId: hooks[slot === "a" ? 0 : 1],
    name: hookLabels[slot],
    lit: mode === "keep" ? hooks[slot === "a" ? 0 : 1] !== null : lit === slot,
    disabled: hooksDisabled,
    compact,
    onPress: mode === "switch" ? onSelect : mode === "keep" ? onKeep : onHookPress,
  });

  return (
    <View testID={testID} pointerEvents="box-none" style={[styles.layer, { paddingBottom: insets.bottom + spacing.dockInset }]}>
      {scrim !== "none" ? (
        <LinearGradient pointerEvents="none" colors={scrimColors} locations={[0, 0.45]} style={StyleSheet.absoluteFill} />
      ) : null}
      <View pointerEvents="box-none" style={styles.column}>
        {above ? <View style={styles.above}>{above}</View> : null}
        <View style={styles.dock}>
          {isSingle && singleGarmentId ? (
            mode === "keep" ? (
              <>
                <CenterButton {...center} compact={compact} />
                <SingleKeepButton
                  slot={singleSlot}
                  onKeep={onKeep}
                  disabled={hooksDisabled}
                  compact={compact}
                />
              </>
            ) : (
              <>
                <SingleHook
                  slot={singleSlot}
                  mode={mode}
                  garmentId={singleGarmentId}
                  disabled={hooksDisabled}
                  compact={compact}
                  onPress={mode === "switch" ? onSelect : onHookPress}
                />
                <SingleAction {...center} compact={compact} />
              </>
            )
          ) : (
            <>
              <Hook {...hookProps("a")} />
              <CenterButton {...center} compact={compact} />
              <Hook {...hookProps("b")} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// ---------- Hook ----------

interface HookProps {
  slot: DockSlot;
  mode: DockMode;
  garmentId: GarmentId | null;
  name: string;
  lit: boolean;
  disabled: boolean;
  compact: boolean;
  onPress?: (slot: DockSlot) => void;
}

function Hook({ slot, mode, garmentId, name, lit, disabled, compact, onPress }: HookProps) {
  const isSlotB = slot === "b";
  const locale = useLocale();
  const garment = garmentId ? getGarment(garmentId) : null;
  const letter = slot.toUpperCase();
  const textTone = lit ? "ink" : "paper";
  const subTone = lit ? "ink" : "mutedDark";
  const interactive = !!onPress && !!garment;
  const title = mode === "keep" ? tr(locale, `Keep ${letter}`, `Giữ ${letter}`) : name;
  const sub = garment ? garment.name : tr(locale, "Empty", "Trống");

  const a11yLabel =
    mode === "keep"
      ? `Keep ${name}${garment ? `, ${garment.name}` : ""}`
      : mode === "switch"
        ? `Show ${name}${garment ? `, ${garment.name}` : ", empty"}`
        : `${name}: ${garment ? garment.name : "empty hook"}`;

  const content = (
    <>
      <View style={[styles.thumbCol, compact && styles.thumbColCompact]}>
        <View style={[styles.rail, { backgroundColor: lit ? colors.ink : colors.muted }]} />
        <HangingThumb garmentId={garmentId} compact={compact} slot={slot} />
      </View>
      <View style={[styles.hookText, isSlotB && styles.hookTextB]}>
        <AppText
          variant={mode === "keep" && garment ? "label" : "tag"}
          weight={mode === "keep" && garment ? 800 : 700}
          tone={textTone}
          align={isSlotB ? "right" : "left"}
          numberOfLines={1}
          // Native shrinks the short title ("Keep A") rather than cutting it; web ignores this.
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          maxFontSizeMultiplier={DOCK_TEXT_SCALE}
        >
          {garment || mode !== "keep" ? title : name}
        </AppText>
        <AppText
          variant="tag"
          tone={subTone}
          align={isSlotB ? "right" : "left"}
          numberOfLines={2}
          maxFontSizeMultiplier={DOCK_TEXT_SCALE}
        >
          {sub}
        </AppText>
      </View>
    </>
  );

  const hookStyles = [
    styles.hook,
    isSlotB && styles.hookB,
    compact && styles.hookCompact,
    disabled && styles.disabled,
  ];

  if (!interactive) {
    return (
      <View
        style={[hookStyles, { backgroundColor: lit ? colors.lime : colors.inkWell }]}
        accessible
        accessibilityLabel={a11yLabel}
      >
        {content}
      </View>
    );
  }

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled, ...(mode === "switch" ? { selected: lit } : null) }}
      aria-selected={mode === "switch" ? lit : undefined}
      disabled={disabled}
      onPress={() => onPress?.(slot)}
      bg={lit ? colors.lime : colors.inkWell}
      pressedBg={lit ? colors.limePress : colors.inkLine}
      pressScale={motion.pressScale}
      style={hookStyles}
    >
      {content}
    </Touchable>
  );
}

/** 44x56 (compact 34x44) thumbnail that swings onto the rail when its garment changes. */
function HangingThumb({ garmentId, compact, slot }: { garmentId: GarmentId | null; compact: boolean; slot?: DockSlot }) {
  const thumb = compact ? COMPACT.thumb : sizes.hookThumb;
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    if (reduced || !garmentId) {
      y.set(0);
      rot.set(0);
      return;
    }
    const half = motion.duration.hang / 2;
    const direction = slot === "b" ? 1 : -1;
    y.set(-14);
    rot.set(direction * 7);
    y.set(withTiming(0, { duration: half, easing: motion.easing }));
    rot.set(
      withSequence(
        withTiming(-direction * 3, { duration: half, easing: motion.easing }),
        withTiming(0, { duration: half, easing: motion.easing }),
      ),
    );
  }, [garmentId, reduced, y, rot, slot]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.get() }, { rotate: `${rot.get()}deg` }],
  }));

  return (
    <Animated.View style={[styles.thumbHang, style]}>
      <GarmentImage
        garmentId={garmentId}
        width={thumb.width}
        aspectRatio={thumb.width / thumb.height}
        radius={radii.sm}
        showSampleTag={false}
        emptyLabel=""
        emptyTone="dark"
        accessibilityLabel=""
      />
    </Animated.View>
  );
}

// ---------- Centre ----------

const CENTER_TONE: Record<DockCenterTone, { bg: string; pressedBg: string; fg: string; text: "ink" | "mutedDark" }> = {
  lime: { bg: colors.lime, pressedBg: colors.limePress, fg: colors.ink, text: "ink" },
  light: { bg: colors.paper, pressedBg: colors.surfaceDeep, fg: colors.ink, text: "ink" },
  quiet: { bg: "transparent", pressedBg: colors.inkLine, fg: colors.mutedDark, text: "mutedDark" },
};

function CenterButton({
  label,
  labelVi,
  accessibilityLabel,
  accessibilityHint,
  icon: Icon,
  tone,
  onPress,
  disabled = false,
  loading = false,
  compact = false,
}: DockCenter & { compact?: boolean }) {
  const t = CENTER_TONE[tone];
  const inactive = disabled || loading;
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      bg={t.bg}
      pressedBg={t.pressedBg}
      pressScale={motion.pressScale}
      style={[styles.center, compact && styles.centerCompact, disabled && !loading && styles.disabled]}
    >
      {loading ? <ActivityIndicator color={t.fg} /> : Icon ? <Icon size={label ? 20 : 24} color={t.fg} strokeWidth={1.75} /> : null}
      {label ? (
        <AppText variant="label" weight={700} tone={t.text} helper={labelVi} align="center" numberOfLines={2} maxFontSizeMultiplier={DOCK_TEXT_SCALE}>
          {label}
        </AppText>
      ) : null}
    </Touchable>
  );
}

// ---------- Single-Item Dock Components ----------

interface SingleHookProps {
  slot: DockSlot;
  mode: DockMode;
  garmentId: GarmentId;
  disabled: boolean;
  compact: boolean;
  onPress?: (slot: DockSlot) => void;
}

function SingleHook({
  slot,
  mode,
  garmentId,
  disabled,
  compact,
  onPress,
}: SingleHookProps) {
  const locale = useLocale();
  const garment = getGarment(garmentId);
  const tag = mode === "switch"
    ? tr(locale, "Fitting now", "Đang thử đồ")
    : tr(locale, "Selected piece", "Món đang chọn");
  const garmentName = locale === "vi" ? garment.nameVi ?? garment.name : garment.name;
  const interactive = !!onPress;

  const content = (
    <>
      <View style={[styles.thumbCol, compact && styles.thumbColCompact]}>
        <View style={[styles.rail, { backgroundColor: colors.lime }]} />
        <HangingThumb garmentId={garmentId} compact={compact} slot={slot} />
      </View>
      <View style={styles.singleHookText}>
        <AppText
          variant="tag"
          weight={800}
          tone="lime"
          numberOfLines={1}
          maxFontSizeMultiplier={DOCK_TEXT_SCALE}
        >
          {tag}
        </AppText>
        <AppText
          variant="label"
          weight={700}
          tone="paper"
          numberOfLines={2}
          maxFontSizeMultiplier={DOCK_TEXT_SCALE}
        >
          {garmentName}
        </AppText>
      </View>
    </>
  );

  const hookStyles = [
    styles.singleHook,
    compact && styles.singleHookCompact,
    disabled && styles.disabled,
  ];

  if (!interactive) {
    return (
      <View
        style={[hookStyles, { backgroundColor: colors.inkWell }]}
        accessible
        accessibilityLabel={`${tag}: ${garment.name}`}
      >
        {content}
      </View>
    );
  }

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`${tag}: ${garment.name}`}
      disabled={disabled}
      onPress={() => onPress(slot)}
      bg={colors.inkWell}
      pressedBg={colors.inkLine}
      pressScale={motion.pressScale}
      style={hookStyles}
    >
      {content}
    </Touchable>
  );
}

function SingleAction({
  label,
  labelVi,
  accessibilityLabel,
  accessibilityHint,
  icon: Icon,
  tone,
  onPress,
  disabled = false,
  loading = false,
  compact = false,
}: DockCenter & { compact?: boolean }) {
  const t = CENTER_TONE[tone];
  const inactive = disabled || loading;
  const locale = useLocale();

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      bg={t.bg}
      pressedBg={t.pressedBg}
      pressScale={motion.pressScale}
      style={[
        styles.singleAction,
        compact && styles.singleActionCompact,
        disabled && !loading && styles.disabled,
      ]}
    >
      <View style={styles.singleActionInner}>
        {loading ? (
          <ActivityIndicator color={t.fg} />
        ) : Icon ? (
          <Icon size={compact ? 20 : 22} color={t.fg} strokeWidth={2.4} />
        ) : null}
        {label ? (
          <View style={styles.singleActionTextCol}>
            <AppText
              variant="label"
              weight={800}
              tone={t.text}
              helper={labelVi}
              numberOfLines={1}
              maxFontSizeMultiplier={DOCK_TEXT_SCALE}
            >
              {label}
            </AppText>
            {tone === "lime" ? (
              <AppText
                variant="caption"
                tone="limeInk"
                numberOfLines={1}
                maxFontSizeMultiplier={DOCK_TEXT_SCALE}
              >
                {tr(locale, "1-tap fitting", "1 chạm thử ngay")}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </View>
    </Touchable>
  );
}

function SingleKeepButton({
  slot,
  onKeep,
  disabled = false,
  compact = false,
}: {
  slot: DockSlot;
  onKeep?: (slot: DockSlot) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const locale = useLocale();

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={tr(locale, "Keep this look", "Lưu món đồ vào máy")}
      disabled={disabled}
      onPress={() => onKeep?.(slot)}
      bg={colors.lime}
      pressedBg={colors.limePress}
      pressScale={motion.pressScale}
      style={[
        styles.singleAction,
        compact && styles.singleActionCompact,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.singleActionInner}>
        <Check size={compact ? 20 : 22} color={colors.ink} strokeWidth={2.6} />
        <View style={styles.singleActionTextCol}>
          <AppText
            variant="label"
            weight={800}
            tone="ink"
            numberOfLines={1}
            maxFontSizeMultiplier={DOCK_TEXT_SCALE}
          >
            {tr(locale, "Keep this look", "Lưu món đồ")}
          </AppText>
          <AppText
            variant="caption"
            tone="limeInk"
            numberOfLines={1}
            maxFontSizeMultiplier={DOCK_TEXT_SCALE}
          >
            {tr(locale, "Save to wardrobe", "Lưu vào máy")}
          </AppText>
        </View>
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  layer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 40 },
  column: { width: "100%", maxWidth: sizes.maxContentWidth, alignSelf: "center", paddingHorizontal: 16, gap: 10 },
  above: {},
  dock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: sizes.dockPadding,
    borderRadius: radii.dock,
    backgroundColor: colors.ink,
    ...shadowDock,
  },
  hook: {
    flex: 1,
    height: sizes.dockHook,
    borderRadius: radii.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 6,
    overflow: "hidden",
  },
  hookB: {
    flexDirection: "row-reverse",
  },
  hookCompact: { paddingHorizontal: COMPACT.hookPaddingX, gap: COMPACT.hookPaddingX },
  thumbCol: { width: sizes.hookThumb.width, alignItems: "center", alignSelf: "stretch", justifyContent: "flex-start", paddingTop: 4 },
  thumbColCompact: { width: COMPACT.thumb.width, paddingTop: 8 },
  rail: { width: sizes.hookRail.width, height: sizes.hookRail.height, borderRadius: 2 },
  thumbHang: { marginTop: 2, transformOrigin: "top" },
  hookText: { flex: 1, minWidth: 0, gap: 1 },
  hookTextB: {
    alignItems: "flex-end",
  },
  center: {
    width: CENTER_WIDTH,
    height: sizes.dockCenter,
    borderRadius: radii.card,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    gap: 2,
  },
  centerCompact: { width: COMPACT.centerWidth },
  singleHook: {
    flex: 1.15,
    height: sizes.dockHook,
    borderRadius: radii.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
    overflow: "hidden",
  },
  singleHookCompact: {
    paddingHorizontal: 6,
    gap: 6,
  },
  singleHookText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    justifyContent: "center",
  },
  singleAction: {
    flex: 1,
    height: sizes.dockHook,
    borderRadius: radii.card,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  singleActionCompact: {
    paddingHorizontal: 8,
  },
  singleActionInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  singleActionTextCol: {
    justifyContent: "center",
    gap: 1,
  },
  disabled: { opacity: 0.45 },
});
