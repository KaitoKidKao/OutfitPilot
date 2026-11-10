# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

- **Mobile app iOS + Android:** React Native + Expo (TypeScript, Expo Router), chạy bằng development build (không dùng Expo Go vì cần WebRTC native).
- **AI try-on realtime:** `@decartai/sdk` + WebRTC của LiveKit (`@livekit/react-native`, `@livekit/react-native-webrtc`), theo ví dụ app Expo của Decart.
- **Backend:** một API nhỏ riêng (không dùng Next.js), chỉ giữ API key, cấp token Decart ngắn hạn và gọi LLM cho AI Stylist.
- **Không dùng Next.js / PWA cho sản phẩm.** Bản Next.js trong `prototype/` chỉ là bản mẫu tham chiếu giao diện.

## Users

- **Người dùng mục tiêu:** Người mua sắm thời trang online trên điện thoại thông minh cần xem và cân nhắc trang phục trước khi quyết định mua.
- **Bối cảnh sử dụng:** Đang lướt web/shop thời trang hoặc chuẩn bị mua sắm; mở điện thoại, dựng máy hoặc cầm tay để thử đồ qua camera (hands-free hoặc một tay) trong điều kiện ánh sáng phòng.

## Product Purpose

- Cung cấp **phòng thử đồ ảo di động (Virtual Fitting Studio)** giúp người dùng trực quan hóa trang phục lên vóc dáng thực tế.
- Hỗ trợ so sánh trực quan (Look A/B) để ra quyết định mua sắm tự tin, nhanh chóng và chính xác.

## Positioning

- Trợ lý thời trang cá nhân tập trung tối đa vào **phòng thử đồ ảo** và **quyết định A/B**, nói không với feed mạng xã hội rườm rà hay dashboard phân tích phức tạp.

## Operating Context

- Màn hình điện thoại chuẩn 390 × 844 pt (responsive 360–430 pt), chỉ chạy dọc; iOS và Android là hai nền tảng chính, tablet là phụ.
- Sử dụng camera trước/sau với quyền truy cập minh bạch (mô tả quyền camera trong Info.plist / AndroidManifest), hỗ trợ tư thế đứng xa (hands-free).
- Kiểm thử camera và AI trên điện thoại thật; giả lập iOS/Android không truyền được video camera.
- Tương tác với đường dẫn sản phẩm và ảnh chụp màn hình từ các shop thời trang.

## Capabilities and Constraints

- **Luồng tính năng chính:**
  1. **Choose Occasion:** Chọn dịp trang phục (Job Interview, Campus Day, Coffee Date) và phong cách.
  2. **AI Picks:** Hiển thị 2 gợi ý trang phục Look A & B từ LLM Stylist kèm lý do phục trang và gợi ý phối đồ.
  3. **Camera Setup:** Hướng dẫn căn góc máy 1.5m, xin quyền camera minh bạch và bảo mật dữ liệu.
  4. **Live Fitting Room:** Thử đồ camera toàn màn hình thời gian thực qua Decart Lucy VTON 3.6, chuyển đổi Look A/B, đếm ngược tối đa 120 giây.
  5. **Final Look:** So sánh Look A/B và chốt outfit ưng ý, lưu vào bộ nhớ máy (Saved Sheet).
- **Ràng buộc:**
  - Không tự giả lập kết quả AI chạy thật khi chưa kết nối dịch vụ (hiển thị rõ "Camera preview" hoặc "AI OFF / preview only").
  - Vùng chạm tối thiểu 44 × 44 px, tôn trọng safe-area (notch, home indicator).

## Brand Commitments

- **Tên:** OutfitPilot (Smart Shopping Edition).
- **Ngôn ngữ thiết kế:** Tinh thần biên tập thời trang cao cấp, tối giản, sang trọng nhưng thực dụng.
- **Bảng màu chủ đạo (Fresh White, người dùng chốt 2026-11-09, thay bảng màu V4):**
  - Nền trắng `#FFFFFF`, bề mặt `#F4F6F5`, viền `#E3E7E5`
  - Chữ chính và dock `#0F1713`, chữ phụ `#5B6660`
  - Điểm nhấn lime `#C8F169`, chỉ cho hành động kế tiếp và look đang chọn
  - Nền Fitting Studio `#0B100E`

## Evidence on Hand

- Tham chiếu thiết kế: [`DESIGN.md`](DESIGN.md) (hướng Fitting Dock · Fresh White).
- Bản mẫu giao diện Next.js: `prototype/` (chỉ để tham chiếu).
- Kế hoạch triển khai: [`docs/plan.md`](docs/plan.md).

## Product Principles

1. **Phòng thử đồ là trung tâm (Fitting First):** Video camera và trải nghiệm ướm thử trang phục chiếm vị trí ưu tiên cao nhất.
2. **Một hành động chính mỗi màn hình:** Hành trình tuyến tính rõ ràng: *Occasion → AI Picks → Camera Setup → Live Fitting → Final Look*.
3. **Trung thực & Minh bạch:** Phân biệt rõ giữa dữ liệu thực và gợi ý chủ quan; không hứa hẹn sai về khả năng tự động lấy dữ liệu từ mọi URL.
4. **Hands-free & Tối ưu một tay:** Điều khiển đặt ở cạnh dưới dễ thao tác khi đứng xa hoặc dùng một tay.

## Accessibility & Inclusion

- Tuân thủ tiêu chuẩn WCAG 2.1 AA; chữ phụ `#5B6660` đạt AA trên nền trắng và `#F4F6F5`.
- Hỗ trợ VoiceOver (iOS) và TalkBack (Android): mọi nút có nhãn, vai trò và trạng thái; hỗ trợ cỡ chữ hệ thống (Dynamic Type / font scale) mà không vỡ bố cục.
- Tôn trọng cài đặt giảm chuyển động của hệ điều hành cho các hiệu ứng chuyển đổi A/B và countdown.
