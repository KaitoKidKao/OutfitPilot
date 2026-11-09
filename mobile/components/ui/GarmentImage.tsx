// Catalog garment photo: expo-image, 4:5 by default, rounded, surface while loading,
// "Sample" tag when the catalog marks the photo as a stand-in. With no garment (or no
// bundled photo) it shows the dashed "empty" frame (DESIGN.md: dashed = empty).
import { Image } from "expo-image";
import { Shirt } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { getGarment, type GarmentId } from "@/lib/catalog";
import { colors, radii, sizes } from "@/lib/theme";

import { AppText } from "./AppText";
import { SampleTag } from "./SampleTag";

export interface GarmentImageProps {
  garmentId: GarmentId | null | undefined;
  /** Width; height follows `aspectRatio`. Default "100%". */
  width?: DimensionValue;
  /** width / height. Default 4 / 5. */
  aspectRatio?: number;
  /** Default 20 (cards). Use 12 for thumbnails, 24 for hero images. */
  radius?: number;
  /** Show the "Sample" tag on sample photos. Default true (turn off below ~80 pt wide). */
  showSampleTag?: boolean;
  /** Text in the dashed empty state. Default "Empty". Pass "" for no text. */
  emptyLabel?: string;
  /** Dashed frame colour: "light" on paper (default), "dark" on ink/studio. */
  emptyTone?: "light" | "dark";
  /** Overrides the default label "<name>, sample photo". */
  accessibilityLabel?: string;
  /** Extra content layered over the photo (e.g. a slot badge). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function GarmentImage({
  garmentId,
  width = "100%",
  aspectRatio = 4 / 5,
  radius = radii.xxl,
  showSampleTag = true,
  emptyLabel = "Empty",
  emptyTone = "light",
  accessibilityLabel,
  children,
  style,
  testID,
}: GarmentImageProps) {
  const reduced = useReducedMotion();
  const garment = garmentId ? getGarment(garmentId) : null;
  const frame: ViewStyle = { width, aspectRatio, borderRadius: radius };

  if (!garment || garment.image === null) {
    const line = emptyTone === "dark" ? colors.mutedDark : colors.line;
    return (
      <View
        testID={testID}
        style={[frame, styles.empty, { borderColor: line }, style]}
        accessible
        accessibilityLabel={garment ? `${garment.name}, photo not available` : (accessibilityLabel ?? "Empty")}
      >
        <Shirt size={20} color={emptyTone === "dark" ? colors.mutedDark : colors.muted} strokeWidth={1.75} />
        {emptyLabel ? (
          <AppText variant="tag" tone={emptyTone === "dark" ? "mutedDark" : "muted"} align="center" numberOfLines={2}>
            {garment ? garment.name : emptyLabel}
          </AppText>
        ) : null}
        {children}
      </View>
    );
  }

  return (
    <View testID={testID} style={[frame, styles.photo, style]}>
      <Image
        source={garment.image}
        contentFit="cover"
        transition={reduced ? 0 : 200}
        style={StyleSheet.absoluteFill}
        accessible
        accessibilityLabel={accessibilityLabel ?? (garment.sample ? `${garment.name}, sample photo` : garment.name)}
      />
      {showSampleTag && garment.sample ? <SampleTag style={styles.tag} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { overflow: "hidden", backgroundColor: colors.surface },
  empty: {
    borderWidth: sizes.dashedBorder,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 6,
  },
  tag: { position: "absolute", top: 8, left: 8 },
});
