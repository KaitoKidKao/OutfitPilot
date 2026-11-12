// CelebrationBurst: Micro-sparkle celebratory burst for delightful moments (DESIGN.md / Impeccable Delight).
// Pure React Native Reanimated particles (lime, gold, ink) that blossom outward on Keep Look or Save.
import { Sparkle, Sparkles, Star } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { colors } from "@/lib/theme";

interface ParticleConfig {
  id: number;
  angle: number; // in radians
  distance: number;
  size: number;
  color: string;
  delay: number;
}

const PARTICLE_COLORS = [colors.lime, "#F5E6C8", colors.ink, "#B8E948", "#FFF"];

export interface CelebrationBurstProps {
  active: boolean;
  onComplete?: () => void;
}

export function CelebrationBurst({ active, onComplete }: CelebrationBurstProps) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  const particles = useMemo<ParticleConfig[]>(() => {
    const list: ParticleConfig[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i * (2 * Math.PI)) / count + (Math.random() * 0.4 - 0.2);
      const distance = 36 + Math.random() * 24;
      const size = 6 + Math.random() * 6;
      const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length] ?? colors.lime;
      const delay = Math.random() * 60;
      list.push({ id: i, angle, distance, size, color, delay });
    }
    return list;
  }, []);

  useEffect(() => {
    if (active && !reduced) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 650 });
      const timer = setTimeout(() => {
        onComplete?.();
      }, 700);
      return () => clearTimeout(timer);
    } else {
      progress.value = 0;
    }
  }, [active, reduced, progress, onComplete]);

  if (!active || reduced) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.centerContainer}>
        {particles.map((p) => (
          <ParticleView key={p.id} config={p} progress={progress} />
        ))}
      </View>
    </View>
  );
}

function ParticleView({ config, progress }: { config: ParticleConfig; progress: SharedValue<number> }) {
  const dx = Math.cos(config.angle) * config.distance;
  const dy = Math.sin(config.angle) * config.distance;

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    const move = Math.sin((t * Math.PI) / 2);
    const opacity = t < 0.2 ? t * 5 : 1 - (t - 0.2) / 0.8;
    const scale = t < 0.3 ? t * 3.3 : Math.max(0, 1 - (t - 0.3) * 1.4);

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: [
        { translateX: dx * move },
        { translateY: dy * move },
        { scale },
        { rotate: `${t * 180}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    position: "absolute",
    top: "35%",
    left: "50%",
    width: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  particle: {
    position: "absolute",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
