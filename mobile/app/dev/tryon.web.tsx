// Web stand-in for the Gate 1 harness (app/dev/tryon.tsx needs native WebRTC).
import { AppText, Screen, TopBar } from "@/components/ui";

export default function TryOnHarnessWeb() {
  return (
    <Screen header={<TopBar title="Dev harness" />} dockClearance={false}>
      <AppText variant="body" helper="Thử đồ trực tiếp chỉ chạy trong app trên điện thoại.">
        The live try-on harness runs only in the native app (development build).
      </AppText>
    </Screen>
  );
}
