// ClosetSheet: Khu Tủ Đồ Cá Nhân & Quản Lý Món Đồ
// Thiết kế 100% Mobile Native theo ngôn ngữ "Fitting Dock · Fresh White" (DESIGN.md)
// - Native Bottom Sheet (vuốt xuống để đóng, có drag handle trên Android/iOS)
// - Segmented Control phẳng tối giản (Tất cả / Đã có / Wishlist)
// - Thanh chọn phân loại (Category) cố định chiều cao, không bị đè hay cắt nửa
// - Thẻ sản phẩm Hero Photo 4:5 bo góc chuẩn OutfitPilot (không đóng khung viền web)
// - Chạm mở Action Sheet trượt đáy chuẩn mobile (nút màu sắc rực rỡ, không bị mất nền)
// - Thêm bộ đồ mới từ Camera hoặc Thư viện ảnh với form mobile thoáng sạch

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Camera,
  Check,
  Image as ImageIcon,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Chip, IconButton, Touchable } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import type { GarmentId } from "@/lib/catalog";
import {
  ClosetCategory,
  ClosetItem,
  GenderFilter,
  OwnershipStatus,
  useCloset,
} from "@/lib/closet";
import { tr, useLocale } from "@/lib/locale";
import { useAppStore, type Slot } from "@/lib/store";
import { alpha, colors, radii, shadows, sizes, spacing } from "@/lib/theme";

export interface ClosetSheetProps {
  visible: boolean;
  onClose: () => void;
  defaultSlot?: Slot;
}

const IOS = Platform.OS === "ios";

