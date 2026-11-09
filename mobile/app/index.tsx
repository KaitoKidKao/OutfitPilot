// DEV HARNESS entry. Not the product UI: the real 5-screen flow
// (Choose Occasion -> AI Picks -> Camera Setup -> Live Fitting Room -> Final Look)
// will be designed and built later from DESIGN.md.
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_URL } from "@/lib/api";
import { colors, radii, spacing, type } from "@/lib/theme";

export default function Home() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>OP</Text>
          </View>
          <Text style={styles.brand}>OutfitPilot</Text>
        </View>

        <Text style={styles.headline}>Dev harness</Text>
        <Text style={styles.body}>
          Gate 1: prove real AI try-on video on a physical iPhone and Android phone. This is not the product UI.
        </Text>
        <Text style={styles.helper}>Màn hình thử nghiệm kỹ thuật, chưa phải giao diện 5 màn hình của sản phẩm.</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>API</Text>
          <Text style={[styles.mono, !API_URL && styles.danger]}>
            {API_URL ?? "Not set. Copy .env.example to .env, set EXPO_PUBLIC_API_URL, restart Metro."}
          </Text>
        </View>

        <Link href="/dev/tryon" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open the live try-on test"
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>Open live try-on test</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: spacing.gutter, paddingVertical: spacing.section, gap: spacing.stack },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  logoText: { color: colors.lime, fontWeight: "800", fontSize: 14 },
  brand: { ...type.section, color: colors.ink },
  headline: { ...type.headline, color: colors.ink, marginTop: spacing.stack },
  body: { ...type.body, color: colors.ink },
  helper: { ...type.bodySm, color: colors.muted },
  infoCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: 16, gap: 6 },
  label: { ...type.label, color: colors.ink },
  mono: { ...type.bodySm, color: colors.muted },
  danger: { color: colors.danger },
  cta: { height: 48, borderRadius: radii.md, backgroundColor: colors.lime, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  ctaPressed: { backgroundColor: colors.limePress, transform: [{ scale: 0.98 }] },
  ctaText: { ...type.button, color: colors.ink },
});
