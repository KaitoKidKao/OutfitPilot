// Dashed lime body outline over the live camera preview (DESIGN.md: on photo/video the
// dashed lime body frame is the only guide shape). A soft ink underlay keeps the dashes
// readable on bright walls. Decorative: the frame's own label describes it.
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/lib/theme";

// viewBox 300 x 255 = 4:3.4, same as the preview frame. Head, then shoulders to hips.
const OUTLINE =
  "M150 30c15.5 0 27 12.5 27 29s-11.5 30-27 30-27-13.5-27-30 11.5-29 27-29Z" +
  "M90 148c4-26 25-44 50-46h20c25 2 46 20 50 46l7 99H83l7-99Z";

export function BodyGuide() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Svg width="100%" height="100%" viewBox="0 0 300 255">
        <Path d={OUTLINE} fill="none" stroke={colors.ink} strokeOpacity={0.35} strokeWidth={4.5} strokeLinejoin="round" />
        <Path d={OUTLINE} fill="none" stroke={colors.lime} strokeWidth={2.5} strokeDasharray="7 6" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

/**
 * Paper-coloured corners drawn over the video. Android's RTCView is a SurfaceView and
 * ignores borderRadius / overflow clipping, so the rounded 24 pt frame is painted on top.
 */
export function CornerMask({ width, height, radius, color = colors.paper }: { width: number; height: number; radius: number; color?: string }) {
  if (width <= 0 || height <= 0) return null;
  const w = width;
  const h = height;
  const r = Math.min(radius, w / 2, h / 2);
  const d =
    `M0 0H${w}V${h}H0Z ` +
    `M${r} 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}H${r}A${r} ${r} 0 0 1 0 ${h - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Svg width={w} height={h}>
        <Path d={d} fill={color} fillRule="evenodd" />
      </Svg>
    </View>
  );
}
