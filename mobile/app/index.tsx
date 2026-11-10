// Screen 1 · Choose Occasion (DESIGN.md §6.1, direction contract FIRST VIEWPORT).
//
//   brand row (OP mark + OutfitPilot · Saved N)
//   "What's the occasion?" + Vietnamese helper
//   three occasion cards (radio) · optional style chips
//   Fitting Dock: empty hooks, lime "Style me" centre (disabled until an occasion is chosen)
//
// "Style me" calls store.fetchPicks() and only then pushes /picks, so a failure is
// shown here, right above the thumb, with the dock centre turning into "Try again".
// Changing the occasion or style while a request runs supersedes it (the store
// drops the stale response) instead of locking the screen.
import { useFocusEffect, useRouter } from "expo-router";
import { Camera, Layers, RotateCcw, Sparkles, Wrench, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View, type LayoutChangeEvent } from "react-native";

import { ClosetSheet } from "@/components/closet/ClosetSheet";
import { PendingNote, PicksErrorPanel } from "@/components/index/DockNotes";
import { OccasionCard, OccasionGroup } from "@/components/index/OccasionCard";
import { SavedButton } from "@/components/index/SavedButton";
import { FittingDock, type DockCenter } from "@/components/FittingDock";
import { PreStageModal } from "@/components/PreStageModal";
import { SavedSheet } from "@/components/SavedSheet";
import { AppText, BrandMark, Screen, TopBar, Touchable, useDockClearance, useToast } from "@/components/ui";
import { getOccasionOption, OCCASION_OPTIONS, STYLE_OPTIONS } from "@/lib/occasions";
import { tr, useLocale } from "@/lib/locale";
import { useAppStore } from "@/lib/store";
import { colors, MIN_TARGET, radii, spacing } from "@/lib/theme";

/** Show the "Picking two pieces…" note only when the request outlasts this. */
const PENDING_NOTE_DELAY_MS = 1200;

const QUICK_OCCASIONS = [
  { en: "Beach Wedding", vi: "Tiệc cưới bãi biển" },
  { en: "Rooftop Bar", vi: "Đi Bar & Pub tối" },
  { en: "Weekend Trip", vi: "Du lịch cuối tuần" },
  { en: "Client Meeting", vi: "Gặp đối tác" },
  { en: "Birthday Gala", vi: "Tiệc sinh nhật" },
];

