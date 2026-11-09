---
name: OutfitPilot
description: Phòng thử đồ ảo cá nhân trên di động. Treo hai món lên dock, thử trên chính bạn, rồi giữ một món.
colors:
  paper: "#FFFFFF"
  surface: "#F4F6F5"
  surface-deep: "#EAEEEC"
  line: "#E3E7E5"
  ink: "#0F1713"
  ink-well: "#1E2924"
  ink-line: "#2E3A34"
  muted: "#5B6660"
  muted-dark: "#A9B3AE"
  lime: "#C8F169"
  lime-press: "#B6E34F"
  lime-soft: "#EEF9DA"
  lime-ink: "#3F5A12"
  studio: "#0B100E"
  danger: "#B42318"
  danger-soft: "#FDECEA"
typography:
  display:
    fontFamily: "Inter"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  section:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: 600
  studio-numeral:
    fontFamily: "Inter"
    fontSize: "112px"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
rounded:
  sm: "12px"
  md: "14px"
  lg: "16px"
  xl: "18px"
  "2xl": "20px"
  card: "22px"
  hero: "24px"
  dock: "30px"
  full: "9999px"
spacing:
  gutter: "20px"
  gap: "10px"
  stack: "16px"
  section: "28px"
  dock-clearance: "168px"
components:
  button-next:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "48px"
  button-next-hover:
    backgroundColor: "{colors.lime-press}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: "52px"
  button-ink-hover:
    backgroundColor: "{colors.ink-well}"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.surface-deep}"
  button-on-dark:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  dock:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.dock}"
    padding: "10px"
  dock-center:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    height: "64px"
  dock-center-stop:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    height: "64px"
  dock-hook:
    backgroundColor: "{colors.ink-well}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    height: "76px"
  dock-hook-hover:
    backgroundColor: "{colors.ink-line}"
  dock-hook-lit:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "48px"
  segmented:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "4px"
  segmented-on:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    height: "48px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
  note-panel:
    backgroundColor: "{colors.lime-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: OutfitPilot

> Ghi lại từ bản build Next.js đã hoàn thành (hướng **Fitting Dock · Fresh White**, người dùng chốt ngày 2026-11-09, thay cho bảng màu kem/xanh rừng/mint của V4). Token trong frontmatter là chuẩn; phần chữ giải thích cách dùng. Nếu code khác tài liệu này, hãy kiểm tra quyết định sản phẩm mới nhất trước khi sửa.
>
> **Nền tảng (cập nhật 2026-11-09):** OutfitPilot là **mobile app iOS + Android viết bằng React Native + Expo**, không phải web/PWA. Bản Next.js nằm ở `prototype/` và chỉ là bản mẫu tham chiếu giao diện. Mọi giá trị px trong tài liệu này dùng nguyên số cho đơn vị điểm (pt/dp) của React Native; màu, bo góc, khoảng cách và cỡ chữ giữ nguyên.

## Overview

**Creative North Star: "The Fitting Dock"**

OutfitPilot là một **phòng thử đồ ảo trên điện thoại**, không phải dashboard hay feed mua sắm. Hình ảnh trung tâm là một thanh dock đen cố định dưới ngón cái, có hai móc treo giữ **Look A** và **Look B** trên mọi màn hình, nút hành động chính nằm giữa. Ảnh thumbnail sản phẩm "treo" từ thanh ray của dock và đung đưa vào chỗ khi đổi món. Người mua luôn thấy mình đang cân nhắc hai món nào, dù đang ở màn hình nào.

Nền trắng sạch, chữ mực xanh-đen gần như đen, đường kẻ mảnh, và **một màu lime duy nhất** đánh dấu việc cần làm tiếp theo và món đang được chọn. Mật độ thoáng nhưng gọn: một cột 20px lề, tiêu đề đậm và ngắn, ảnh sản phẩm làm nhân vật chính. Chữ hướng dẫn song ngữ: tiếng Anh là dòng chính, tiếng Việt là dòng phụ màu muted, nối bằng " · " hoặc xuống dòng.

Fitting Studio là ngoại lệ tối duy nhất: video camera tràn màn hình trên nền gần đen, chữ số A/B và đếm ngược cỡ rất lớn bằng lime để đọc được từ 1–2 m. Dock vẫn ở đó, cùng hình dạng, nên người dùng không phải học lại điều khiển.

