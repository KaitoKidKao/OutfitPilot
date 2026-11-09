// Design tokens for OutfitPilot ("Fitting Dock · Fresh White").
// Every value is copied from the DESIGN.md frontmatter (the source of truth);
// px = pt/dp. Letter spacing in DESIGN.md is in em; here it is converted to pt
// (fontSize * em). Do not add colours here that DESIGN.md does not define.
//
// Back-compat: `colors`, `radii`, `spacing`, `type` and `shadowDock` are used by the
// Gate 1 dev harness (app/dev/tryon.tsx). Keep their keys and values.
import { Platform, type TextStyle, type ViewStyle } from "react-native";
import { Easing } from "react-native-reanimated";

import type { FontWeight } from "./fonts";

// ---------- Colours (DESIGN.md colors) ----------

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

export type ColorToken = keyof typeof colors;

/**
 * Translucent versions of the tokens above (same hues, alpha only). DESIGN.md asks
 * for "black 40%" overlays in the studio, a "white 90%" Sample tag and fading scrims.
 */
export const alpha = {
  /** Status pill / round icon buttons over video (studio black, 55%). */
  studioOverlay: "rgba(11,16,14,0.55)",
  /** Progress block above the dock in the studio. */
  studioPanel: "rgba(11,16,14,0.72)",
  /** Sample tag on photos (paper, 90%). */
  paper90: "rgba(255,255,255,0.9)",
  /** Transparent end of the light scrim behind the dock. */
  paper0: "rgba(255,255,255,0)",
  /** Transparent end of the dark scrim behind the dock in the studio. */
  studio0: "rgba(11,16,14,0)",
  /** Modal backdrop (ink, 40%). */
  backdrop: "rgba(15,23,19,0.4)",
  /** Ghost icon button pressed on dark (paper, 12%). */
  paper12: "rgba(255,255,255,0.12)",
} as const;

// ---------- Radii (DESIGN.md rounded) ----------

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

// ---------- Spacing (DESIGN.md spacing) ----------

export const spacing = {
  gutter: 20,
  gap: 10,
  stack: 16,
  section: 28,
  /** Bottom padding every scrolling screen keeps free for the dock (plus the safe-area inset). */
  dockClearance: 168,
  /** Gap between the dock and the bottom safe-area edge. */
  dockInset: 16,
} as const;

// ---------- Sizes ----------

/** Minimum touch target: 44 pt on iOS (HIG), 48 dp on Android (Material). */
export const MIN_TARGET = Platform.OS === "android" ? 48 : 44;

export const sizes = {
  minTarget: MIN_TARGET,
  topBar: 56,
  dockCenter: 64,
  dockHook: 76,
  dockPadding: 10,
  /** Hook thumbnail that hangs from the rail. */
  hookThumb: { width: 44, height: 56 },
  hookRail: { width: 24, height: 3 },
  /** Max content column on tablets (DESIGN.md Layout). */
  maxContentWidth: 440,
  /** Dashed "empty" border width (DESIGN.md: 1.5). */
  dashedBorder: 1.5,
} as const;

// ---------- Typography (DESIGN.md typography) ----------

export type TypeVariant =
  | "display"
  | "headline"
  | "title"
  | "topBar"
  | "section"
  | "body"
  | "bodyStrong"
  | "bodySm"
  | "caption"
  | "label"
  | "button"
  | "tag"
  | "studioNumeral"
  | "studioSeconds";

export interface TypeToken {
  fontSize: number;
  weight: FontWeight;
  lineHeight?: number;
  letterSpacing?: number;
  /** Tabular numerals (DESIGN.md "Tabular Facts Rule"). */
  tabular?: boolean;
  /** Sensible cap for Dynamic Type / Android font scale (always >= 1.3). */
  maxScale: number;
}

const em = (fontSize: number, value: number) => Math.round(fontSize * value * 100) / 100;

/**
 * The full type ramp. Weights are applied through fontStyle(weight) from lib/fonts
 * (AppText does this for you). lineHeight is fontSize * DESIGN.md line-height.
 */
