// ClosetSheet (Khu Tủ Đồ Cá Nhân & Quản Lý Món Đồ)
// Cho phép xem, lọc (Wishlist vs Đã có, Danh mục), thêm món mới từ camera/thư viện,
// chỉnh sửa, xoá và treo ngay lên Look A hoặc Look B của Fitting Dock.

import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Check,
  CheckCircle,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  Layers,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Button, Chip, ChipGroup, Touchable } from "@/components/ui";
import { GarmentImage } from "@/components/ui/GarmentImage";
import {
  ClosetCategory,
  ClosetItem,
  OwnershipStatus,
  useCloset,
} from "@/lib/closet";
import { useAppStore, type Slot } from "@/lib/store";
import { alpha, colors, radii, shadows, spacing } from "@/lib/theme";

export interface ClosetSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Optional slot to hang directly on */
  defaultSlot?: Slot;
}

export function ClosetSheet({ visible, onClose, defaultSlot = "a" }: ClosetSheetProps) {
  const insets = useSafeAreaInsets();
  const { items, addItem, updateItem, deleteItem, getMatchingPants } = useCloset();
  const { assignHook, hookIds, setActiveLook } = useAppStore();

  const [statusFilter, setStatusFilter] = useState<OwnershipStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<ClosetCategory>("all");
  const [detailItem, setDetailItem] = useState<ClosetItem | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New item form state
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<"outerwear" | "top" | "knitwear" | "pants">("outerwear");
  const [newColor, setNewColor] = useState("đen");
  const [newStatus, setNewStatus] = useState<"wishlist" | "owned">("wishlist");
  const [newPrice, setNewPrice] = useState("");
  const [newShop, setNewShop] = useState("");
  const [newFitAdvice, setNewFitAdvice] = useState("");

  const filteredItems = items.filter((it) => {
    if (statusFilter !== "all" && it.status !== statusFilter) return false;
    if (categoryFilter !== "all" && it.category !== categoryFilter) return false;
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

  const handleSaveNewItem = () => {
    if (!newImageUri || !newName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ảnh và nhập tên món đồ.");
      return;
    }
    addItem({
      name: newName.trim(),
      nameVi: newName.trim(),
      category: newCategory,
      color: newColor.trim() || "đen",
      styles: ["casual"],
      formality: newCategory === "outerwear" ? 3 : 2,
      status: newStatus,
      price: newPrice.trim() || undefined,
      shop: newShop.trim() || undefined,
      image: { uri: newImageUri },
      fitAdvice: newFitAdvice.trim() || "Kiểm tra kích thước chuẩn trước khi đặt mua.",
      matchingPantsIds: ["P02", "P03", "P05", "P08"],
    });

    // Reset & close
    setNewImageUri(null);
    setNewName("");
    setNewPrice("");
    setNewShop("");
    setNewFitAdvice("");
    setAddModalOpen(false);
  };

  const handleHangOnHook = (slot: Slot, item: ClosetItem) => {
    assignHook(slot, item.id);
    setActiveLook(slot);
    Alert.alert(
      "Đã treo đồ!",
      `Đã treo ${item.nameVi || item.name} vào Móc ${slot.toUpperCase()}. Bạn có thể vào phòng thử đồ bất cứ lúc nào!`,
      [{ text: "OK" }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AppText variant="title">Tủ đồ cá nhân · My Closet</AppText>
            <AppText variant="caption" tone="muted">
              {filteredItems.length} món đồ · Treo lên móc để thử camera
            </AppText>
          </View>
          <View style={styles.headerRight}>
            <Touchable
              onPress={() => setAddModalOpen(true)}
              style={styles.addBtn}
              accessibilityLabel="Thêm món mới"
            >
              <Plus size={18} color={colors.ink} strokeWidth={2.5} />
              <AppText variant="label" weight={700}>Thêm</AppText>
            </Touchable>
            <Touchable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Đóng">
              <X size={20} color={colors.ink} />
            </Touchable>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          {/* Tầng 1: Trạng thái sở hữu */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Chip
              label="Tất cả nguồn"
              selected={statusFilter === "all"}
              onPress={() => setStatusFilter("all")}
            />
            <Chip
              label="🏷️ Đang ngắm mua (Wishlist)"
              selected={statusFilter === "wishlist"}
              onPress={() => setStatusFilter("wishlist")}
            />
            <Chip
              label="👕 Đã có trong tủ (In Closet)"
              selected={statusFilter === "owned"}
              onPress={() => setStatusFilter("owned")}
            />
          </ScrollView>

          {/* Tầng 2: Danh mục */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Chip
              label="Tất cả loại"
              selected={categoryFilter === "all"}
              onPress={() => setCategoryFilter("all")}
            />
            <Chip
              label="Áo khoác"
              selected={categoryFilter === "outerwear"}
              onPress={() => setCategoryFilter("outerwear")}
            />
            <Chip
              label="Sơ mi & Polo"
              selected={categoryFilter === "top"}
              onPress={() => setCategoryFilter("top")}
            />
            <Chip
              label="Len & Hoodie"
              selected={categoryFilter === "knitwear"}
              onPress={() => setCategoryFilter("knitwear")}
            />
            <Chip
              label="Quần (10 mẫu)"
              selected={categoryFilter === "pants"}
              onPress={() => setCategoryFilter("pants")}
            />
          </ScrollView>
        </View>

        {/* Closet Grid */}
        <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 40 }]}>
          {filteredItems.map((item) => {
            const isHookA = hookIds[0] === item.id;
            const isHookB = hookIds[1] === item.id;

            return (
              <View key={item.id} style={styles.card}>
                <Touchable onPress={() => setDetailItem(item)}>
                  <View style={styles.cardImageWrapper}>
                    <GarmentImage garmentId={item.id} radius={radii.lg} aspectRatio={1} />
                    {/* Badge */}
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, item.status === "wishlist" ? styles.badgeWishlist : styles.badgeOwned]}>
                        <AppText variant="caption" tone={item.status === "wishlist" ? "limeInk" : "paper"} weight={700}>
                          {item.status === "wishlist" ? "Ngắm mua" : "Đã có"}
                        </AppText>
                      </View>
                      {(isHookA || isHookB) && (
                        <View style={styles.hookIndicator}>
                          <AppText variant="caption" tone="paper" weight={800}>
                            {isHookA ? "Móc A" : "Móc B"}
                          </AppText>
                        </View>
                      )}
                    </View>
                  </View>
                </Touchable>

                <View style={styles.cardBody}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {item.nameVi || item.name}
                  </AppText>
                  {item.price ? (
                    <AppText variant="caption" tone="ink" weight={700}>
                      {item.price} {item.shop ? `· ${item.shop}` : ""}
                    </AppText>
                  ) : (
                    <AppText variant="caption" tone="muted">
                      {item.styles.join(" · ")}
                    </AppText>
                  )}

                  {/* Actions: Treo Móc A / B */}
                  <View style={styles.cardActions}>
                    <Touchable
                      onPress={() => handleHangOnHook("a", item)}
                      style={[styles.hangBtn, isHookA && styles.hangBtnActive]}
                    >
                      <AppText variant="caption" weight={700} tone={isHookA ? "paper" : "ink"}>
                        {isHookA ? "✓ Móc A" : "Treo A"}
                      </AppText>
                    </Touchable>
                    <Touchable
                      onPress={() => handleHangOnHook("b", item)}
                      style={[styles.hangBtn, isHookB && styles.hangBtnActive]}
                    >
                      <AppText variant="caption" weight={700} tone={isHookB ? "paper" : "ink"}>
                        {isHookB ? "✓ Móc B" : "Treo B"}
                      </AppText>
                    </Touchable>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Detail Modal */}
        {detailItem && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setDetailItem(null)}>
            <View style={styles.detailOverlay}>
              <View style={styles.detailCard}>
                <View style={styles.detailHead}>
                  <View style={styles.flex}>
                    <AppText variant="title">{detailItem.nameVi || detailItem.name}</AppText>
                    <AppText variant="caption" tone="muted">
                      {detailItem.category.toUpperCase()} · Formality: {detailItem.formality}/5
                    </AppText>
                  </View>
                  <Touchable onPress={() => setDetailItem(null)} style={styles.closeBtn}>
                    <X size={20} color={colors.ink} />
                  </Touchable>
                </View>

                <ScrollView style={styles.detailScroll}>
                  <GarmentImage garmentId={detailItem.id} aspectRatio={4 / 3} radius={radii.xl} />

                  {/* Fit Advice / Pre-buy Note */}
                  <View style={styles.fitBox}>
                    <View style={styles.fitHead}>
                      <Sparkles size={16} color={colors.limeInk} />
                      <AppText variant="bodyStrong" tone="limeInk">
                        Lưu ý kiểm chứng trước khi mua:
                      </AppText>
                    </View>
                    <AppText variant="bodySm" tone="ink">
                      {detailItem.fitAdvice || "Kiểm tra kỹ bảng size vai và chiều dài lưng áo."}
                    </AppText>
                  </View>

                  {/* Matching Pants from Closet */}
                  {detailItem.category !== "pants" && (
                    <View style={styles.matchingSection}>
                      <AppText variant="section">Quần phối ăn ý trong tủ đồ:</AppText>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pantsScroll}>
                        {getMatchingPants(detailItem.id).map((p) => (
                          <View key={p.id} style={styles.pantsThumb}>
                            <GarmentImage garmentId={p.id} radius={radii.md} width={80} aspectRatio={1} />
                            <AppText variant="caption" numberOfLines={1} align="center">
                              {p.nameVi}
                            </AppText>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Ownership Switch */}
                  <View style={styles.statusToggle}>
                    <AppText variant="bodyStrong">Trạng thái món đồ:</AppText>
                    <View style={styles.toggleRow}>
                      <Touchable
                        onPress={() => {
                          updateItem(detailItem.id, { status: "wishlist" });
                          setDetailItem({ ...detailItem, status: "wishlist" });
                        }}
                        style={[styles.toggleBtn, detailItem.status === "wishlist" && styles.toggleBtnActive]}
                      >
                        <AppText variant="caption" weight={700}>🏷️ Đang ngắm mua</AppText>
                      </Touchable>
                      <Touchable
                        onPress={() => {
                          updateItem(detailItem.id, { status: "owned" });
                          setDetailItem({ ...detailItem, status: "owned" });
                        }}
                        style={[styles.toggleBtn, detailItem.status === "owned" && styles.toggleBtnActive]}
                      >
                        <AppText variant="caption" weight={700}>👕 Đã có trong tủ</AppText>
                      </Touchable>
                    </View>
                  </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View style={styles.detailFooter}>
                  <Button
                    label="Treo Look A"
                    variant="next"
                    onPress={() => {
                      handleHangOnHook("a", detailItem);
                      setDetailItem(null);
                    }}
                    style={styles.flex}
                  />
                  <Button
                    label="Treo Look B"
                    variant="ink"
                    onPress={() => {
                      handleHangOnHook("b", detailItem);
                      setDetailItem(null);
                    }}
                    style={styles.flex}
                  />
                  {detailItem.isCustom && (
                    <Touchable
                      onPress={() => {
                        deleteItem(detailItem.id);
                        setDetailItem(null);
                      }}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={20} color={colors.danger} />
                    </Touchable>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Add Piece Modal */}
        <Modal visible={addModalOpen} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setAddModalOpen(false)}>
          <View style={[styles.root, { padding: spacing.gutter }]}>
            <View style={styles.detailHead}>
              <AppText variant="title">Thêm món đồ vào tủ</AppText>
              <Touchable onPress={() => setAddModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color={colors.ink} />
              </Touchable>
            </View>

            <ScrollView contentContainerStyle={styles.addScroll}>
              {/* Photo selector */}
              {newImageUri ? (
                <View style={styles.newImagePreview}>
                  <Image source={{ uri: newImageUri }} style={styles.previewImg} />
                  <Touchable onPress={() => pickImage(false)} style={styles.repickBtn}>
                    <AppText variant="caption" weight={700}>Đổi ảnh khác</AppText>
                  </Touchable>
                </View>
              ) : (
                <View style={styles.imagePickerRow}>
                  <Touchable onPress={() => pickImage(false)} style={styles.pickerBox}>
                    <ImageIcon size={28} color={colors.ink} />
                    <AppText variant="bodySm" weight={700}>Chọn từ thư viện</AppText>
                    <AppText variant="caption" tone="muted">Ảnh chụp Shopee, Zara...</AppText>
                  </Touchable>
                  <Touchable onPress={() => pickImage(true)} style={styles.pickerBox}>
                    <Camera size={28} color={colors.ink} />
                    <AppText variant="bodySm" weight={700}>Chụp ảnh mới</AppText>
                    <AppText variant="caption" tone="muted">Chụp đồ thật bạn có</AppText>
                  </Touchable>
                </View>
              )}

              {/* Form inputs */}
              <View style={styles.inputGroup}>
                <AppText variant="label" weight={700}>Tên món đồ *</AppText>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Ví dụ: Áo Blazer Navy Caro, Quần Jean Ống Suông"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText variant="label" weight={700}>Phân loại *</AppText>
                <View style={styles.categoryRow}>
                  {[
                    { id: "outerwear", label: "Áo khoác" },
                    { id: "top", label: "Áo sơ mi/thun" },
                    { id: "knitwear", label: "Áo len/hoodie" },
                    { id: "pants", label: "Quần" },
                  ].map((c) => (
                    <Chip
                      key={c.id}
                      label={c.label}
                      selected={newCategory === c.id}
                      onPress={() => setNewCategory(c.id as any)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <AppText variant="label" weight={700}>Trạng thái</AppText>
                <View style={styles.categoryRow}>
                  <Chip
                    label="🏷️ Đang ngắm mua (Wishlist)"
                    selected={newStatus === "wishlist"}
                    onPress={() => setNewStatus("wishlist")}
                  />
                  <Chip
                    label="👕 Đã có trong tủ (Owned)"
                    selected={newStatus === "owned"}
                    onPress={() => setNewStatus("owned")}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <AppText variant="label" weight={700}>Giá tiền (tùy chọn)</AppText>
                <TextInput
                  value={newPrice}
                  onChangeText={setNewPrice}
                  placeholder="Ví dụ: 850.000₫"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText variant="label" weight={700}>Tên shop / Thương hiệu (tùy chọn)</AppText>
                <TextInput
                  value={newShop}
                  onChangeText={setNewShop}
                  placeholder="Ví dụ: Zara, Uniqlo, Shopee Mall"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText variant="label" weight={700}>Ghi chú size / phom dáng</AppText>
                <TextInput
                  value={newFitAdvice}
                  onChangeText={setNewFitAdvice}
                  placeholder="Ví dụ: Áo phom rộng, nên lùi 1 size..."
                  style={styles.input}
                />
              </View>

              <Button
                label="Lưu vào Tủ Đồ"
                variant="next"
                onPress={handleSaveNewItem}
                style={styles.saveBtn}
              />
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.gutter,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lime,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    gap: 4,
  },
  closeBtn: {
    padding: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceDeep,
  },
  filtersSection: {
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  filterRow: {
    paddingHorizontal: spacing.gutter,
    gap: 8,
  },
  grid: {
    padding: spacing.gutter,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  card: {
    width: "48%",
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.lift,
  },
  cardImageWrapper: {
    position: "relative",
  },
  badgeRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeWishlist: {
    backgroundColor: colors.lime,
  },
  badgeOwned: {
    backgroundColor: colors.ink,
  },
  hookIndicator: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  cardBody: {
    padding: 10,
    gap: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  hangBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    borderRadius: radii.md,
  },
  hangBtnActive: {
    backgroundColor: colors.ink,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: alpha.backdrop,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  detailCard: {
    backgroundColor: colors.paper,
    borderRadius: radii.xxl,
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    padding: spacing.gutter,
    gap: 12,
    ...shadows.dock,
  },
  detailHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailScroll: {
    flexGrow: 0,
  },
  fitBox: {
    backgroundColor: "#F4FBE8",
    borderColor: colors.lime,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 12,
    marginVertical: 12,
    gap: 6,
  },
  fitHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  matchingSection: {
    marginVertical: 8,
    gap: 8,
  },
  pantsScroll: {
    flexDirection: "row",
    gap: 10,
  },
  pantsThumb: {
    width: 85,
    marginRight: 10,
    alignItems: "center",
    gap: 4,
  },
  statusToggle: {
    marginVertical: 12,
    gap: 8,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceDeep,
  },
  toggleBtnActive: {
    backgroundColor: colors.lime,
  },
  detailFooter: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: {
    flex: 1,
  },
  addScroll: {
    gap: 14,
    paddingBottom: 40,
  },
  imagePickerRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 8,
  },
  pickerBox: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 4,
  },
  newImagePreview: {
    alignItems: "center",
    marginVertical: 8,
    gap: 8,
  },
  previewImg: {
    width: 140,
    height: 175,
    borderRadius: radii.lg,
  },
  repickBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceDeep,
  },
  inputGroup: {
    gap: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  saveBtn: {
    marginTop: 12,
  },
});