**Key Characteristics:**
- Dock đen bo tròn cố định đáy màn hình, hai móc A/B và nút giữa, có mặt trên cả sáu màn hình.
- Nền trắng / bề mặt xám-xanh rất nhạt / viền mảnh; lime chỉ cho hành động kế tiếp và look đang sáng.
- Inter, tiêu đề 800 với tracking âm chặt; chữ thân 15px dễ đọc.
- Phẳng theo mặc định; chỉ dock, toast và thẻ look nổi trên video có bóng.
- Viền nét đứt 1.5px nghĩa là "trống / thêm vào".
- Studio tối, chữ số khổng lồ, nhãn trung thực "AI OFF".

## Colors

Bảng màu "Fresh White": trắng và xám-xanh lạnh, mực gần đen, một điểm nhấn lime tươi.

### Primary
- **Fitting Lime** (`lime`): hành động kế tiếp (nút giữa dock, nút "Add a product" ở trạng thái trống, nút "Decide"), móc A/B đang sáng, bước hiện tại trên Home, huy hiệu "Look A/B" trên ảnh, chữ "before" trong headline, chấm trạng thái camera đang chạy, vùng chọn văn bản, viền focus trên nền tối, đường khung cơ thể nét đứt trong Setup/Studio, chữ số lớn trong Studio.
- **Lime Press** (`lime-press`): trạng thái hover/nhấn của mọi bề mặt lime.
- **Lime Soft** (`lime-soft`): nền khối thông tin quyền riêng tư / lỗi camera ở Setup. Một vùng nhạt để đọc, không phải nút.
- **Lime Ink** (`lime-ink`): chữ "Check with store" trên thẻ Decision. Lime đậm đủ tương phản trên nền trắng khi cần màu nhấn ở dạng chữ.

### Neutral
- **Ink** (`ink`): chữ chính, thân dock, toast, nút submit chính của form, nút "Open store" trong Saved, huy hiệu chữ cái trên thẻ Decision, logo "OP".
- **Ink Well** (`ink-well`): lòng móc treo trên dock; hover của nút ink.
- **Ink Line** (`ink-line`): hover của móc treo chưa sáng.
- **Muted** (`muted`): chữ phụ, dòng tiếng Việt, nhãn dt, gợi ý trường nhập, thanh ray trên móc. Đạt tương phản AA trên trắng và trên `surface`.
- **Muted Dark** (`muted-dark`): chữ phụ trên nền ink (tên món trong móc chưa sáng, nút giữa dạng quiet).
- **Paper** (`paper`): nền mọi màn hình sáng, nền input, thẻ look nổi trên video, nút "Finish" và "Stop" trên nền tối.
- **Surface** (`surface`): nút phụ, ô icon, nền segmented A/B, nền ảnh khi đang tải, ghi chú thông tin.
- **Surface Deep** (`surface-deep`): hover của nút surface; nền body ngoài khung app trên desktop.
- **Line** (`line`): viền mảnh 1px của danh sách, input, đường chia, viền nét đứt trạng thái trống.
- **Studio Black** (`studio`): nền Fitting Studio phía sau video.

### Semantic
- **Danger** (`danger`) / **Danger Soft** (`danger-soft`): lỗi tại chỗ (thiếu ảnh, URL sai, hết bộ nhớ), hover nút xóa.

### Named Rules
**The Lime Means Next Rule.** Lime chỉ dành cho việc cần làm tiếp theo và look đang được chọn/giữ. Mỗi màn hình có đúng một hành động lime chính; không dùng lime làm màu trang trí, nền section hay gradient.

**The Ink Dock Rule.** Dock luôn là khối `ink` đặc, kể cả trên màn hình trắng; lòng móc dùng `ink-well`. Không đổi dock sang màu sáng hoặc trong suốt.

**The Dark Room Exception.** Chỉ Fitting Studio dùng nền tối (`studio`). Ở đó lớp phủ là đen trong mờ có blur, nút phụ là pill trắng, và focus ring chuyển sang lime.

## Typography

