import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "@/components/ui/Toast";
import { INTER_FONT_MAP, setInterReady } from "@/lib/fonts";
import { AppStoreProvider } from "@/lib/store";
import { colors } from "@/lib/theme";

// Keep the native splash up until Inter loads (or fails). Global scope, not awaited.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Never hold the splash longer than this: fall back to the system font instead. */
const FONT_TIMEOUT_MS = 4000;

export default function RootLayout() {
  const [loaded, error] = useFonts(INTER_FONT_MAP);
  const [timedOut, setTimedOut] = useState(false);
  const ready = loaded || !!error || timedOut;

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, []);

  if (ready) setInterReady(loaded);

  useEffect(() => {
    if (error) console.warn("[fonts] Inter failed to load; using the system font.", error);
    if (ready) SplashScreen.hide();
  }, [ready, error]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, fullScreenGestureEnabled: false, contentStyle: { backgroundColor: colors.paper } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="picks" />
            <Stack.Screen name="trends" options={{ animation: "none" }} />
            <Stack.Screen name="setup" />
            <Stack.Screen name="fitting" options={{ contentStyle: { backgroundColor: colors.studio } }} />
            <Stack.Screen name="final" />
          </Stack>
        </ToastProvider>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
