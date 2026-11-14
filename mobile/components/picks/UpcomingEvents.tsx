// "Sắp tới nên mặc gì" strip on Gợi ý cho bạn: the next holidays/events as a
// horizontal row of cards. The nearest one is lit lime to stand out; tapping a
// card asks the Stylist for two looks for that occasion.
import { CalendarDays, Sparkles } from "lucide-react-native";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText, Touchable } from "@/components/ui";
import { colors, radii, spacing } from "@/lib/theme";
import { daysLeftLabel, upcomingEvents, type UpcomingEvent } from "@/lib/upcoming";

export interface UpcomingEventsProps {
  onPick: (e: UpcomingEvent) => void;
  /** Id of the event currently being styled (shows "Đang phối…"). */
  activeId?: string | null;
}

export function UpcomingEvents({ onPick, activeId }: UpcomingEventsProps) {
  const events = useMemo(() => upcomingEvents(), []);
  if (events.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <CalendarDays size={18} color={colors.ink} strokeWidth={2} />
        <AppText variant="label" weight={800}>
          Sắp tới nên mặc gì
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroller}>
        {events.map((e, i) => {
          const first = i === 0;
          const busy = activeId === e.id;
          const dd = `${e.date.getDate()}/${e.date.getMonth() + 1}`;
          return (
            <Touchable
              key={e.id}
              accessibilityRole="button"
              accessibilityLabel={`${e.title}, ${daysLeftLabel(e.daysLeft).toLowerCase()}. ${e.hint}. Chạm để Stylist chọn 2 look`}
              onPress={() => onPick(e)}
              bg={first ? colors.lime : colors.surface}
              pressedBg={first ? colors.limePress : colors.surfaceDeep}
              style={[styles.card, !first && styles.cardQuiet]}
              testID={`upcoming-${e.id}`}
            >
              <View style={styles.cardTop}>
                <View style={[styles.datePill, first && styles.datePillOn]}>
                  <AppText variant="tag" weight={800} tone={first ? "paper" : "ink"}>
                    {dd}
                  </AppText>
                </View>
                <AppText variant="tag" weight={700} tone={first ? "ink" : "muted"}>
                  {daysLeftLabel(e.daysLeft)}
                </AppText>
              </View>
              <AppText variant="label" weight={800} numberOfLines={2}>
                {e.title}
              </AppText>
              <AppText variant="caption" tone={first ? "ink" : "muted"} numberOfLines={1}>
                {e.hint}
              </AppText>
              <View style={styles.cta}>
                <Sparkles size={13} color={colors.ink} strokeWidth={2.2} />
                <AppText variant="tag" weight={800} tone="ink">
                  {busy ? "Đang phối…" : "Phối đồ"}
                </AppText>
              </View>
            </Touchable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.gap },
  headRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  scroller: { marginHorizontal: -20 },
  row: { paddingHorizontal: 20, gap: 10 },
  card: { width: 150, minHeight: 132, borderRadius: radii.lg, padding: 12, gap: 6 },
  cardQuiet: { borderWidth: 1, borderColor: colors.line },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  datePill: { backgroundColor: colors.paper, borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 2 },
  datePillOn: { backgroundColor: colors.ink },
  cta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: "auto" },
});