**Display Font:** Inter, đóng gói vào app bằng `expo-font` (các file 400, 500, 600, 700, 800, đủ dấu tiếng Việt).
**Body Font:** Inter. Nếu font chưa tải xong thì dùng font hệ thống (SF Pro trên iOS, Roboto trên Android); không hiện màn trắng chờ font.

**Character:** Một họ chữ duy nhất, cá tính đến từ độ đậm 800 và tracking âm chặt ở tiêu đề, còn chữ thân giữ nhẹ và thoáng để dễ đọc trên điện thoại.

### Hierarchy
- **Display** (800, 40px, line-height 1.02, -0.04em): chỉ headline Home "Try it before you buy it.", có một từ được tô nền lime bo 10px.
- **Headline** (800, 28px, ~1.25, -0.03em): h1 của Decision ("Which one do you keep?") và Saved ("Kept for later").
- **Title** (700, 22px, 1.25, -0.02em): tên sản phẩm trong look đang chọn; 20px cho tiêu đề form "Add a product". Thanh TopBar dùng 600, 17px, -0.01em.
- **Section** (700, 16px, -0.01em): tiêu đề nhóm như "Your pieces".
- **Body** (400, 15px, 1.625): đoạn giới thiệu, tối đa khoảng 34ch. Tiêu đề hàng trong danh sách dùng 15px/600.
- **Body small** (400, 13–14px): dòng phụ tiếng Việt, mô tả, nội dung trạng thái trống; 12px cho gợi ý trường nhập và chú thích.
- **Label** (600, 13px): nhãn trường, nút phụ, chip; nút chính 15px/600.
- **Studio numeral** (800, 112–132px, 0.85, -0.04em, tabular): chữ A/B đang hiển thị, đếm ngược 3 giây, màn chuyển look; số giây còn lại 44px.

### Named Rules
**The Tabular Facts Rule.** Giá, số đếm, số giây và số thứ tự bước luôn dùng chữ số tabular (`fontVariant: ['tabular-nums']`).

**The Bilingual Line Rule.** Tiếng Anh là dòng chính; tiếng Việt là dòng phụ nhỏ hơn, màu `muted`. Không đặt hai ngôn ngữ cùng cỡ cùng độ đậm.

## Layout

Thiết kế cho màn **390 × 844 pt** (iPhone 14/15), responsive 360–430 pt; trên tablet giữ cột nội dung tối đa 440 pt ở giữa. App chỉ chạy dọc (portrait).

- Một cột, lề ngang 20 (`gutter`); khoảng cách giữa các nhóm 28–32 (`section`); khoảng cách trong lưới ảnh 10 (`gap`); trong form 16 (`stack`).
- Mỗi màn hình là một `ScrollView` dọc; đáy nội dung chừa 168 + safe-area để không bị dock che.
- Dock đặt tuyệt đối ở đáy, cách safe-area 16, có lớp chuyển trắng phía trên (trên Studio là chuyển đen, dùng `expo-linear-gradient`) để nội dung mờ dần vào dock.
- Safe-area trên và dưới lấy từ `react-native-safe-area-context` (notch, Dynamic Island, thanh điều hướng Android). Toast nổi ở đỉnh, dưới safe-area.
- Lưới ảnh sản phẩm: 3 cột tỉ lệ 4:5 trong My Looks; hàng ngang snap 84 × 104px ở Home; 2 cột 4:5 trong Decision.
- Vùng chạm tối thiểu 44 × 44px; nút giữa dock 64px, móc 76px.

## Elevation & Depth

Phẳng theo mặc định: chiều sâu đến từ tông màu (trắng → `surface` → `surface-deep`) và viền mảnh `line`. Bóng chỉ xuất hiện trên những thứ nổi trên nội dung khác.

### Shadow Vocabulary
Giá trị gốc từ bản mẫu CSS; trên React Native dùng `shadowColor/shadowOffset/shadowOpacity/shadowRadius` cho iOS và `elevation` cho Android (hoặc `boxShadow` nếu bản React Native đang dùng hỗ trợ).
- **Dock** (gốc `0 12px 32px -8px rgba(15,23,19,0.35)`; iOS: màu `ink`, offset 0/12, opacity 0.35, radius 16; Android: elevation 12): thân dock, toast, thẻ look nổi trên video Studio.
- **Lift** (gốc `0 6px 18px -6px rgba(15,23,19,0.18)`; iOS: offset 0/6, opacity 0.18, radius 9; Android: elevation 4): ô A/B đang chọn trong segmented control.

