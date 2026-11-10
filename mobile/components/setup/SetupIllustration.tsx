// Camera Setup illustration (DESIGN.md §6.3): the phone propped on a stand at chest
// height, its view reaching a person standing about 1.5 m away, framed by the same
// dashed lime body outline the live preview uses. Authored SVG, not a stock icon.
// The viewBox is exactly 4:3.4 so it fills the preview frame without letterboxing,
// and the distance label is real text (AppText) so it follows Dynamic Type.
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

import { AppText } from "@/components/ui";
import { colors, radii } from "@/lib/theme";

const VB_W = 340;
const VB_H = 289; // 340 / 289 = 4 / 3.4

// Distance line endpoints in viewBox units (the label pill is centred on it).
const DIST_X1 = 100;
const DIST_X2 = 236;
const DIST_Y = 262;

const pct = (v: number, of: number) => `${(v / of) * 100}%` as const;

export function SetupIllustration() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {/* floor */}
        <Rect x={0} y={236} width={VB_W} height={VB_H - 236} fill={colors.surfaceDeep} />

        {/* the phone's view, reaching the person */}
        <Path d="M92 138 L214 60 V236 L92 154 Z" fill={colors.paper} />

        {/* tripod: column + three legs */}
        <Line x1={78} y1={176} x2={78} y2={210} stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M78 210 L58 236 M78 210 L98 236 M78 210 V236" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* clamp */}
        <Rect x={70} y={170} width={16} height={7} rx={2} fill={colors.ink} />

        {/* phone, portrait, screen facing the person */}
        <Rect x={64} y={116} width={28} height={58} rx={6} fill={colors.ink} />
        <Rect x={67.5} y={121} width={21} height={48} rx={3} fill={colors.inkWell} />
        {/* lens: lime = camera running (DESIGN.md) */}
        <Circle cx={88} cy={146} r={2.6} fill={colors.lime} />

        {/* person, about 1.5 m away */}
        <Circle cx={254} cy={92} r={17} fill={colors.ink} />
        <Path d="M224 170 C226 138 238 120 254 120 C270 120 282 138 284 170 V236 H224 Z" fill={colors.ink} />
        <Line x1={254} y1={196} x2={254} y2={236} stroke={colors.surfaceDeep} strokeWidth={2} />

        {/* dashed body outline, the same guide the live preview shows */}
        <Rect x={212} y={62} width={84} height={172} rx={16} fill="none" stroke={colors.lime} strokeWidth={2.5} strokeDasharray="7 6" />

        {/* chest-height tick on the person, level with the lens */}
        <Line x1={204} y1={146} x2={212} y2={146} stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={98} y1={146} x2={106} y2={146} stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" />

        {/* distance */}
        <Line x1={DIST_X1} y1={DIST_Y} x2={DIST_X2} y2={DIST_Y} stroke={colors.muted} strokeWidth={1.5} />
        <Path
          d={`M${DIST_X1 + 6} ${DIST_Y - 5} L${DIST_X1} ${DIST_Y} L${DIST_X1 + 6} ${DIST_Y + 5} M${DIST_X2 - 6} ${DIST_Y - 5} L${DIST_X2} ${DIST_Y} L${DIST_X2 - 6} ${DIST_Y + 5}`}
          stroke={colors.muted}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>

      {/* Real text so it scales with the user's font size. */}
      <View style={styles.distanceWrap}>
        <View style={styles.distancePill}>
          <AppText variant="label" weight={700} tabular maxFontSizeMultiplier={1.3}>
            ≈ 1.5 m
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  distanceWrap: {
    position: "absolute",
    left: pct(DIST_X1, VB_W),
    width: pct(DIST_X2 - DIST_X1, VB_W),
    top: pct(DIST_Y, VB_H),
    alignItems: "center",
    // centre the pill on the line
    transform: [{ translateY: -13 }],
  },
  distancePill: {
    minHeight: 26,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderRadius: radii.full,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
