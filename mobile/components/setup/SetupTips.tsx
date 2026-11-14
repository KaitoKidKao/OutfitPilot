// Three setup tips as one row of small icon chips (Sang, 15:14: calmer screen):
// chest height · step back 1.5 m · enough light. Full sentences go to screen readers.
import { MoveHorizontal, Smartphone, SunMedium, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { colors, radii } from "@/lib/theme";

const TIPS: readonly { icon: LucideIcon; short: string; full: string }[] = [
  { icon: Smartphone, short: "Ngang ngực", full: "Đặt máy cao ngang ngực, chắc chắn" },
  { icon: MoveHorizontal, short: "Lùi 1,5 m", full: "Lùi khoảng 1,5 m để thấy từ đầu tới hông" },
  { icon: SunMedium, short: "Đủ sáng", full: "Đứng hướng về phía sáng, tránh ngược sáng" },
];

export function SetupTips() {
  return (
    <View accessibilityRole="list" style={styles.row}>
      {TIPS.map(({ icon: Icon, short, full }) => (
        <View key={short} style={styles.chip} accessible accessibilityLabel={full}>
          <Icon size={16} color={colors.ink} strokeWidth={2} />
          <AppText variant="caption" weight={700} numberOfLines={1}>
            {short}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
});
