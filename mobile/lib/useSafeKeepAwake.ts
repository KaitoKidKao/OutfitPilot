import { Platform } from "react-native";
import { useKeepAwake as useExpoKeepAwake } from "expo-keep-awake";

/**
 * Platform-safe screen keep-awake hook.
 * On Web, navigator.wakeLock is asynchronous and throws ERR_KEEP_AWAKE_TAG_INVALID
 * if unmounted or navigated away before activation resolves.
 * On native iOS and Android, it safely keeps the screen on during camera fitting.
 */
export function useSafeKeepAwake(tag?: string) {
  if (Platform.OS !== "web") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useExpoKeepAwake(tag, { suppressDeactivateWarnings: true });
  }
}
