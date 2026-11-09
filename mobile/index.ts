// App entry ("main" in package.json). Order matters:
// 1. crypto.getRandomValues polyfill (used by livekit-client for ids).
// 2. LiveKit WebRTC globals. Must run before expo-router/entry is imported,
//    otherwise @decartai/sdk throws REACT_NATIVE_SETUP_REQUIRED on connect.
// 3. Expo Router, imported last (Expo Router docs: custom entry for polyfills).
// Same pattern as DecartAI/decart-example-expo-realtime (index.ts).
import "react-native-get-random-values";
import "./livekit-bootstrap";
import "expo-router/entry";