### Named Rules
**The Float-Only Shadow Rule.** Chỉ phần tử thật sự nổi lên trên nội dung (dock, toast, thẻ trên video, tab đang chọn) mới có bóng. Thẻ, danh sách và nút trên nền trắng thì phẳng, phân tách bằng viền hoặc tông `surface`.

## Shapes

Góc bo mềm, tăng dần theo kích thước phần tử: 12px cho thumbnail và ô icon nhỏ, 14px cho nút và input, 16px cho tile ảnh và nút form, 18px cho segmented control, bảng thông tin và khối ghi chú, 20–22px cho thẻ, danh sách và móc dock, 24px cho ảnh lớn và khung preview camera, 30px cho thân dock. Pill tròn hẳn (`full`) chỉ dùng cho toast, chip trạng thái và các nút trên nền tối của Studio.

Viền 1px `line` cho danh sách và input. **Viền nét đứt 1.5px** là ngôn ngữ của trạng thái trống: móc chưa có món, tile "Add" / "New piece", vùng upload ảnh, cột Decision trống, trạng thái trống của Saved. Trên ảnh/video, khung cơ thể nét đứt lime là hình dáng hướng dẫn duy nhất.

Icon: `lucide-react-native`, nét 1.75 cho icon đường viền; 2–2.25 cho icon hành động nhỏ (Plus, mũi tên, Check).

### Named Rules
**The Dashed Means Empty Rule.** Nét đứt chỉ có nghĩa "chỗ này đang trống, chạm để thêm". Không dùng nét đứt để trang trí.

## Components

### Buttons
Chắc tay, rõ ràng, không viền.
- **Shape:** bo 14px (nút thường, cao 44–48px), 16px (nút form cao 52px), 22px (nút giữa dock).
- **Next (lime):** nền `lime`, chữ `ink`, 15px/600, cao 48px, lề ngang 20px. Dùng cho hành động kế tiếp khi không nằm trong dock (trạng thái trống, "Decide").
- **Ink:** nền `ink`, chữ trắng; nút submit của form ("Hang on Look A", "Save changes") và "Open store" trong Saved. Hover `ink-well`.
- **Quiet:** nền `surface`, chữ `ink`, 13px/600, cao 44px; nút phụ (Saved count, Edit, Open store trong Decision, Add link). Hover `surface-deep`. Nút xóa hover sang `danger-soft` / `danger`.
- **Ghost:** không nền, hover `surface` (Cancel, Back, đóng form).
- **On dark:** pill trắng chữ `ink` ("Finish", "Turn on camera"); nút icon tròn đen 40% có blur (`expo-blur`).
- **Pressed / Focus:** dùng `Pressable`; khi nhấn, nền chuyển sang màu hover tương ứng trong 200ms ease-out, nút dock thu nhỏ 0.96. Bản mẫu web có hover, trên điện thoại không có hover nên chỉ còn trạng thái nhấn. Mọi nút có `accessibilityRole` và `accessibilityLabel`; thứ tự đọc của VoiceOver/TalkBack theo thứ tự hiển thị. Disabled giảm còn 40–50% opacity và đặt `accessibilityState.disabled`.

### Chips
- **Sample tag:** pill trắng 90%, chữ `muted` 11px/600, gắn trên ảnh mẫu Unsplash; trên nền trắng dùng viền `line` thay bóng.
- **Slot badge:** ô vuông bo 8–12px với chữ cái 800; `lime` khi là look đang sửa/đang chọn, `ink` chữ trắng khi là look còn lại.
- **Status chip (Studio):** pill đen 40% có blur, chấm trạng thái (lime khi camera chạy), kèm chip "AI OFF" chữ lime.

### Cards / Containers
- **Corner Style:** 18–24px (xem Shapes).
- **Background:** trắng với viền `line`, hoặc nền `surface` không viền; không lồng thẻ trong thẻ.
- **Shadow Strategy:** phẳng (xem Elevation & Depth).
- **Border:** 1px `line`; danh sách chia hàng bằng đường `line`.
- **Internal Padding:** 16px ngang, 12px dọc cho hàng; 20–24px cho trạng thái trống.

