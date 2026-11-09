// Bilingual, user-facing copy for a failed POST /api/style on Choose Occasion.
//
// Classified on the store's `picksErrorCode` / `picksErrorStatus` (the ApiError code
// from lib/api.ts). Only when no code is known (a non-ApiError failure) do we fall
// back to matching the English line describeApiError() writes. Anything unrecognised
// becomes the generic "server" copy, so the user always gets a recovery step.
import type { LucideIcon } from "lucide-react-native";
import { CircleAlert, Clock, PlugZap, ServerCrash, WifiOff } from "lucide-react-native";

export type PicksErrorKind = "network" | "timeout" | "rate_limited" | "not_configured" | "server";

export interface PicksErrorCopy {
  kind: PicksErrorKind;
  icon: LucideIcon;
  title: string;
  titleVi: string;
  /** What to do next, in plain words. */
  recovery: string;
  recoveryVi: string;
}

export interface PicksErrorInfo {
  /** The store's picksError line (English, may be technical). */
  message: string | null;
  /** The store's picksErrorCode. */
  code?: string | null;
  /** The store's picksErrorStatus (0 = no response). */
  status?: number;
}

export function classifyPicksError({ message, code, status = 0 }: PicksErrorInfo): PicksErrorKind {
  if (status === 429) return "rate_limited";
  switch (code) {
    case "rate_limited":
      return "rate_limited";
    case "timeout":
      return "timeout";
    case "network_error":
      return "network";
    case "no_api_url":
    case "not_configured":
      return "not_configured";
    case "bad_request":
    case "upstream_error":
    case "not_found":
    case "internal_error":
    case "bad_response":
      return "server";
    default:
      break;
  }
  const m = (message ?? "").toLowerCase();
  if (m.includes("too many requests") || m.includes("rate_limited") || m.includes("http 429")) return "rate_limited";
  if (m.includes("timed out")) return "timeout";
  if (m.includes("cannot reach") || m.includes("network request failed") || m.includes("failed to fetch")) return "network";
  if (m.includes("api address not set") || m.includes("not configured") || m.includes("not_configured")) return "not_configured";
  return "server";
}

const COPY: Record<PicksErrorKind, Omit<PicksErrorCopy, "kind">> = {
  network: {
    icon: WifiOff,
    title: "Can't reach the stylist",
    titleVi: "Không kết nối được tới máy chủ",
    recovery: "Check your Wi-Fi or mobile data, then try again.",
    recoveryVi: "Kiểm tra Wi-Fi hoặc dữ liệu di động rồi thử lại.",
  },
  timeout: {
    icon: Clock,
    title: "That took too long",
    titleVi: "Máy chủ phản hồi quá lâu",
    recovery: "The connection may be slow. Try again in a moment.",
    recoveryVi: "Kết nối có thể đang chậm. Thử lại sau giây lát.",
  },
  rate_limited: {
    icon: CircleAlert,
    title: "Too many requests right now",
    titleVi: "Đang có quá nhiều yêu cầu",
    recovery: "Wait a few seconds, then try again.",
    recoveryVi: "Đợi vài giây rồi thử lại.",
  },
  not_configured: {
    icon: PlugZap,
    title: "The app isn't connected to its server",
    titleVi: "Ứng dụng chưa kết nối máy chủ",
    recovery: "Picks can't load until the server address is set.",
    recoveryVi: "Chưa thể tải gợi ý khi chưa đặt địa chỉ máy chủ.",
  },
  server: {
    icon: ServerCrash,
    title: "The stylist hit a problem",
    titleVi: "Máy chủ đang gặp sự cố",
    recovery: "This one is on our side. Try again in a moment.",
    recoveryVi: "Lỗi từ phía chúng tôi. Thử lại sau giây lát.",
  },
};

export function picksErrorCopy(info: PicksErrorInfo): PicksErrorCopy {
  const kind = classifyPicksError(info);
  return { kind, ...COPY[kind] };
}
