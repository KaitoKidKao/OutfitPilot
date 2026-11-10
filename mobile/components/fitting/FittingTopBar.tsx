// Live Fitting Room top controls over the video: exit (stops camera + session),
// flip camera, white "Finish" pill; the honest status pill sits on its own row so
// the long "AI OFF / preview only" tag never squeezes the controls on a 360 pt phone.
import { Eye, EyeOff, SwitchCamera, X } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, IconButton, StatusPill, type StatusPillProps } from "@/components/ui";
import { sizes } from "@/lib/theme";

export interface FittingTopBarProps {
  pill: StatusPillProps;
  onExit: () => void;
  onFlip: () => void;
  flipDisabled?: boolean;
  /** Spoken when flipping would end a running AI session. */
  flipHint?: string;
  /** True when the live AI stream is available so the user can toggle Before/After. */
  canPeekOriginal?: boolean;
  peekingOriginal?: boolean;
  onToggleOriginal?: () => void;
  onFinish: () => void;
}

export function FittingTopBar({
  pill,
  onExit,
  onFlip,
  flipDisabled = false,
  flipHint,
  canPeekOriginal = false,
  peekingOriginal = false,
  onToggleOriginal,
  onFinish,
}: FittingTopBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <IconButton
          icon={X}
          variant="onDark"
          iconSize={24}
          accessibilityLabel="Exit fitting room"
          accessibilityHint="Stops the camera and the AI session"
          onPress={onExit}
        />
        <View style={styles.spacer} />
        {canPeekOriginal && onToggleOriginal ? (
          <IconButton
            icon={peekingOriginal ? EyeOff : Eye}
            variant="onDark"
            accessibilityLabel={peekingOriginal ? "Show AI outfit" : "Compare with original camera"}
            accessibilityHint="Switches between AI output and your raw camera without ending the session"
            onPress={onToggleOriginal}
          />
        ) : null}
        <IconButton
          icon={SwitchCamera}
          variant="onDark"
          accessibilityLabel="Flip camera"
          accessibilityHint={flipHint}
          disabled={flipDisabled}
          onPress={onFlip}
        />
        <Button
          label="Finish"
          labelVi="Xong"
          variant="onDark"
          onPress={onFinish}
          accessibilityHint="Ends the AI session and opens Final Look"
          style={styles.finish}
        />
      </View>
      <StatusPill {...pill} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { minHeight: sizes.topBar, flexDirection: "row", alignItems: "center", gap: 8 },
  spacer: { flex: 1 },
  // Button defaults to alignSelf flex-start; keep the pill on the same centre line as the icons.
  finish: { alignSelf: "center" },
});