### Inputs / Fields
- **Style:** cao 48px, nền trắng, viền 1px `line`, bo 14px, chữ 15px; icon dẫn đầu `muted` khi cần (link).
- **Label / hint:** nhãn 13px/600 phía trên; gợi ý 12px `muted` phía dưới, nói rõ dữ liệu do người dùng nhập ("You type it; we don't check it.").
- **Focus:** viền chuyển sang `ink`, không glow.
- **Error:** viền `danger`, thông báo 13px/500 `danger` ngay dưới trường, song ngữ.
- **Upload:** vùng nét đứt bo 20px, ô icon lime 48px, "Upload a photo" là lối vào chính; khi đã có ảnh thì thành khối `surface` với thumbnail và "Replace photo".

### Navigation
- **TopBar:** cao 56px, nút Back 44px bo 14px, tiêu đề 17px/600.
- **Segmented A/B:** khay `surface` bo 18px, hai ô cao 48px; ô đang chọn nền trắng + bóng `lift` + huy hiệu lime.
- **Dock** là điều hướng chính (xem dưới). Không có tab bar.

### Fitting Dock (signature)
Khối `ink` bo 30px, đệm 10px, bóng `dock`, lưới ba cột: **móc A · nút giữa · móc B**.
- **Móc (hook):** cao 76px, bo 22px, nền `ink-well`; thumbnail 44 × 56px bo 12px treo dưới một thanh ray 24 × 3px. Móc trống hiện khung nét đứt và "Empty · add". Khi **sáng** (look đang hiển thị trong Studio, hoặc món có thể giữ ở Decision) móc chuyển nền `lime`, chữ `ink`.
- **Ba chế độ:** *edit* (móc mở My Looks của slot đó), *switch* (Studio: chạm để chuyển look, `accessibilityState.selected`), *keep* (Decision: móc thành "Keep A" / "Keep B").
- **Nút giữa:** cao 64px, bo 22px. Tông `lime` cho hành động kế tiếp; `light` (trắng) cho Stop; `quiet` (trong suốt, chữ `muted-dark`) khi hành động chính nằm ở hai móc. Có nhãn chữ khi hành động cần rõ (Set up, Studio, Auto compare); chỉ icon + aria-label khi là "Add a product".
- **Phía trên dock:** khe `above` cho thanh tiến trình Studio (khối đen 55% blur, thanh lime 4px) hoặc panel "You've seen both looks" trắng.
- **Chuyển động:** thumbnail đung đưa vào chỗ (`hang`, 520ms) mỗi khi món trên móc thay đổi.

### Toast
Pill `ink` chữ trắng 14px/500 ở đỉnh màn hình, bóng `dock`, xuất hiện bằng `rise`; nội dung được đọc cho VoiceOver/TalkBack qua `AccessibilityInfo.announceForAccessibility`.

### Motion
Dùng `react-native-reanimated`. Đường cong ease-out `Easing.bezier(0.16, 1, 0.3, 1)` cho mọi chuyển động. Chuyển màu 200ms. `rise` 360ms cho nội dung mới; `wipe` 480ms (cắt từ trái sang) cho thẻ look và màn chuyển look; `count` 1000ms cho mỗi số đếm ngược; `hang` 520ms khi món trên móc đổi. Khi hệ điều hành bật giảm chuyển động (`useReducedMotion` / `AccessibilityInfo.isReduceMotionEnabled`), mọi animation chuyển ngay, không chạy hiệu ứng.

## Do's and Don'ts

### Do:
- **Do** giữ Fitting Dock ở đáy mọi màn hình mới, với móc A bên trái, B bên phải, hành động chính ở giữa.
- **Do** dùng đúng một hành động `lime` chính mỗi màn hình; hành động phụ dùng `surface`, `ink` hoặc ghost.
- **Do** dùng nền trắng, viền 1px `line` và tông `surface` để tách khối thay vì bóng.
- **Do** viết tiêu đề Inter 800 tracking âm (-0.03 đến -0.04em) ở cỡ 28px trở lên; chữ thân 15px.
- **Do** đặt ảnh sản phẩm lớn, tỉ lệ 4:5, bo 16–24px, làm nhân vật chính; gắn nhãn "Sample" cho ảnh mẫu.
- **Do** dùng viền nét đứt 1.5px cho mọi trạng thái trống có thể chạm để thêm.
- **Do** dùng chữ số tabular cho giá, số đếm và thời gian; đánh dấu giá là "you entered".
- **Do** ưu tiên thứ tự đọc **nhiệm vụ → ảnh sản phẩm → hành động → thông tin bổ trợ**.
- **Do** dùng icon lucide nét 1.75 và tôn trọng vùng chạm 44 × 44px, safe-area trên và dưới.

