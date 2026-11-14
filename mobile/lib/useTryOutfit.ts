// Shared "try this outfit now" action (Mặc gì hôm nay grid + home quick try-on):
// hang the outfit's garments on hooks A/B and open camera setup.
import { useRouter } from "expo-router";
import { useCallback } from "react";

import { useToast } from "@/components/ui";
import { useAppStore } from "./store";
import type { TrendOutfit } from "./trends";

export function useTryOutfit() {
  const router = useRouter();
  const toast = useToast();
  const { assignHook, setActiveLook } = useAppStore();
  return useCallback(
    (o: TrendOutfit) => {
      assignHook("a", o.garments[0] ?? null);
      assignHook("b", o.garments[1] ?? null);
      setActiveLook("a");
      toast.show(`Đã chọn "${o.titleVi}" để thử`);
      router.push("/setup");
    },
    [assignHook, setActiveLook, toast, router],
  );
}