export function ClosetSheet({ visible, onClose }: ClosetSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const locale = useLocale();
  const { items, addItem, updateItem, deleteItem, getMatchingPants } = useCloset();
  const { assignHook, hookIds, setActiveLook, gender } = useAppStore();

  const hasBothHooks = hookIds[0] !== null && hookIds[1] !== null;

  const [genderFilter, setGenderFilter] = useState<GenderFilter>(gender);
  const [statusFilter, setStatusFilter] = useState<OwnershipStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<ClosetCategory>("all");
  const [activeItem, setActiveItem] = useState<ClosetItem | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setGenderFilter(gender);
    }
  }, [visible, gender]);

  // New item form state
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<"outerwear" | "top" | "knitwear" | "pants">("outerwear");
  const [newColor, setNewColor] = useState("đen");
  const [newStatus, setNewStatus] = useState<"wishlist" | "owned">("wishlist");
  const [newPrice, setNewPrice] = useState("");
  const [newShop, setNewShop] = useState("");
  const [newFitAdvice, setNewFitAdvice] = useState("");
  const [newTryOnMode, setNewTryOnMode] = useState<"outfit" | "single">("outfit");

  const filteredItems = items.filter((it) => {
    if (genderFilter !== "all") {
      const itGender = it.gender ?? (it.id.startsWith("W") ? "women" : "men");
      if (itGender !== genderFilter && itGender !== "unisex") return false;
    }
    if (statusFilter !== "all" && it.status !== statusFilter) return false;
    if (categoryFilter !== "all") {
      if (categoryFilter === "dress" && (it.category === "dress" || it.category === "skirt")) return true;
      if (it.category !== categoryFilter) return false;
    }
    return true;
  });

  const pickImage = async (useCamera = false) => {
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    };
    const res = useCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);

    if (!res.canceled && res.assets[0]?.uri) {
      setNewImageUri(res.assets[0].uri);
    }
  };

  const handleQuickFillShopee = () => {
    try {
      const asset = Image.resolveAssetSource(require("../../assets/garments/shopee_sample.jpg"));
      if (asset?.uri) {
        setNewImageUri(asset.uri);
      }
      setNewName("Set Áo Nỉ Cún & Mũ Nơ");
      setNewCategory("top");
      setNewColor("trắng");
      setNewStatus("wishlist");
      setNewPrice("285.000₫");
      setNewShop("Shopee Mall · Tihi Official");
      setNewFitAdvice("Form oversize Ulzzang Hàn Quốc. VTON thử trọn bộ gồm áo nỉ cún, mũ nơ và túi chéo.");
      setNewTryOnMode("outfit");
    } catch (e) {
      console.warn("Could not load sample asset", e);
    }
  };

  const handleSaveNewItem = () => {
    if (!newImageUri || !newName.trim()) {
      Alert.alert(
        tr(locale, "Missing information", "Thiếu thông tin"),
        tr(locale, "Please select a photo and enter the item name.", "Vui lòng chọn ảnh và nhập tên bộ đồ.")
      );
      return;
    }
    const customPrompt =
      newTryOnMode === "outfit"
        ? `The complete outfit from the reference image, including all garments and accessories (such as cap and bag), worn by the person in the video.`
        : `A ${newColor.trim() || "stylish"} ${newName.trim()} worn on the upper body by the person in the video.`;

    addItem({
      name: newName.trim(),
      nameVi: newName.trim(),
      category: newCategory,
      color: newColor.trim() || "đen",
      styles: ["casual", "street"],
      formality: newCategory === "outerwear" ? 3 : 2,
      status: newStatus,
      price: newPrice.trim() || undefined,
      shop: newShop.trim() || undefined,
      image: { uri: newImageUri },
      fitAdvice:
        newFitAdvice.trim() ||
        tr(locale, "Check size before purchase.", "Kiểm tra kích thước chuẩn trước khi đặt mua."),
      matchingPantsIds: ["P01", "P02", "P03", "P05"],
      tryOnMode: newTryOnMode,
      customPrompt,
    });

    // Reset & close
    setNewImageUri(null);
    setNewName("");
    setNewPrice("");
    setNewShop("");
    setNewFitAdvice("");
    setNewTryOnMode("outfit");
    setAddSheetOpen(false);
  };

  const handleSaveAndHangB = () => {
    if (!newImageUri || !newName.trim()) {
      Alert.alert(
        tr(locale, "Missing information", "Thiếu thông tin"),
        tr(locale, "Please select a photo and enter the item name.", "Vui lòng chọn ảnh và nhập tên bộ đồ.")
      );
      return;
    }
    const customPrompt =
      newTryOnMode === "outfit"
        ? `The complete outfit from the reference image, including all garments and accessories (such as cap and bag), worn by the person in the video.`
        : `A ${newColor.trim() || "stylish"} ${newName.trim()} worn on the upper body by the person in the video.`;

    const created = addItem({
      name: newName.trim(),
      nameVi: newName.trim(),
      category: newCategory,
      color: newColor.trim() || "đen",
      styles: ["casual", "street"],
      formality: newCategory === "outerwear" ? 3 : 2,
      status: newStatus,
      price: newPrice.trim() || undefined,
      shop: newShop.trim() || undefined,
      image: { uri: newImageUri },
      fitAdvice:
        newFitAdvice.trim() ||
        tr(locale, "Check size before purchase.", "Kiểm tra kích thước chuẩn trước khi đặt mua."),
      matchingPantsIds: ["P01", "P02", "P03", "P05"],
      tryOnMode: newTryOnMode,
      customPrompt,
    });

    // Reset & close
    setNewImageUri(null);
    setNewName("");
    setNewPrice("");
    setNewShop("");
    setNewFitAdvice("");
    setNewTryOnMode("outfit");
    setAddSheetOpen(false);

    // Hang immediately on Look B and navigate to setup
    assignHook("b", created.id);
    setActiveLook("b");
    onClose();
    router.push("/setup");
  };

  const handleTryOnSingle = (item: ClosetItem) => {
    assignHook("a", item.id);
    assignHook("b", null);
    setActiveLook("a");
    setActiveItem(null);
    onClose();
    router.push("/setup");
  };

  const handleHangOnHook = (slot: Slot, item: ClosetItem) => {
    assignHook(slot, item.id);
    setActiveLook(slot);
    setActiveItem(null);
    onClose();
  };

  const matchingPants = activeItem ? getMatchingPants(activeItem.id) : [];

  const mainSheetContent = (
    <View
      style={[
        styles.sheet,
        IOS ? styles.sheetIos : styles.sheetFloating,
        { paddingBottom: insets.bottom + spacing.stack },
      ]}
      // While an item/add overlay is open, hand modal focus to it and hide the grid from screen readers.
      accessibilityViewIsModal={!activeItem && !addSheetOpen}
      accessibilityElementsHidden={!!activeItem || addSheetOpen}
      importantForAccessibility={activeItem || addSheetOpen ? "no-hide-descendants" : "auto"}
    >
      {!IOS ? <View style={styles.handle} /> : null}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <AppText variant="headline">
            {tr(locale, "My Closet", "Tủ đồ cá nhân")}
          </AppText>
          <AppText variant="caption" tone="muted">
            {filteredItems.length} {tr(locale, "pieces · Tap to hang or inspect", "bộ đồ · Chạm để thử hoặc xem phối")}
          </AppText>
        </View>
        <View style={styles.headerActions}>
          <Touchable
            onPress={() => setAddSheetOpen(true)}
            bg={colors.lime}
            pressedBg={colors.limePress}
            style={styles.addBtn}
            accessibilityLabel={tr(locale, "Add piece", "Thêm bộ đồ mới")}
          >
            <Plus size={16} color={colors.ink} strokeWidth={2.5} />
            <AppText variant="caption" weight={700}>
              {tr(locale, "Add", "Thêm")}
            </AppText>
          </Touchable>
          <IconButton icon={X} accessibilityLabel={tr(locale, "Close", "Đóng")} onPress={onClose} variant="quiet" />
        </View>
      </View>

      {/* Gender Switcher (Bộ sưu tập Nam & Nữ) */}
      <View style={styles.genderRow}>
        <Touchable
          onPress={() => setGenderFilter("all")}
          bg={genderFilter === "all" ? colors.ink : colors.surface}
          style={[styles.genderChip, genderFilter === "all" && styles.genderChipActive]}
        >
          <AppText variant="caption" weight={700} tone={genderFilter === "all" ? "paper" : "ink"}>
            {tr(locale, "All", "Tất cả")} ({items.length})
          </AppText>
        </Touchable>
        <Touchable
          onPress={() => setGenderFilter("women")}
          bg={genderFilter === "women" ? colors.ink : colors.surface}
          style={[styles.genderChip, genderFilter === "women" && styles.genderChipActive]}
        >
          <AppText variant="caption" weight={700} tone={genderFilter === "women" ? "paper" : "ink"}>
            {tr(locale, "Women", "Đồ Nữ")}
          </AppText>
        </Touchable>
        <Touchable
          onPress={() => setGenderFilter("men")}
          bg={genderFilter === "men" ? colors.ink : colors.surface}
          style={[styles.genderChip, genderFilter === "men" && styles.genderChipActive]}
        >
          <AppText variant="caption" weight={700} tone={genderFilter === "men" ? "paper" : "ink"}>
            {tr(locale, "Men", "Đồ Nam")}
          </AppText>
        </Touchable>
      </View>

      {/* Native Segmented Control */}
      <View style={styles.segmented}>
        <Touchable
          onPress={() => setStatusFilter("all")}
          bg={statusFilter === "all" ? colors.paper : "transparent"}
          style={[styles.segmentBtn, statusFilter === "all" && styles.segmentBtnActive]}
        >
          <AppText variant="caption" weight={statusFilter === "all" ? 800 : 500} tone={statusFilter === "all" ? "ink" : "muted"}>
            {tr(locale, "All status", "Tất cả")}
          </AppText>
        </Touchable>
        <Touchable
          onPress={() => setStatusFilter("owned")}
          bg={statusFilter === "owned" ? colors.paper : "transparent"}
          style={[styles.segmentBtn, statusFilter === "owned" && styles.segmentBtnActive]}
        >
          <AppText variant="caption" weight={statusFilter === "owned" ? 800 : 500} tone={statusFilter === "owned" ? "ink" : "muted"}>
            {tr(locale, "In Closet", "Đã có trong tủ")}
          </AppText>
        </Touchable>
        <Touchable
          onPress={() => setStatusFilter("wishlist")}
          bg={statusFilter === "wishlist" ? colors.paper : "transparent"}
          style={[styles.segmentBtn, statusFilter === "wishlist" && styles.segmentBtnActive]}
        >
          <AppText variant="caption" weight={statusFilter === "wishlist" ? 800 : 500} tone={statusFilter === "wishlist" ? "ink" : "muted"}>
            {tr(locale, "Wishlist", "Đang ngắm mua")}
          </AppText>
        </Touchable>
      </View>

      {/* Clean Category Chips with dedicated container */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryRow}
        >
          <Chip
            label={tr(locale, "All categories", "Tất cả loại")}
            selected={categoryFilter === "all"}
            onPress={() => setCategoryFilter("all")}
            style={styles.categoryChip}
          />
          <Chip
            label={tr(locale, "Dresses & Skirts", "Đầm & Váy")}
            selected={categoryFilter === "dress"}
            onPress={() => setCategoryFilter("dress")}
            style={styles.categoryChip}
          />
          <Chip
            label={tr(locale, "Outerwear", "Áo khoác")}
            selected={categoryFilter === "outerwear"}
            onPress={() => setCategoryFilter("outerwear")}
            style={styles.categoryChip}
          />
          <Chip
            label={tr(locale, "Tops & Shirts", "Áo kiểu & Thun")}
            selected={categoryFilter === "top"}
            onPress={() => setCategoryFilter("top")}
            style={styles.categoryChip}
          />
          <Chip
            label={tr(locale, "Knitwear", "Áo len")}
            selected={categoryFilter === "knitwear"}
            onPress={() => setCategoryFilter("knitwear")}
            style={styles.categoryChip}
          />
          <Chip
            label={tr(locale, "Pants", "Quần")}
            selected={categoryFilter === "pants"}
            onPress={() => setCategoryFilter("pants")}
            style={styles.categoryChip}
          />
          <Chip
            label={tr(locale, "Shoes, Bags & Accessories", "Giày, Mũ, Túi & Khác")}
            selected={categoryFilter === "other"}
            onPress={() => setCategoryFilter("other")}
            style={styles.categoryChip}
          />
        </ScrollView>
      </View>

      {/* Hero Photo Grid */}
      <ScrollView
        style={styles.gridScroll}
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.map((item) => {
          const isHookA = hookIds[0] === item.id;
          const isHookB = hookIds[1] === item.id;

          return (
            <Touchable
              key={item.id}
              style={styles.card}
              onPress={() => setActiveItem(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.nameVi || item.name}. Tap to hang or view advice.`}
            >
              <View style={styles.cardPhotoWrapper}>
                <GarmentImage garmentId={item.id} radius={radii.card} aspectRatio={4 / 5} showSampleTag={false} />

                {/* Status Badges */}
                <View style={styles.cardBadges}>
                  {item.tryOnMode === "outfit" ? (
                    <View style={styles.badgeOutfit}>
                      <AppText variant="caption" tone="ink" weight={800} style={{ fontSize: 10 }}>
                        Set đồ
                      </AppText>
                    </View>
                  ) : item.status === "wishlist" ? (
                    <View style={styles.badgeWishlist}>
                      <AppText variant="caption" tone="limeInk" weight={700}>
                        {tr(locale, "Wishlist", "Ngắm mua")}
                      </AppText>
                    </View>
                  ) : <View />}

                  {(isHookA || isHookB) && (
                    <View style={[styles.badgeHook, isHookA ? styles.badgeHookA : styles.badgeHookB]}>
                      <AppText variant="caption" tone={isHookA ? "ink" : "paper"} weight={800}>
                        {isHookA ? "LOOK A" : "LOOK B"}
                      </AppText>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.cardMeta}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {locale === "vi" ? item.nameVi || item.name : item.name}
                </AppText>
                {item.price ? (
                  <AppText variant="caption" tone="ink" weight={700} numberOfLines={1}>
                    {item.price} {item.shop ? `· ${item.shop}` : ""}
                  </AppText>
                ) : (
                  <AppText variant="caption" tone="muted" numberOfLines={1}>
                    {item.color} · {item.styles[0]}
                  </AppText>
                )}
              </View>
            </Touchable>
          );
        })}
      </ScrollView>

      {/* Floating Action Button when 2 pieces are hung */}
      {hasBothHooks && (
        <View style={[styles.floatingTryOnWrap, { bottom: insets.bottom + 12 }]}>
          <Touchable
            onPress={() => {
              onClose();
              router.push("/setup");
            }}
            bg={colors.lime}
            pressedBg={colors.limePress}
            style={styles.floatingTryOnBtn}
            accessibilityLabel={tr(locale, "Ready with 2 pieces, start fitting now", "Đã chọn đủ 2 bộ đồ, vào thử đồ ngay")}
          >
            <Camera size={18} color={colors.ink} strokeWidth={2.2} />
            <AppText variant="label" weight={800} tone="ink">
              {tr(locale, "Ready with 2 pieces · Start fitting", "Đã đủ 2 bộ đồ · Vào thử đồ ngay")}
            </AppText>
          </Touchable>
        </View>
      )}
    </View>
  );

  // Item and add-piece sheets render as overlays INSIDE the closet modal. iOS cannot
  // present a second <Modal> while the closet pageSheet is up: it silently drops it and
  // React Native keeps an invisible layer that swallows every touch until relaunch.
  const itemSheet = activeItem ? (
    <View style={[StyleSheet.absoluteFill, styles.actionSheetBackdrop]} accessibilityViewIsModal>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setActiveItem(null)}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: alpha.backdrop }]} />
      </Pressable>

      <View style={[styles.actionSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />

        {/* Product Header */}
        <View style={styles.actionHead}>
          <View style={styles.actionHeadThumb}>
            <GarmentImage garmentId={activeItem.id} width={76} radius={radii.md} aspectRatio={4 / 5} showSampleTag={false} />
          </View>
          <View style={styles.actionHeadMeta}>
            <AppText variant="title" numberOfLines={2}>
              {locale === "vi" ? activeItem.nameVi || activeItem.name : activeItem.name}
            </AppText>
            <AppText variant="caption" tone="muted">
              {activeItem.status === "owned"
                ? tr(locale, "In your closet", "Đã có trong tủ đồ")
                : tr(locale, "In your wishlist", "Đang trong danh sách ngắm mua")}
              {activeItem.price ? ` · ${activeItem.price}` : ""}
            </AppText>
            {activeItem.shop ? (
              <AppText variant="caption" tone="muted">
                {activeItem.shop}
              </AppText>
            ) : null}
            {activeItem.tryOnMode === "outfit" ? (
              <View style={styles.outfitPillBadge}>
                <Sparkles size={11} color={colors.ink} strokeWidth={2.2} />
                <AppText variant="tag" weight={700} tone="ink" style={{ fontSize: 11 }}>
                  {tr(locale, "Full Set Try-On (Hat + Bag)", "Thử trọn bộ set (Mũ + Túi)")}
                </AppText>
              </View>
            ) : null}
          </View>
          <IconButton icon={X} accessibilityLabel={tr(locale, "Close", "Đóng")} onPress={() => setActiveItem(null)} variant="quiet" />
        </View>

        {/* Primary Action: Direct 1-Tap Single Item Try-On (Wearable garments) */}
        {activeItem.category !== "other" ? (
          <Touchable
            onPress={() => handleTryOnSingle(activeItem)}
            bg={colors.lime}
            pressedBg={colors.limePress}
            style={styles.instantTryBtn}
            accessibilityRole="button"
            accessibilityLabel="Thử ngay bộ đồ này qua camera không cần so sánh"
          >
            <View style={styles.instantTryContent}>
              <View style={styles.instantTryIconCircle}>
                <Camera size={20} color={colors.ink} strokeWidth={2.4} />
              </View>
              <View style={styles.instantTryTextCol}>
                <AppText variant="label" weight={800} tone="ink">
                  {tr(locale, "Try on now via camera", "Thử ngay bộ đồ này qua camera")}
                </AppText>
                <AppText variant="caption" tone="ink">
                  {tr(locale, "Direct 1-item fitting · No comparison needed", "Thử 1 chạm trực tiếp · Không cần so sánh")}
                </AppText>
              </View>
            </View>
          </Touchable>
        ) : null}

        {/* Secondary Actions: Hang on Hook A / Hook B for comparison */}
        <View style={styles.hangActionsRow}>
          <Touchable
            onPress={() => handleHangOnHook("a", activeItem)}
            bg={activeItem.category === "other" ? colors.lime : colors.surface}
            pressedBg={activeItem.category === "other" ? colors.limePress : colors.surfaceDeep}
            style={styles.hangActionBtnA}
          >
            <AppText variant="label" weight={800} tone="ink">
              {tr(locale, "Hang on Look A", "Treo vào Look A")}
            </AppText>
            <AppText variant="caption" tone={activeItem.category === "other" ? "ink" : "muted"}>
              {hookIds[0] === activeItem.id ? tr(locale, "Currently on A", "Đang treo ở Móc A") : tr(locale, "Slot A", "Vị trí A")}
            </AppText>
          </Touchable>

          <Touchable
            onPress={() => handleHangOnHook("b", activeItem)}
            bg={activeItem.category === "other" ? colors.ink : colors.surface}
            pressedBg={activeItem.category === "other" ? colors.inkWell : colors.surfaceDeep}
            style={styles.hangActionBtnB}
          >
            <AppText variant="label" weight={800} tone={activeItem.category === "other" ? "paper" : "ink"}>
              {tr(locale, "Hang on Look B", "Treo vào Look B")}
            </AppText>
            <AppText variant="caption" tone={activeItem.category === "other" ? "mutedDark" : "muted"}>
              {hookIds[1] === activeItem.id ? tr(locale, "Currently on B", "Đang treo ở Móc B") : tr(locale, "Compare with Look A", "So sánh với Look A")}
            </AppText>
          </Touchable>
        </View>

        {/* Fit & Fabric Advice */}
        {activeItem.fitAdvice ? (
          <View style={styles.adviceBox}>
            <ShieldCheck size={16} color={colors.limeInk} strokeWidth={2.2} />
            <View style={styles.adviceText}>
              <AppText variant="caption" weight={700} tone="limeInk">
                {tr(locale, "Fit & Size Guidance:", "Lời khuyên form dáng & size:")}
              </AppText>
              <AppText variant="caption" tone="ink">
                {activeItem.fitAdvice}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* Matching Pants from Closet with Visible Garment Photos */}
        {matchingPants.length > 0 ? (
          <View style={styles.matchingBox}>
            <AppText variant="caption" weight={700} tone="ink">
              {tr(locale, "Pairs perfectly with pants in your closet:", "Phối hợp chuẩn với quần trong tủ:")}
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchingScroll}>
              {matchingPants.map((p) => (
                <View key={p.id} style={styles.matchingPill}>
                  <GarmentImage garmentId={p.id as GarmentId} width={38} aspectRatio={4 / 5} radius={6} showSampleTag={false} />
                  <View style={styles.matchingPillText}>
                    <AppText variant="caption" weight={700} numberOfLines={1}>
                      {locale === "vi" ? p.nameVi : p.name}
                    </AppText>
                    <AppText variant="caption" tone="muted" numberOfLines={1}>
                      {p.status === "owned" ? tr(locale, "In closet", "Đã có sẵn") : "Wishlist"}
                    </AppText>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Footer Switch Status or Delete */}
        <View style={styles.actionSheetFooter}>
          <Touchable
            onPress={() => {
              const next = activeItem.status === "wishlist" ? "owned" : "wishlist";
              updateItem(activeItem.id, { status: next });
              setActiveItem({ ...activeItem, status: next });
            }}
            bg={colors.surface}
            pressedBg={colors.surfaceDeep}
            style={styles.switchStatusBtn}
          >
            <Tag size={14} color={colors.ink} />
            <AppText variant="caption" weight={600}>
              {activeItem.status === "wishlist"
                ? tr(locale, "Mark as Owned (In closet)", "Chuyển sang: Đã có trong tủ")
                : tr(locale, "Mark as Wishlist", "Chuyển sang: Đang ngắm mua")}
            </AppText>
          </Touchable>

          {activeItem.id.startsWith("custom_") ? (
            <Touchable
              onPress={() => {
                Alert.alert(
                  tr(locale, "Delete item", "Xoá bộ đồ"),
                  tr(locale, "Are you sure you want to remove this item?", "Bạn có chắc muốn xoá bộ đồ này?"),
                  [
                    { text: tr(locale, "Cancel", "Huỷ"), style: "cancel" },
                    {
                      text: tr(locale, "Delete", "Xoá"),
                      style: "destructive",
                      onPress: () => {
                        if (hookIds[0] === activeItem.id) assignHook("a", null);
                        if (hookIds[1] === activeItem.id) assignHook("b", null);
                        deleteItem(activeItem.id);
                        setActiveItem(null);
                      },
                    },
                  ]
                );
              }}
              bg={colors.dangerSoft}
              style={styles.deleteActionBtn}
            >
              <Trash2 size={16} color={colors.danger} />
            </Touchable>
          ) : null}
        </View>
      </View>
    </View>
  ) : null;

  const addSheet = addSheetOpen ? (
    <View style={[StyleSheet.absoluteFill, styles.actionSheetBackdrop]} accessibilityViewIsModal>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setAddSheetOpen(false)}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: alpha.backdrop }]} />
      </Pressable>

      <View style={[styles.addSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />

        <View style={styles.addSheetHead}>
          <AppText variant="title">
            {tr(locale, "Add New Piece", "Thêm bộ đồ mới")}
          </AppText>
          <IconButton icon={X} accessibilityLabel={tr(locale, "Close", "Đóng")} onPress={() => setAddSheetOpen(false)} variant="quiet" />
        </View>

        <ScrollView style={styles.addScroll} showsVerticalScrollIndicator={false}>
          {/* Quick Fill Shopee / TikTok Shop Demo */}
          <Touchable
            onPress={handleQuickFillShopee}
            bg={colors.surface}
            pressedBg={colors.surfaceDeep}
            style={styles.quickFillBanner}
            accessibilityRole="button"
            accessibilityLabel="Quick fill Shopee sample screenshot"
          >
            <View style={styles.quickFillLeft}>
              <Sparkles size={18} color={colors.ink} strokeWidth={2.2} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="caption" weight={800} tone="ink">
                  {tr(
                    locale,
                    "Quick demo: Shopee Ulzzang Sweatshirt + Cap",
                    "Thử nhanh ảnh Shopee mẫu (Áo nỉ + Mũ nơ + Túi)"
                  )}
                </AppText>
                <AppText variant="tag" tone="muted">
                  {tr(
                    locale,
                    "Auto-fills screenshot · 285.000₫ · Ready to try",
                    "Tự điền ảnh chụp sàn TMĐT · 285.000₫ · Thử camera ngay"
                  )}
                </AppText>
              </View>
            </View>
          </Touchable>

          {/* Photo Selection Buttons */}
          {newImageUri ? (
            <View style={styles.newPhotoPreview}>
              <Image source={{ uri: newImageUri }} style={styles.previewImage} />
              <Touchable onPress={() => setNewImageUri(null)} bg={colors.surfaceDeep} style={styles.changePhotoBtn}>
                <AppText variant="caption" weight={700}>
                  {tr(locale, "Change photo", "Chọn lại ảnh")}
                </AppText>
              </Touchable>
            </View>
          ) : (
            <View style={styles.photoPickRow}>
              <Touchable onPress={() => void pickImage(true)} bg={colors.surface} style={styles.photoPickBtn}>
                <Camera size={24} color={colors.ink} strokeWidth={2} />
                <AppText variant="label" weight={700}>
                  {tr(locale, "Take Photo", "Chụp ảnh")}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {tr(locale, "Use phone camera", "Camera trực tiếp")}
                </AppText>
              </Touchable>

              <Touchable onPress={() => void pickImage(false)} bg={colors.surface} style={styles.photoPickBtn}>
                <ImageIcon size={24} color={colors.ink} strokeWidth={2} />
                <AppText variant="label" weight={700}>
                  {tr(locale, "Photo Library", "Thư viện ảnh")}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {tr(locale, "Screenshot or shop", "Ảnh tải hoặc chụp shop")}
                </AppText>
              </Touchable>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.fieldGroup}>
            <AppText variant="label">{tr(locale, "Item Name", "Tên bộ đồ")}</AppText>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder={tr(locale, "e.g. Linen Navy Shirt", "Ví dụ: Áo Sơ Mi Linen Navy")}
              placeholderTextColor={colors.muted}
              style={styles.nativeInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <AppText variant="label">{tr(locale, "Category", "Danh mục")}</AppText>
            <View style={styles.categorySelectRow}>
              {(["outerwear", "top", "knitwear", "pants"] as const).map((cat) => (
                <Chip
                  key={cat}
                  label={
                    cat === "outerwear"
                      ? tr(locale, "Outerwear", "Áo khoác")
                      : cat === "top"
                      ? tr(locale, "Top", "Sơ mi / Áo")
                      : cat === "knitwear"
                      ? tr(locale, "Knitwear", "Áo len")
                      : tr(locale, "Pants", "Quần")
                  }
                  selected={newCategory === cat}
                  onPress={() => setNewCategory(cat)}
                  style={styles.formChip}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <AppText variant="label">{tr(locale, "Status", "Trạng thái")}</AppText>
              <View style={styles.statusChipRow}>
                <Chip
                  label={tr(locale, "Wishlist", "Đang ngắm")}
                  selected={newStatus === "wishlist"}
                  onPress={() => setNewStatus("wishlist")}
                  style={styles.formChip}
                />
                <Chip
                  label={tr(locale, "In Closet", "Đã có")}
                  selected={newStatus === "owned"}
                  onPress={() => setNewStatus("owned")}
                  style={styles.formChip}
                />
              </View>
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <AppText variant="label">{tr(locale, "Price", "Giá tiền")}</AppText>
              <TextInput
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="e.g. 850.000đ"
                placeholderTextColor={colors.muted}
                style={styles.nativeInput}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <AppText variant="label">{tr(locale, "Shop / Brand", "Tên Shop hoặc Hãng")}</AppText>
            <TextInput
              value={newShop}
              onChangeText={setNewShop}
              placeholder="e.g. Routine, Zara, Uniqlo"
              placeholderTextColor={colors.muted}
              style={styles.nativeInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <AppText variant="label">{tr(locale, "Fit / Size Guidance", "Lời khuyên form dáng & size")}</AppText>
            <TextInput
              value={newFitAdvice}
              onChangeText={setNewFitAdvice}
              placeholder={tr(locale, "e.g. Regular fit. Go 1 size up if broad shoulders.", "Ví dụ: Dáng regular. Nên tăng 1 size nếu vai rộng.")}
              placeholderTextColor={colors.muted}
              style={styles.nativeInput}
            />
          </View>

          {/* Try-On Mode (Decart Lucy VTON Engine) */}
          <View style={styles.fieldGroup}>
            <AppText variant="label">
              {tr(locale, "AI Try-On Mode", "Chế độ Thử AI (Decart VTON)")}
            </AppText>
            <View style={styles.tryOnModeRow}>
              <Touchable
                onPress={() => setNewTryOnMode("outfit")}
                bg={newTryOnMode === "outfit" ? colors.ink : colors.surface}
                style={[styles.tryOnModeChip, newTryOnMode === "outfit" && styles.tryOnModeChipActive]}
              >
                <AppText
                  variant="caption"
                  weight={700}
                  tone={newTryOnMode === "outfit" ? "paper" : "ink"}
                >
                  {tr(locale, "Full Set (Hat + Bag + Shirt)", "Thử trọn bộ (Áo + Mũ + Túi)")}
                </AppText>
              </Touchable>
              <Touchable
                onPress={() => setNewTryOnMode("single")}
                bg={newTryOnMode === "single" ? colors.ink : colors.surface}
                style={[styles.tryOnModeChip, newTryOnMode === "single" && styles.tryOnModeChipActive]}
              >
                <AppText
                  variant="caption"
                  weight={700}
                  tone={newTryOnMode === "single" ? "paper" : "ink"}
                >
                  {tr(locale, "Garment only", "Chỉ thử riêng áo/đầm")}
                </AppText>
              </Touchable>
            </View>
            <AppText variant="tag" tone="muted" style={{ marginTop: 4 }}>
              {newTryOnMode === "outfit"
                ? tr(
                    locale,
                    "AI keeps the full Ulzzang aesthetic: wearing the cap, shoulder bag and graphic sweatshirt.",
                    "AI giữ nguyên phong cách Ulzzang từ ảnh shop: đội mũ, đeo túi chéo và mặc áo nỉ lên người bạn."
                  )
                : tr(
                    locale,
                    "AI transfers only the primary garment.",
                    "AI chỉ trích xuất và ướm phần áo/đầm lên người bạn."
                  )}
            </AppText>
          </View>

          {/* Primary & Secondary Action Buttons */}
          <View style={styles.addActionsRow}>
            <Touchable
              onPress={handleSaveAndHangB}
              bg={colors.lime}
              pressedBg={colors.limePress}
              style={styles.hangLookBBtn}
              accessibilityRole="button"
              accessibilityLabel="Save and try on Look B"
            >
              <Sparkles size={18} color={colors.ink} strokeWidth={2.5} />
              <View style={{ alignItems: "center" }}>
                <AppText variant="label" weight={800} tone="ink">
                  {tr(locale, "Hang on Look B & Try Now", "Treo vào Look B & Thử ngay")}
                </AppText>
                <AppText variant="tag" tone="ink" style={{ fontSize: 11 }}>
                  {tr(locale, "Saves to Wishlist & opens live camera", "Lưu vào Ngắm mua và mở camera thử trực tiếp")}
                </AppText>
              </View>
            </Touchable>

            <Touchable
              onPress={handleSaveNewItem}
              bg={colors.surface}
              pressedBg={colors.surfaceDeep}
              style={styles.saveOnlyBtn}
              accessibilityRole="button"
              accessibilityLabel="Save to closet only"
            >
              <Check size={16} color={colors.ink} strokeWidth={2.2} />
              <AppText variant="label" weight={700} tone="ink">
                {tr(locale, "Save to Closet only", "Lưu vào Tủ đồ")}
              </AppText>
            </Touchable>
          </View>
        </ScrollView>
      </View>
    </View>
  ) : null;

  const overlays = (
    <>
      {itemSheet}
      {addSheet}
    </>
  );

  const handleRequestClose = () => {
    if (activeItem) setActiveItem(null);
    else if (addSheetOpen) setAddSheetOpen(false);
    else onClose();
  };

  return (
    <>
      {/* Main Closet Sheet */}
      {IOS ? (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleRequestClose}>
          <View style={styles.iosSheetRoot}>
            {mainSheetContent}
            {overlays}
          </View>
        </Modal>
      ) : (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent navigationBarTranslucent onRequestClose={handleRequestClose}>
          <View style={styles.backdropWrap}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close closet">
              <View style={[StyleSheet.absoluteFill, { backgroundColor: alpha.backdrop }]} />
            </Pressable>
            {mainSheetContent}
            {overlays}
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backdropWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  iosSheetRoot: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.gutter,
  },
  sheetIos: {
    flex: 1,
    paddingTop: spacing.gutter,
  },
  sheetFloating: {
    maxHeight: "92%",
    borderTopLeftRadius: radii.dock,
    borderTopRightRadius: radii.dock,
    paddingTop: 10,
    width: "100%",
    maxWidth: sizes.maxContentWidth + spacing.gutter * 2,
    alignSelf: "center",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.line,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerTitles: {
    flex: 1,
    gap: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radii.full,
    gap: 4,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  genderChip: {
    flex: 1,
    height: 36,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  genderChipActive: {
    borderColor: colors.ink,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    ...shadows.lift,
  },
  categoryContainer: {
    height: 44,
    marginBottom: 14,
  },
  floatingTryOnWrap: {
    position: "absolute",
    left: spacing.gutter,
    right: spacing.gutter,
    alignItems: "center",
    zIndex: 99,
  },
  floatingTryOnBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    width: "100%",
    maxWidth: 380,
    borderRadius: radii.full,
    ...shadows.dock,
  },
  categoryScroll: {
    flexGrow: 0,
    height: 44,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: spacing.gutter,
  },
  categoryChip: {
    height: 40,
    minHeight: 40,
  },
  formChip: {
    height: 38,
    minHeight: 38,
  },
  gridScroll: {
    flexGrow: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: colors.paper,
    borderRadius: radii.card,
    overflow: "hidden",
  },
  cardPhotoWrapper: {
    position: "relative",
    borderRadius: radii.card,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  cardBadges: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  badgeWishlist: {
    backgroundColor: colors.lime,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  badgeOutfit: {
    backgroundColor: colors.lime,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  outfitPillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.lime,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    marginTop: 4,
  },
  badgeHook: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  badgeHookA: {
    backgroundColor: colors.lime,
  },
  badgeHookB: {
    backgroundColor: colors.ink,
  },
  cardMeta: {
    paddingTop: 8,
    paddingBottom: 4,
    gap: 2,
  },
  actionSheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  actionSheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.dock,
    borderTopRightRadius: radii.dock,
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: 14,
    ...shadows.dock,
  },
  actionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionHeadThumb: {
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  actionHeadMeta: {
    flex: 1,
    gap: 4,
  },
  instantTryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.limePress,
  },
  instantTryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  instantTryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  instantTryTextCol: {
    flex: 1,
    gap: 2,
  },
  hangActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  hangActionBtnA: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  hangActionBtnB: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  adviceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.limeSoft,
    padding: 12,
    borderRadius: radii.md,
  },
  adviceText: {
    flex: 1,
    gap: 2,
  },
  matchingBox: {
    gap: 8,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radii.md,
  },
  matchingScroll: {
    flexDirection: "row",
    gap: 8,
  },
  matchingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.paper,
    padding: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  matchingPillText: {
    maxWidth: 120,
    justifyContent: "center",
  },
  actionSheetFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  switchStatusBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.full,
  },
  deleteActionBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  addSheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.dock,
    borderTopRightRadius: radii.dock,
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    maxHeight: "90%",
    ...shadows.dock,
  },
  addSheetHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  addScroll: {
    gap: 14,
  },
  photoPickRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  photoPickBtn: {
    flex: 1,
    aspectRatio: 1.15,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: radii.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
  },
  newPhotoPreview: {
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  previewImage: {
    width: 140,
    height: 175,
    borderRadius: radii.lg,
  },
  changePhotoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  fieldGroup: {
    gap: 6,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  nativeInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontFamily: "Inter",
    color: colors.ink,
  },
  categorySelectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChipRow: {
    flexDirection: "row",
    gap: 6,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: radii.lg,
    gap: 8,
    marginTop: 10,
    marginBottom: 30,
  },
  quickFillBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radii.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  quickFillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  tryOnModeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  tryOnModeChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  tryOnModeChipActive: {
    borderColor: colors.ink,
  },
  addActionsRow: {
    gap: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  hangLookBBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radii.lg,
    gap: 8,
  },
  saveOnlyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: radii.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