### Don't:
- **Don't** dùng lime làm màu nền section, gradient hay trang trí; lime chỉ để chỉ "tiếp theo" và "đang chọn".
- **Don't** làm dock sáng màu, trong suốt hoặc thay bằng tab bar cuộn.
- **Don't** dùng nền tối ngoài Fitting Studio.
- **Don't** thêm bóng cho thẻ hoặc nút nằm phẳng trên nền trắng; bóng chỉ dành cho dock, toast, thẻ trên video và tab đang chọn.
- **Don't** lồng thẻ bo góc trong thẻ bo góc, thêm gradient không cần thiết, nhiều badge hoặc câu quảng cáo dài làm chậm thao tác.
- **Don't** tự ý chuyển sang gradient tím thông dụng, cam thương mại điện tử chói hoặc màu neon ngẫu nhiên.
- **Don't** dùng icon 3D chung chung hay biểu đồ trang trí lớn; cá tính đến từ ảnh trang phục.
- **Don't** để cả trang cuộn ngang; chỉ một hàng thumbnail snap (như "Your pieces" ở Home) được phép cuộn ngang bên trong.

## 5. Nguyên tắc trải nghiệm

1. **Ưu tiên hiện ảnh trang phục.** Ảnh sản phẩm giúp người dùng hành động nhanh hơn một đoạn gợi ý dài.
2. **Một hành động chính mỗi màn hình.** Occasion → AI Picks → Camera Setup → Live Fitting → Final Look.
3. **Hỗ trợ một tay và hands-free.** Người dùng có thể đứng xa hoặc đặt máy trên bàn/giá đỡ.
4. **Không giả lập trạng thái AI như thể AI chạy thật.** Có nhãn riêng: "Camera preview", "Connecting to AI", "Live AI try-on", "Switching look", "Connection lost".
5. **Trung thực với thông tin mua hàng.** Gợi ý từ AI Stylist dựa trên quy tắc phục trang (dress code) và catalog 6 món; phân biệt gợi ý phong cách mang tính chủ quan với dữ kiện. Không bảo đảm đo size hay độ vừa vặn thực tế.
6. **Bảo mật và riêng tư.** Hình camera gửi trực tiếp đến Decart trong lúc thử đồ và không lưu lại; xin quyền camera minh bạch; dừng phiên ngay khi rời phòng thử.

## 6. Định hướng 5 màn hình Hackathon MVP

### 1. Choose Occasion (Chọn hoàn cảnh)
Thanh trên với logo "OP" lime trên nền ink + tên "OutfitPilot". Headline **"What's the occasion?"** (Inter 800, -0.04em) kèm phụ đề tiếng Việt. Lựa chọn 3 hoàn cảnh chính bằng thẻ bấm lớn bo 20px:
- **Job Interview** (Trang trọng, gọn gàng, sơ mi/blazer).
- **Campus Day** (Thoải mái, năng động, dễ vận động cả ngày).
- **Coffee Date** (Smart casual, thanh lịch, màu sắc ấm áp dễ gần).
Kèm bộ lọc phong cách tùy chọn (*Minimal*, *Casual*, *Smart*). Nút giữa Fitting Dock: **Style Me (Lime)** → chuyển ngay sang màn AI Picks.

### 2. AI Picks (Gợi ý từ Stylist)
Màn hình nhận diện 2 trang phục A & B do LLM đề xuất từ catalog 6 món:
- **Thẻ Look A (Best Match):** Ảnh áo 4:5 lớn bo 20px, tên món, lý do phục trang (reason - 1 câu súc tích), gợi ý phối đồ (pairWith).
- **Thẻ Look B (Alternative):** Món trang phục thay thế với độ trang trọng hoặc phong cách tương phản nhẹ kèm lý do trung thực.
Hai móc dock tự động treo Look A và Look B vào móc. Nút giữa Fitting Dock: **Set up camera (Lime)**.

