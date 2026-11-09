// Side-effect module: installs WebRTC globals (MediaStream, RTCPeerConnection, ...)
// that livekit-client and @decartai/sdk expect. Imported from index.ts before
// expo-router/entry. Do not move this into app/_layout.tsx.
import { registerGlobals } from "@livekit/react-native";

registerGlobals();
