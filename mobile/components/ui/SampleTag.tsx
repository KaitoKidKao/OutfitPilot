// "Sample" tag on stand-in garment photos (DESIGN.md Chips): white 90% pill,
// muted 11/600. On a white surface it gets a 1 px line border instead.
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { alpha, colors, radii } from "@/lib/theme";

import { AppText } from "./AppText";

export interface SampleTagProps {
  /** Default "Sample". */
  label?: string;
  /** Default "Ảnh mẫu". */
  labelVi?: string;
  /** "photo" (default) sits on an image; "surface" sits on white. */
  on?: "photo" | "surface";
  style?: StyleProp<ViewStyle>;
}

export function SampleTag({ label = "Sample", labelVi = "Ảnh mẫu", on = "photo", style }: SampleTagProps) {
  return (
    <View style={[styles.tag, on === "surface" ? styles.onSurface : styles.onPhoto, style]} accessibilityLabel="Sample photo" accessible>
      <AppText variant="tag" tone="muted" helper={labelVi} maxFontSizeMultiplier={1.2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full, alignSelf: "flex-start" },
  onPhoto: { backgroundColor: alpha.paper90 },
  onSurface: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
});