### 3. Camera Setup (Căn góc máy & Bảo mật)
Khung preview 4:3.4 bo 24px: khi camera tắt hiện minh họa điện thoại dựng trên giá ngang ngực, người lùi xa ≈1,5 m; khi bật hiện video lật gương với khung người nét đứt lime và nhãn "Camera preview". Ba chỉ dẫn kèm icon: dựng máy vững ngang ngực, lùi lại 1,5 m, đủ ánh sáng. Màn đồng ý bảo mật nêu rõ: hình camera được truyền trực tiếp đến dịch vụ AI Decart để tạo trang phục và **không lưu lại video**. Nút giữa dock: **Allow camera** → chuyển thành **Start Fitting (Lime)**.

### 4. Live Fitting Room (Phòng thử đồ trực tiếp)
**Video thử đồ toàn màn hình** trên nền tối (`studio`). Thanh điều khiển trên: nút thoát, chip trạng thái **AI LIVE** (hoặc "AI OFF / preview only" khi chưa bật stream), nút đổi camera trước/sau, nút **Finish**. Khi phiên try-on hoạt động:
- Decart Lucy VTON 3.6 xử lý thời gian thực, lồng trang phục lên người dùng.
- Chữ A/B lime khổng lồ và đồng hồ đếm ngược (tối đa 120 giây) dễ nhìn từ cự ly 1,5–2 m.
- Móc dock A và B sáng đèn hiển thị look đang mặc; chạm để đổi look ngay trong phiên qua `set()`.
- Nút giữa dock: **Auto Compare** (chuyển đổi tự động mỗi 8 giây) đổi thành **Stop (Trắng)** khi đang chạy.

### 5. Final Look (Quyết định & Lưu lại)
Tiêu đề **"Which one do you keep?"**. Bố cục so sánh 2 cột Look A và Look B song song:
- Ảnh trang phục kèm chữ cái A/B, tên món và lý do chọn từ Stylist.
- Đánh dấu rõ ràng đây là mô phỏng thị giác, không cam kết kích cỡ chuẩn.
- Fitting Dock ở chế độ *keep*: hai móc trở thành nút lớn **Keep A** và **Keep B** để chốt món ưng ý và lưu vào bộ nhớ máy (`AsyncStorage`). Nút phụ cho phép xem lại danh sách hoặc thử lại từ đầu.

## 7. Tương tác và trạng thái

- Có trạng thái quyền camera, kết nối mạng, đang tải và lỗi.
- Auto Compare có thể dừng; cho phép đổi A/B thủ công và hủy đếm ngược.
- Không tự khởi động phiên AI tính phí khi chưa có thao tác đồng ý rõ ràng.
- Giới hạn phiên thử đồ tối đa 120 giây; khi rời màn hình hoặc app chuyển xuống nền (`AppState === 'background'`), ngắt kết nối stream và tắt camera ngay lập tức để tiết kiệm chi phí.
- Chuyển động gọn, mượt mà bằng `react-native-reanimated`; tự động vô hiệu hóa animation khi bật `isReduceMotionEnabled`.

## 8. Điểm vào sản phẩm trong tương lai — Sau Hackathon

- Thử ảnh áo tự tải lên (User Garment Upload).
- So sánh Before / After (ảnh người dùng trước khi mặc áo AI).
- Lưu tủ đồ cá nhân và kết nối mua sắm trực tiếp với shop thời trang.
- App clip / Instant app và bản phát hành chính thức trên App Store / Google Play.

## 9. Những điều không được làm khi thiết kế

Không tự tạo kết quả live AI giả, không giả nút checkout, không giả tích hợp tự động với cửa hàng và không khẳng định có thể đo size chính xác. Không thiết kế OutfitPilot thành social feed hay sàn bán hàng. Giữ đúng cấu trúc **5 màn hình tinh gọn** theo hành trình: *Choose Occasion → AI Picks → Camera Setup → Live Fitting Room → Final Look*.
