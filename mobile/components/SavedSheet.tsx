// Saved looks bottom sheet (user decision 2026-11-09: saved list = bottom sheet).
// iOS: native page sheet (swipe down to dismiss). Android / web: bottom sheet over a
// backdrop; tap the backdrop, the close button or system Back to dismiss.
// Lists looks kept on Final Look (AsyncStorage via lib/store). Honest source labels.
import { Bookmark, Trash2, X } from "lucide-react-native";
import { FlatList, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { IconButton } from "@/components/ui/IconButton";
import { getGarment } from "@/lib/catalog";
import { useSizing } from "@/lib/sizing";
import { tr, useLocale } from "@/lib/locale";
import { OCCASION_OPTIONS, SOURCE_LABEL } from "@/lib/occasions";
import { reasonWithoutName } from "@/lib/reasonText";
import { useAppStore, type SavedLook } from "@/lib/store";
import { alpha, colors, radii, sizes, spacing } from "@/lib/theme";

export interface SavedSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Called after a look is removed (e.g. to show a toast). */
  onRemoved?: (look: SavedLook) => void;
}

const IOS = Platform.OS === "ios";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function SavedSheet({ visible, onClose, onRemoved }: SavedSheetProps) {
  const insets = useSafeAreaInsets();
  const { saved, savedLoaded, removeSaved } = useAppStore();

  const body = (
    <View style={[styles.sheet, IOS ? styles.sheetIos : styles.sheetFloating, { paddingBottom: insets.bottom + spacing.stack }]} accessibilityViewIsModal>
      {!IOS ? <View style={styles.handle} /> : null}
      <View style={styles.header}>
        <AppText variant="headline" helper="Đã lưu trên máy này" containerStyle={styles.flex}>
          Saved looks
        </AppText>
        <IconButton icon={X} accessibilityLabel="Close saved looks" onPress={onClose} variant="quiet" />
      </View>

      {savedLoaded && saved.length === 0 ? (
        <View style={styles.empty}>
          <Bookmark size={22} color={colors.muted} strokeWidth={1.75} />
          <AppText variant="bodyStrong" align="center" helper="Chưa có look nào. Giữ một look ở bước cuối để lưu." helperVariant="bodySm">
            Nothing saved yet. Keep a look on the last step to save it.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(l) => l.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <SavedRow
              look={item}
              onRemove={() => {
                removeSaved(item.id);
                onRemoved?.(item);
              }}
            />
          )}
        />
      )}
    </View>
  );

  if (IOS) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        {body}
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdropWrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close saved looks">
          <View style={[StyleSheet.absoluteFill, { backgroundColor: alpha.backdrop }]} />
        </Pressable>
        {body}
      </View>
    </Modal>
  );
}

function SavedRow({ look, onRemove }: { look: SavedLook; onRemove: () => void }) {
  const locale = useLocale();
  const garment = getGarment(look.garmentId);
  const isCloset = look.occasionId === "closet" || !look.occasionId;
  const occasion = isCloset ? null : OCCASION_OPTIONS.find((o) => o.id === look.occasionId);
  const source = SOURCE_LABEL[look.source] ?? SOURCE_LABEL.closet;
  const date = formatDate(look.savedAt);
  const reason = reasonWithoutName(look.reason, garment.name);
  const occasionName = occasion ? tr(locale, occasion.label, occasion.labelVi) : tr(locale, "Personal Closet", "Tự chọn từ tủ đồ");
  const samplePrefix = garment.sample ? tr(locale, "Sample photo · ", "Ảnh mẫu · ") : "";
  const { sizes } = useSizing();
  const size = sizes[look.garmentId];

  return (
    <View style={styles.row}>
      <View
        accessible
        accessibilityLabel={`${garment.name}${garment.sample ? ", sample photo" : ""}, ${occasionName}, saved ${date}, ${source.label}. ${reason} Pair with ${look.pairWith}.`}
        style={styles.rowMain}
      >
        {/* The tag does not fit on a 56 pt thumbnail, so "Sample" moves to the meta line. */}
        <GarmentImage garmentId={look.garmentId} width={56} radius={radii.sm} showSampleTag={false} />
        <View style={styles.rowText}>
          <AppText variant="bodyStrong" numberOfLines={2}>
            {garment.name}
          </AppText>
          <AppText variant="bodySm" tone="muted" numberOfLines={2}>
            {samplePrefix}
            {occasionName}
            {date ? ` · ${date}` : ""}
            {size ? ` · Size ${size}` : ""}
          </AppText>
          {reason ? (
            <AppText variant="caption" numberOfLines={2}>
              {reason}
            </AppText>
          ) : null}
          {look.pairWith ? (
            <AppText variant="caption" tone="muted" numberOfLines={1}>
              {`${tr(locale, "Pair with:", "Phối cùng:")} ${look.pairWith}`}
            </AppText>
          ) : null}
          <AppText variant="caption" tone={look.source === "llm" ? "limeInk" : "muted"} helper={source.labelVi} helperInline helperVariant="caption">
            {source.label}
          </AppText>
        </View>
      </View>
      <IconButton icon={Trash2} accessibilityLabel={`Remove ${garment.name}`} onPress={onRemove} variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdropWrap: { flex: 1, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.paper, paddingHorizontal: spacing.gutter },
  sheetIos: { flex: 1, paddingTop: spacing.gutter },
  sheetFloating: {
    maxHeight: "85%",
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    paddingTop: 8,
    width: "100%",
    maxWidth: sizes.maxContentWidth + spacing.gutter * 2,
    alignSelf: "center",
  },
  handle: { alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: 12 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: spacing.stack },
  list: { flexGrow: 0 },
  listContent: { borderWidth: 1, borderColor: colors.line, borderRadius: radii.xxl, overflow: "hidden" },
  separator: { height: 1, backgroundColor: colors.line, marginLeft: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingLeft: 16, paddingRight: 4, paddingVertical: 12, gap: 8 },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { flex: 1, gap: 2 },
  empty: {
    borderWidth: sizes.dashedBorder,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: radii.xxl,
    padding: 24,
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.stack,
  },
});