export const typeRamp: Record<TypeVariant, TypeToken> = {
  /** 800 / 40 / 1.02 / -0.04em. Home headline only. */
  display: { fontSize: 40, weight: 800, lineHeight: 41, letterSpacing: em(40, -0.04), maxScale: 1.3 },
  /** 800 / 28 / 1.25 / -0.03em. Screen h1. */
  headline: { fontSize: 28, weight: 800, lineHeight: 35, letterSpacing: em(28, -0.03), maxScale: 1.3 },
  /** 700 / 22 / 1.25 / -0.02em. Product name of the selected look. */
  title: { fontSize: 22, weight: 700, lineHeight: 28, letterSpacing: em(22, -0.02), maxScale: 1.4 },
  /** 600 / 17 / -0.01em. TopBar title. */
  topBar: { fontSize: 17, weight: 600, lineHeight: 22, letterSpacing: em(17, -0.01), maxScale: 1.3 },
  /** 700 / 16 / -0.01em. Group heading. */
  section: { fontSize: 16, weight: 700, lineHeight: 21, letterSpacing: em(16, -0.01), maxScale: 1.5 },
  /** 400 / 15 / 1.625. Body copy, reasons. */
  body: { fontSize: 15, weight: 400, lineHeight: 24, maxScale: 1.6 },
  /** 600 / 15. List row titles. */
  bodyStrong: { fontSize: 15, weight: 600, lineHeight: 21, maxScale: 1.6 },
  /** 400 / 13 / 1.375. Vietnamese helper line, descriptions, pairWith. */
  bodySm: { fontSize: 13, weight: 400, lineHeight: 18, maxScale: 1.6 },
  /** 400 / 12. Field hints and captions. */
  caption: { fontSize: 12, weight: 400, lineHeight: 17, maxScale: 1.6 },
  /** 600 / 13. Labels, chips, secondary buttons. */
  label: { fontSize: 13, weight: 600, lineHeight: 18, maxScale: 1.5 },
  /** 600 / 15. Primary buttons. */
  button: { fontSize: 15, weight: 600, lineHeight: 20, maxScale: 1.4 },
  /** 600 / 11. Sample tag, slot letters on tiny surfaces. */
  tag: { fontSize: 11, weight: 600, lineHeight: 14, maxScale: 1.3 },
  /** 800 / 112 / 0.85 / -0.04em, tabular. Giant A/B and countdown in the studio. */
  studioNumeral: {
    fontSize: 112,
    weight: 800,
    // 0.85 per DESIGN.md; Android clips glyph tops when lineHeight < fontSize.
    lineHeight: Platform.OS === "android" ? 112 : 95,
    letterSpacing: em(112, -0.04),
    tabular: true,
    maxScale: 1,
  },
  /** 800 / 44, tabular. Seconds left in the studio. */
  studioSeconds: { fontSize: 44, weight: 800, lineHeight: 48, letterSpacing: em(44, -0.03), tabular: true, maxScale: 1 },
};

/**
 * Legacy flat type styles used by the dev harness (system font). New UI code uses
 * <AppText variant="..."> instead.
 */
export const type = {
  headline: { fontSize: 28, fontWeight: "800", letterSpacing: -0.84, lineHeight: 35 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.44, lineHeight: 28 },
  section: { fontSize: 16, fontWeight: "700", letterSpacing: -0.16 },
  body: { fontSize: 15, fontWeight: "400", lineHeight: 24 },
  bodySm: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
  label: { fontSize: 13, fontWeight: "600" },
  button: { fontSize: 15, fontWeight: "600" },
} as const satisfies Record<string, TextStyle>;

// ---------- Shadows (DESIGN.md Elevation & Depth) ----------

/** DESIGN.md "Dock" shadow: dock body, toast, cards floating over video. */
export const shadowDock: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  web: { boxShadow: "0px 12px 32px -8px rgba(15,23,19,0.35)" },
  default: { elevation: 12 },
});

/** DESIGN.md "Lift" shadow: selected tab in a segmented control. */
export const shadowLift: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
  },
  web: { boxShadow: "0px 6px 18px -6px rgba(15,23,19,0.18)" },
  default: { elevation: 4 },
});

export const shadows = { dock: shadowDock, lift: shadowLift } as const;

// ---------- Motion (DESIGN.md Motion) ----------

export const motion = {
  /** Ease-out used for every animation: Easing.bezier(0.16, 1, 0.3, 1). */
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  duration: {
    /** Colour change on press. */
    color: 200,
    /** New content, toast entry. */
    rise: 360,
    /** Look card / look change wipe. */
    wipe: 480,
    /** One countdown step. */
    count: 1000,
    /** Thumbnail swinging onto a dock hook. */
    hang: 520,
  },
  /** Dock buttons shrink to this while pressed. */
  pressScale: 0.96,
  /** Auto Compare switches look every 8 s (DESIGN.md §6.4). */
  autoCompareMs: 8000,
} as const;

/** Convenience: text colour on each surface. */
export const onSurface = {
  light: { text: colors.ink, secondary: colors.muted },
  dark: { text: colors.paper, secondary: colors.mutedDark },
} as const;
