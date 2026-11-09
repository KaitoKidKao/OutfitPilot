// Small subset of the DESIGN.md tokens ("Fitting Dock · Fresh White") for the
// dev harness. Values are copied from the DESIGN.md frontmatter; px = pt/dp.
// The real 5-screen UI will get a fuller token module later.
import { Platform, type ViewStyle } from "react-native";

export const colors = {
  paper: "#FFFFFF",
  surface: "#F4F6F5",
  surfaceDeep: "#EAEEEC",
  line: "#E3E7E5",
  ink: "#0F1713",
  inkWell: "#1E2924",
  inkLine: "#2E3A34",
  muted: "#5B6660",
  mutedDark: "#A9B3AE",
  lime: "#C8F169",
  limePress: "#B6E34F",
  limeSoft: "#EEF9DA",
  limeInk: "#3F5A12",
  studio: "#0B100E",
  danger: "#B42318",
  dangerSoft: "#FDECEA",
} as const;

export const radii = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  card: 22,
  hero: 24,
  dock: 30,
  full: 9999,
} as const;

export const spacing = {
  gutter: 20,
  gap: 10,
  stack: 16,
  section: 28,
} as const;

export const type = {
  headline: { fontSize: 28, fontWeight: "800", letterSpacing: -0.84, lineHeight: 35 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.44, lineHeight: 28 },
  section: { fontSize: 16, fontWeight: "700", letterSpacing: -0.16 },
  body: { fontSize: 15, fontWeight: "400", lineHeight: 24 },
  bodySm: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
  label: { fontSize: 13, fontWeight: "600" },
  button: { fontSize: 15, fontWeight: "600" },
} as const;

/** DESIGN.md "Dock" shadow: only for things that float over other content. */
export const shadowDock: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  default: { elevation: 12 },
});
