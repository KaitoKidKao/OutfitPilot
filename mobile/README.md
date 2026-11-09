# OutfitPilot — Mobile (React Native + Expo)

App iOS + Android của OutfitPilot, viết bằng **React Native + Expo SDK 58 (TypeScript, Expo Router)**.
App chạy bằng **development build**. **Expo Go không chạy được** vì WebRTC (LiveKit) là code native.

> **Hiện trạng: đây mới là DEV HARNESS cho Gate 1** ("video AI thật trên iPhone và Android").
> Màn `app/dev/tryon.tsx` cố tình làm đơn giản để chứng minh luồng camera → Decart Lucy VTON → video chạy trên máy thật.
> Giao diện 5 màn hình thật (Choose Occasion → AI Picks → Camera Setup → Live Fitting Room → Final Look) sẽ được thiết kế sau theo `DESIGN.md`.

## Cấu trúc

```
mobile/
  index.ts               entry: polyfill → registerGlobals() (LiveKit) → expo-router/entry
  livekit-bootstrap.ts   gọi registerGlobals() trước khi router chạy
  app/_layout.tsx        Stack của Expo Router
  app/index.tsx          màn vào dev harness
  app/dev/tryon.tsx      DEV HARNESS: đồng ý, camera, prompt, chọn ảnh áo, Start / Switch look / Stop
  lib/api.ts             client có kiểu cho API (mirror api/src/contract.ts)
  lib/decart.ts          module DUY NHẤT dùng @decartai/sdk (token ngắn hạn, connect, set(), stop)
  lib/useCamera.ts       getUserMedia qua @livekit/react-native-webrtc, camera trước mặc định, lật camera
  lib/useAppStateGuard.ts tắt AI + camera khi app xuống nền, quay lại thì hỏi trước
  lib/catalog.ts         catalog G01–G06 + 3 hoàn cảnh (giống docs/plan.md)
  lib/theme.ts           token màu/bo góc từ DESIGN.md
  assets/garments/       TODO: 6 ảnh áo CÓ BẢN QUYỀN G01.png … G06.png
  eas.json               profile development / preview / production
```

## Yêu cầu

- Node 18+ (máy hiện dùng Node 24), npm.
- **Điện thoại thật** (Android và/hoặc iPhone). Giả lập iOS/Android không truyền được video camera.
- Tài khoản Expo (miễn phí) để build qua EAS: `npx eas-cli@latest login`.
- **iPhone:** cần **tài khoản Apple Developer trả phí** để EAS ký bản build chạy trên máy thật. Không có Mac thì chỉ build được qua EAS (cloud).
- **Android build local (tùy chọn):** Android Studio + Android SDK + JDK 17, bật USB debugging.
- API OutfitPilot (`../api`) đang chạy, local hoặc trên Vercel.

## Cài đặt

```bash
cd mobile
npm install
cp .env.example .env      # rồi sửa EXPO_PUBLIC_API_URL
```

`.env` chỉ có **một** biến: `EXPO_PUBLIC_API_URL`. Không bao giờ đặt key Decart hay OpenAI ở đây:
mọi biến `EXPO_PUBLIC_*` bị nhúng nguyên văn vào JS bundle.

### Phiên bản đã chọn

| Gói | Phiên bản | Ghi chú |
| --- | --- | --- |
| expo | ~58.0.23 (RN 0.88.1, React 19.3) | template `default@sdk-58` |
| @decartai/sdk | 0.2.14 | cần ≥ 0.2 cho `lucy-vton-3.6`, `apiKeyProvider`, `speed: "fast"` (ví dụ Expo của Decart ghim 0.1.14, quá cũ) |
| livekit-client | 2.20.1 | khớp dependency `~2.20.1` của SDK để chỉ có một bản |
| @livekit/react-native | 3.1.0 | peer `@livekit/react-native-webrtc ^150.1.0` |
| @livekit/react-native-webrtc | 150.1.1 | |
| @livekit/react-native-expo-plugin | 1.1.0 | chấp nhận LiveKit 3.x |
| @config-plugins/react-native-webrtc | 15.0.2 | peer `expo >=56` (13.x chỉ cho SDK 54) |
| expo-dev-client, expo-image-picker | theo SDK 58 (`npx expo install`) | |

**Chưa kiểm chứng:** WebRTC 150.x build sạch trên RN 0.88 (New Architecture) hay không. Nếu build native lỗi, phương án dự phòng là bộ ghim của Decart: `@livekit/react-native@2.11.1` + `@livekit/react-native-webrtc@144.1.1` + `@livekit/react-native-expo-plugin@1.0.2` (giữ config plugin 15.0.2).

## Tạo development build

Mỗi khi thêm gói native hoặc đổi plugin trong `app.json` thì phải build lại dev client. Sửa JS thì không cần.

**Lần đầu với EAS** (tạo projectId trong `app.json`):

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

### Android (APK, không cần tài khoản trả phí)

Qua EAS (cloud):

```bash
npx eas-cli@latest build --profile development --platform android
```

Xong sẽ có link tải APK, mở trên điện thoại để cài (cho phép cài từ nguồn ngoài).

Hoặc build local (cần Android Studio, cắm điện thoại qua USB):

```bash
npx expo run:android      # tự chạy prebuild và cài lên máy
```

### iPhone (cần Apple Developer trả phí)

```bash
npx eas-cli@latest device:create                         # đăng ký UDID iPhone trước
npx eas-cli@latest build --profile development --platform ios
```

