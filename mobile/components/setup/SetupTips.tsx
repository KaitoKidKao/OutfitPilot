// Three setup tips (DESIGN.md §6.3): prop it at chest height, step back 1.5 m, face
// the light. Plain rows (icon tile + bilingual text), not cards.
import { MoveHorizontal, Smartphone, SunMedium, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { colors, radii } from "@/lib/theme";

interface Tip {
  icon: LucideIcon;
  title: string;
  titleVi: string;
}

const TIPS: readonly Tip[] = [
  { icon: Smartphone, title: "Prop it at chest height", titleVi: "Dựng máy ngang ngực, trên giá hoặc kệ chắc chắn" },
  { icon: MoveHorizontal, title: "Step back about 1.5 m", titleVi: "Lùi lại khoảng 1,5 m, đến khi thấy từ đầu tới hông" },
  { icon: SunMedium, title: "Face the light", titleVi: "Đứng đối diện cửa sổ hoặc đèn, tránh ngược sáng" },
];

export function SetupTips() {
  return (
    <View accessibilityRole="list" style={styles.list}>
      {TIPS.map(({ icon: Icon, title, titleVi }) => (
        <View key={title} style={styles.row} accessible accessibilityLabel={`${title}. ${titleVi}`}>
          <View style={styles.tile}>
            <Icon size={20} color={colors.ink} strokeWidth={1.75} />
          </View>
          <AppText variant="bodyStrong" helper={titleVi} containerStyle={styles.text}>
            {title}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
  tile: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1 },
});
