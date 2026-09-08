import { Check, Home, Pencil, Trash2 } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Category, ListItem } from "../data/types";
import { AWNING, BRICK, INK, MUTED, PAPER, PAPER_DARK, SAGE } from "../theme/colors";

type Props = {
  list: ListItem[];
  categories: Category[];
  onOpenHome: () => void;
  onOpenEdit?: () => void;
  onToggleBought: (id: string, categoryId: string) => void;
  onRemove: (id: string, categoryId: string) => void;
  onClear: () => void;
  onFinish?: () => void;
  readOnly?: boolean;
  onReactivate?: () => void;
};

export function ListScreen({
  list,
  categories,
  onOpenHome,
  onOpenEdit,
  onToggleBought,
  onRemove,
  onClear,
  onFinish,
  readOnly,
  onReactivate,
}: Props) {
  const insets = useSafeAreaInsets();
  const byCategory = categories
    .map((cat) => ({ cat, items: list.filter((i) => i.categoryId === cat.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: 18 + insets.top }]}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.logo}>{readOnly ? "HISTORIAL" : "TU LISTA"}</Text>
          <Text style={styles.tagline}>
            {list.length} producto{list.length === 1 ? "" : "s"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconGhost} onPress={onOpenHome} accessibilityLabel="Ir al inicio">
            <Home size={20} color={PAPER} />
          </TouchableOpacity>
          {!readOnly && onOpenEdit && (
            <TouchableOpacity style={styles.iconGhost} onPress={onOpenEdit} accessibilityLabel="Editar lista">
              <Pencil size={20} color={PAPER} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        {byCategory.length === 0 && (
          <Text style={styles.emptyState}>
            Todavía no agregaste nada. Volvé y deslizá a la derecha lo que necesites.
          </Text>
        )}
        {byCategory.map(({ cat, items }) => (
          <View key={cat.id} style={{ marginBottom: 18 }}>
            <View style={styles.groupHeader}>
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={styles.groupHeaderText}>{cat.name}</Text>
            </View>
            {items.map((it) => (
              <View key={it.id} style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: it.bought ? SAGE : "transparent",
                      borderColor: it.bought ? SAGE : MUTED,
                    },
                  ]}
                  onPress={() => !readOnly && onToggleBought(it.id, it.categoryId)}
                  disabled={readOnly}
                >
                  {it.bought && <Check size={14} color={PAPER} />}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.itemName,
                    it.bought && { textDecorationLine: "line-through", color: MUTED },
                  ]}
                >
                  {it.name}
                </Text>
                {!readOnly && (
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => onRemove(it.id, it.categoryId)}
                    accessibilityLabel={`Borrar ${it.name}`}
                  >
                    <Trash2 size={16} color={MUTED} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {readOnly ? (
        onReactivate && (
          <View style={[styles.footer, { paddingBottom: 20 + insets.bottom }]}>
            <TouchableOpacity style={styles.reactivateBtn} onPress={onReactivate}>
              <Text style={styles.reactivateBtnText}>Reactivar lista</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        list.length > 0 && (
          <View style={[styles.footer, styles.footerRow, { paddingBottom: 20 + insets.bottom }]}>
            <TouchableOpacity style={[styles.dangerBtn, { flex: 1 }]} onPress={onClear}>
              <Text style={styles.dangerBtnText}>Vaciar lista</Text>
            </TouchableOpacity>
            {onFinish && (
              <TouchableOpacity style={[styles.reactivateBtn, { flex: 1 }]} onPress={onFinish}>
                <Text style={styles.reactivateBtnText}>Terminar lista</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PAPER },
  header: {
    backgroundColor: AWNING,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: { flexDirection: "row", gap: 10 },
  iconGhost: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { fontSize: 22, letterSpacing: 1.5, color: PAPER, fontWeight: "800" },
  tagline: { fontSize: 12, color: "#C9CDBE", marginTop: 2 },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  emptyState: { color: MUTED, fontSize: 14, textAlign: "center", marginTop: 40 },
  groupHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  groupHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dot: { width: 8, height: 8, borderRadius: 999, marginRight: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: PAPER_DARK,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: { flex: 1, marginLeft: 10, fontSize: 14, color: INK },
  trashBtn: { padding: 6 },
  footer: { paddingHorizontal: 20 },
  footerRow: { flexDirection: "row", gap: 10 },
  dangerBtn: {
    borderWidth: 1.5,
    borderColor: BRICK,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerBtnText: { color: BRICK, fontSize: 14, fontWeight: "600" },
  reactivateBtn: {
    backgroundColor: AWNING,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  reactivateBtnText: { color: PAPER, fontSize: 14, fontWeight: "600" },
});
