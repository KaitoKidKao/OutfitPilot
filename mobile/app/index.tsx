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
import { RotateCcw, Sparkles, Wrench } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";

import { PendingNote, PicksErrorPanel } from "@/components/index/DockNotes";
import { OccasionCard, OccasionGroup } from "@/components/index/OccasionCard";
import { SavedButton } from "@/components/index/SavedButton";
import { FittingDock, type DockCenter } from "@/components/FittingDock";
import { SavedSheet } from "@/components/SavedSheet";
import { AppText, BrandMark, Chip, ChipGroup, Screen, TopBar, Touchable, useDockClearance, useToast } from "@/components/ui";
import { getOccasionOption, OCCASION_OPTIONS, STYLE_OPTIONS } from "@/lib/occasions";
import { useAppStore } from "@/lib/store";
import { colors, MIN_TARGET, radii, spacing } from "@/lib/theme";

/** Show the "Picking two pieces…" note only when the request outlasts this. */
const PENDING_NOTE_DELAY_MS = 1200;

export default function ChooseOccasion() {
  const router = useRouter();
  const toast = useToast();
  const clearance = useDockClearance();
  const { occasionId, style, setOccasion, setStyle, fetchPicks, picksStatus, picksError, picksErrorCode, picksErrorStatus, hookIds, saved, savedLoaded } =
    useAppStore();

  const [savedOpen, setSavedOpen] = useState(false);
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
  let center: DockCenter;
  if (!occasion) {
    center = {
      label: "Style me",
      accessibilityLabel: "Style me",
      accessibilityHint: "Choose an occasion first",
      icon: Sparkles,
      tone: "lime",
      disabled: true,
      onPress: () => undefined,
    };
  } else if (loading) {
    center = {
      label: "Styling…",
      accessibilityLabel: `Styling. Getting two picks for ${occasion.label}`,
      icon: Sparkles,
      tone: "lime",
      loading: true,
      onPress: () => undefined,
    };
  } else if (picksStatus === "error") {
    center = {
      label: "Try again",
      accessibilityLabel: `Try again: get two picks for ${occasion.label}`,
      icon: RotateCcw,
      tone: "lime",
      onPress: () => void styleMe(true),
    };
  } else {
    center = {
      label: "Style me",
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
          left={<BrandMark />}
          right={<SavedButton count={savedLoaded ? saved.length : null} onPress={() => setSavedOpen(true)} />}
        />
      }
      // Keep the last row reachable above a panel sitting on the dock.
      contentStyle={above ? { paddingBottom: clearance + aboveHeight + spacing.gap } : undefined}
      overlay={
        <>
          <FittingDock hooks={hookIds} center={center} above={above} testID="occasion-dock" />
          <SavedSheet
            visible={savedOpen}
            onClose={() => setSavedOpen(false)}
            onRemoved={() => toast.show("Removed · Đã xoá", { announcement: "Look removed" })}
          />
        </>
      }
      testID="screen-choose-occasion"
    >
      <View style={styles.intro}>
        <AppText variant="display" helper="Bạn chuẩn bị cho dịp nào?" containerStyle={styles.headline}>
          What&apos;s the occasion?
        </AppText>
        <AppText variant="body" helper="Chọn một dịp, hai món sẽ treo bên dưới." containerStyle={styles.lede}>
          Pick one. Two pieces will hang below.
        </AppText>
      </View>

      <OccasionGroup accessibilityLabel="Occasion">
        {OCCASION_OPTIONS.map((o) => (
          <OccasionCard key={o.id} option={o} selected={occasionId === o.id} onPress={() => setOccasion(o.id)} testID={`occasion-${o.id}`} />
        ))}
      </OccasionGroup>

      <View style={styles.styleSection}>
        <AppText variant="section" helper="Phong cách (không bắt buộc)">
          Style (optional)
        </AppText>
        <ChipGroup accessibilityLabel="Style, optional">
          {STYLE_OPTIONS.map((s) => (
            <Chip key={s.value} label={s.label} helper={s.labelVi} selected={style === s.value} onPress={() => setStyle(s.value)} testID={`style-${s.value}`} />
          ))}
        </ChipGroup>
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
  intro: { paddingTop: 8, paddingBottom: 20, gap: 10 },
  headline: { gap: 6 },
  lede: { maxWidth: 340 },
  styleSection: { marginTop: 24, gap: 10 },
  devLink: {
    marginTop: spacing.section,
    alignSelf: "flex-start",
    minHeight: MIN_TARGET,
    paddingHorizontal: 8,
    marginLeft: -8,
    borderRadius: radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