Cài xong bật **Developer Mode** trên iPhone (Settings → Privacy & Security). Profile `preview` (internal) và `production` có sẵn trong `eas.json`.

> Không cần chạy `npx expo prebuild` thủ công: `ios/` và `android/` được sinh từ `app.json` (đã nằm trong `.gitignore`).

## Chạy

```bash
npm start                 # = npx expo start --dev-client
```

Điện thoại và laptop dùng **cùng Wi-Fi / hotspot**. Mở app OutfitPilot (dev build) trên điện thoại, chọn server Metro hoặc quét QR.
Đổi `.env` thì khởi động lại Metro với `npx expo start --dev-client -c`.

## Trỏ app tới API

- **API local:** chạy `../api` trên laptop, rồi đặt `EXPO_PUBLIC_API_URL=http://<IP-LAN-của-laptop>:<port>`.
  `.env.example` dùng cổng **8787**, khớp cổng mặc định của API (`npm run dev` trong `api/`). Nếu chạy API với `PORT` khác thì sửa cổng trong `.env` cho khớp.
  `http://` chỉ được chấp nhận trong bản development build; bản release cần `https://`.
  Dùng IP LAN (ví dụ `192.168.1.23`), không dùng `localhost`. Trên Windows có thể phải cho phép cổng đó qua Windows Firewall.
- **API trên Vercel:** `EXPO_PUBLIC_API_URL=https://<tên-project>.vercel.app`.
- Kiểm tra nhanh: trong harness bấm **Check API health** (gọi `GET /api/health`).
- Bản build `preview`/`production` nhúng JS vào app nên cần biến này lúc build: đặt bằng `npx eas-cli@latest env:create` hoặc thêm `env` vào profile trong `eas.json`. `.env` bị gitignore nên EAS cloud không thấy.

## Kiểm tra Gate 1 trong harness

1. Home → **Open live try-on test**.
2. **Turn on camera** (lần đầu máy hỏi quyền camera). Pill trạng thái hiện `Camera preview · AI OFF`.
3. Đọc khối đồng ý và tick **I understand**.
4. **Pick garment photo** (ảnh áo nền trơn) và sửa prompt (hoặc chạm chip G01–G06 để điền prompt mẫu).
5. **Start AI try-on** → `Connecting to AI` → `Live AI try-on · AI LIVE` khi có khung hình AI đầu tiên. Đồng hồ đếm 120 giây.
6. Đổi ảnh/prompt rồi **Switch look** → `Switching look` → quay lại live, không kết nối lại.
7. **Stop**, rời màn, hoặc đưa app xuống nền → phiên AI dừng ngay; quay lại app sẽ hỏi trước khi bật lại camera.

## Bảo mật

- App chỉ biết `EXPO_PUBLIC_API_URL`. Token Decart ngắn hạn lấy từ `POST /api/realtime-token` qua `apiKeyProvider` trước mỗi lần connect / retry / reconnect.
- Khi kiểm tra JS bundle (T09): chuỗi tên biến `DECART_API_KEY` **có xuất hiện** vì chính `@decartai/sdk` chứa nó trong thông báo lỗi và hàm đọc env (trên React Native `process.env` không có biến này). Hãy grep **giá trị** key (phần đầu của key thật) thay vì tên biến.
  Lệnh xuất bundle để kiểm tra (local, không cần đăng nhập): `npx expo export --platform android --no-bytecode --output-dir <thư-mục-tạm>`.

## Giới hạn đã biết

- **Không chạy trong Expo Go**, chỉ dev build. **Chỉ điện thoại thật** (giả lập không có video camera).
- Kết nối với `preferredVideoCodec: "vp8"` (camera native dùng VP8).
- **Lật gương** camera trước làm trong `RTCView` (`mirror`), áp dụng cho cả preview và video AI; tùy chọn `mirror` của SDK bị từ chối trên React Native.
- Lật camera trong lúc AI chạy sẽ **dừng phiên** (phiên gắn với stream cũ); bấm Start lại để kết nối (có tính phí).
- App xuống nền (`AppState === "background"`) → tắt AI + camera. Không phản ứng với `inactive` của iOS vì trạng thái này cũng xảy ra khi iOS hiện hộp thoại xin quyền.
- Trên Android, trình chọn ảnh là activity riêng nên app tạm "xuống nền"; harness tạm bỏ qua guard trong lúc chọn ảnh, nên phiên AI (nếu đang chạy) vẫn tiếp tục trong vài giây đó.
- Mỗi phiên tối đa 120 giây (app tự dừng; token phía server là lớp chặn thứ hai).
- Fast mode: chỉ vùng US, giá gấp đôi, chọn lúc connect (không đổi bằng `set()`).
- Ảnh áo gửi cho Decart dạng **data URL base64** (hoặc URL https). URI `file://` không dùng được.
- Catalog chưa có ảnh: `assets/garments/G01.png … G06.png` là TODO, phải dùng ảnh có giấy phép.
- Font Inter chưa đóng gói; đang dùng font hệ thống.
- Không hỗ trợ web.

### Còn phải kiểm chứng trên máy thật (TODO trong code)

- Decart nhận ảnh áo dạng data URL trên React Native; giới hạn kích thước/định dạng ảnh của Lucy VTON 3.6 (`toDecartImage` trong `lib/decart.ts`).
- Câu prompt tối ưu cho VTON 3.6 (`tryOnPrompt` trong `lib/catalog.ts`).
- WebRTC 150.x trên RN 0.88; độ trễ Start → video AI (mục tiêu < 5 giây).