export default function ChooseOccasion() {
  const router = useRouter();
  const toast = useToast();
  const locale = useLocale();
  const clearance = useDockClearance();
  const {
    occasionId,
    customOccasion,
    style,
    setOccasion,
    setCustomOccasion,
    setStyle,
    fetchPicks,
    picksStatus,
    picksError,
    picksErrorCode,
    picksErrorStatus,
    hookIds,
    saved,
    savedLoaded,
  } = useAppStore();

  const [savedOpen, setSavedOpen] = useState(false);
  const [closetOpen, setClosetOpen] = useState(false);
  const [healthCheckOpen, setHealthCheckOpen] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [pendingVisible, setPendingVisible] = useState(false);
  const [aboveHeight, setAboveHeight] = useState(0);

  const occasion = occasionId ? getOccasionOption(occasionId) : null;
  const loading = picksStatus === "loading";
  const showError = picksStatus === "error" && !errorDismissed;

  // ----- navigation guards -----
  const focusedRef = useRef(true);
  const navigatingRef = useRef(false);
  const attemptRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      navigatingRef.current = false;
      return () => {
        focusedRef.current = false;
      };
    }, []),
  );

  // Delayed pending note: a quick (or cached) response never flashes it.
  // (It is only read while `loading`, and reset when the request ends.)
  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setPendingVisible(true), PENDING_NOTE_DELAY_MS);
    return () => {
      clearTimeout(id);
      setPendingVisible(false);
    };
  }, [loading]);

  const styleMe = useCallback(
    async (force = false) => {
      if (!occasionId || navigatingRef.current) return;
      setErrorDismissed(false);
      const attempt = ++attemptRef.current;
      const res = await fetchPicks(force ? { force: true } : undefined);
      // null = failed (the store holds picksError) or superseded by a new selection.
      if (!res || attempt !== attemptRef.current || !focusedRef.current) return;
      navigatingRef.current = true;
      router.push("/picks");
    },
    [occasionId, fetchPicks, router],
  );

  const onAboveLayout = useCallback((e: LayoutChangeEvent) => setAboveHeight(Math.ceil(e.nativeEvent.layout.height)), []);

  // ----- dock centre: one lime action, four states -----
  const hasBothHooks = hookIds[0] !== null && hookIds[1] !== null;

  let center: DockCenter;
  if (!occasion && hasBothHooks) {
    center = {
      label: "Try on",
      labelVi: "Vào thử đồ",
      accessibilityLabel: "Try on the two selected pieces",
      accessibilityHint: "Opens camera setup directly to try on your selected pieces",
      icon: Camera,
      tone: "lime",
      disabled: false,
      onPress: () => router.push("/setup"),
    };
  } else if (!occasion) {
    center = {
      label: "Style me",
      labelVi: "Phối đồ",
      accessibilityLabel: "Style me",
      accessibilityHint: "Choose an occasion first or pick pieces from your closet",
      icon: Sparkles,
      tone: "lime",
      disabled: true,
      onPress: () => undefined,
    };
  } else if (loading) {
    center = {
      label: "Styling…",
      labelVi: "Đang phối…",
      accessibilityLabel: `Styling. Getting two picks for ${occasion.label}`,
      icon: Sparkles,
      tone: "lime",
      loading: true,
      onPress: () => undefined,
    };
  } else if (picksStatus === "error") {
    center = {
      label: "Try again",
      labelVi: "Thử lại",
      accessibilityLabel: `Try again: get two picks for ${occasion.label}`,
      icon: RotateCcw,
      tone: "lime",
      onPress: () => void styleMe(true),
    };
  } else {
    center = {
      label: "Style me",
      labelVi: "Phối đồ",
      accessibilityLabel: `Style me: get two picks for ${occasion.label}`,
      accessibilityHint: "Opens your two picks",
      icon: Sparkles,
      tone: "lime",
      onPress: () => void styleMe(),
    };
  }

  const above = showError ? (
    <PicksErrorPanel message={picksError} code={picksErrorCode} status={picksErrorStatus} onDismiss={() => setErrorDismissed(true)} onLayout={onAboveLayout} />
  ) : loading && pendingVisible && occasion ? (
    <PendingNote occasionLabel={occasion.label} onLayout={onAboveLayout} />
  ) : null;

  return (
    <Screen
      header={
        <TopBar
          showBack={false}
          inset="gutter"
          left={<BrandMark onLongPress={() => setHealthCheckOpen(true)} />}
          right={
            <View style={styles.topRight}>
              <Touchable
                accessibilityRole="button"
                accessibilityLabel="Mở tủ đồ cá nhân"
                onPress={() => setClosetOpen(true)}
                bg={colors.surface}
                pressedBg={colors.surfaceDeep}
                style={styles.closetBtn}
                testID="open-closet-btn"
              >
                <Layers size={14} color={colors.ink} strokeWidth={2} />
                <AppText variant="caption" weight={700}>
                  {tr(locale, "Closet", "Tủ đồ")}
                </AppText>
              </Touchable>
              <SavedButton count={savedLoaded ? saved.length : null} onPress={() => setSavedOpen(true)} />
            </View>
          }
        />
      }
      // Keep the last row reachable above a panel sitting on the dock.
      contentStyle={above ? { paddingBottom: clearance + aboveHeight + spacing.gap } : undefined}
      overlay={
        <>
          <FittingDock
            hooks={hookIds}
            center={center}
            onHookPress={hasBothHooks ? () => router.push("/setup") : () => setClosetOpen(true)}
            above={above}
            testID="occasion-dock"
          />
          <SavedSheet
            visible={savedOpen}
            onClose={() => setSavedOpen(false)}
            onRemoved={() => toast.show(tr(locale, "Removed", "Đã xoá"), { announcement: "Look removed" })}
          />
          <ClosetSheet
            visible={closetOpen}
            onClose={() => setClosetOpen(false)}
          />
          <PreStageModal
            visible={healthCheckOpen}
            onClose={() => setHealthCheckOpen(false)}
          />
        </>
      }
      testID="screen-choose-occasion"
    >
      <View style={styles.intro}>
        <AppText variant="headline" weight={800} helper="Bạn chuẩn bị cho dịp nào?" containerStyle={styles.headline}>
          What&apos;s the occasion?
        </AppText>
        <AppText variant="caption" tone="muted" helper="Chọn một dịp để AI Stylist phối đồ, hoặc chọn từ tủ đồ bên dưới.">
          Pick an occasion for AI styling, or pick pieces from your closet below.
        </AppText>
      </View>

      <OccasionGroup accessibilityLabel="Occasion">
        {OCCASION_OPTIONS.map((o) => (
          <OccasionCard key={o.id} option={o} selected={occasionId === o.id} onPress={() => setOccasion(o.id)} testID={`occasion-${o.id}`} />
        ))}
      </OccasionGroup>

      {occasionId === "other" && (
        <View style={styles.customOccasionBox}>
          <View style={styles.customInputRow}>
            <Sparkles size={16} color={colors.ink} strokeWidth={2.2} />
            <TextInput
              style={styles.customInput}
              placeholder={tr(locale, "Enter your occasion (e.g. Beach Wedding...)", "Nhập dịp của bạn (vd: Tiệc cưới bãi biển, Đi bar tối...)")}
              placeholderTextColor={colors.muted}
              value={customOccasion ?? ""}
              onChangeText={setCustomOccasion}
              maxLength={80}
              returnKeyType="done"
            />
            {customOccasion ? (
              <Touchable
                accessibilityRole="button"
                accessibilityLabel="Clear custom occasion"
                onPress={() => setCustomOccasion("")}
                hitSlop={8}
                style={styles.clearBtn}
              >
                <X size={14} color={colors.muted} strokeWidth={2.5} />
              </Touchable>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTagsScroll}>
            {QUICK_OCCASIONS.map((tag) => {
              const text = locale === "vi" ? tag.vi : tag.en;
              const isSelected = customOccasion === text;
              return (
                <Touchable
                  key={tag.en}
                  accessibilityRole="button"
                  onPress={() => setCustomOccasion(isSelected ? "" : text)}
                  bg={isSelected ? colors.ink : colors.surface}
                  pressedBg={isSelected ? colors.ink : colors.surfaceDeep}
                  style={[styles.quickTagPill, isSelected && styles.quickTagPillSelected]}
                >
                  <AppText variant="caption" weight={isSelected ? 700 : 500} tone={isSelected ? "paper" : "ink"}>
                    {text}
                  </AppText>
                </Touchable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.styleSection}>
        <View style={styles.styleHeaderRow}>
          <AppText variant="label" weight={700} helper="Phong cách">
            Style vibe
          </AppText>
          <AppText variant="caption" tone="muted" helper="(Tuỳ chọn)">
            (Optional)
          </AppText>
        </View>
        <View style={styles.styleRow} accessibilityRole="radiogroup" accessibilityLabel="Style vibe">
          {STYLE_OPTIONS.map((s) => {
            const isSelected = style === s.value;
            const label = locale === "vi" ? s.labelVi : s.label;
            return (
              <Touchable
                key={s.value}
                accessibilityRole="radio"
                accessibilityLabel={label}
                aria-checked={isSelected}
                onPress={() => setStyle(s.value)}
                bg={isSelected ? colors.ink : colors.surface}
                pressedBg={isSelected ? colors.inkWell : colors.surfaceDeep}
                style={[styles.compactStyleChip, isSelected && styles.compactStyleChipSelected]}
                testID={`style-${s.value}`}
              >
                <AppText
                  variant="caption"
                  weight={isSelected ? 700 : 500}
                  tone={isSelected ? "paper" : "ink"}
                >
                  {label}
                </AppText>
              </Touchable>
            );
          })}
        </View>
      </View>

      {__DEV__ ? (
        <Touchable
          accessibilityRole="link"
          accessibilityLabel="Open the Gate 1 dev harness"
          onPress={() => router.push("/dev/tryon")}
          bg={colors.paper}
          pressedBg={colors.surface}
          style={styles.devLink}
          testID="dev-harness-link"
        >
          <Wrench size={14} color={colors.muted} strokeWidth={1.75} />
          <AppText variant="caption" tone="muted">
            Dev harness · Gate 1
          </AppText>
        </Touchable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  intro: { paddingTop: 4, paddingBottom: 12, gap: 4 },
  headline: { gap: 2 },
  customOccasionBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  quickTagsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  quickTagPill: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  quickTagPillSelected: {
    borderColor: colors.ink,
  },
  styleSection: { marginTop: 16, gap: 8 },
  styleHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  styleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  compactStyleChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  compactStyleChipSelected: {
    borderColor: colors.ink,
  },
  devLink: {
    marginTop: spacing.stack,
    alignSelf: "flex-start",
    minHeight: 36,
    paddingHorizontal: 8,
    marginLeft: -8,
    borderRadius: radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
