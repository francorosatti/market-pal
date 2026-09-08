import { Check } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { sortedItems, SortMode } from "../data/catalogLogic";
import { Category, ListItem, Product } from "../data/types";
import { INK, MUTED, PAPER_DARK, SAGE } from "../theme/colors";

type Props = {
  category: Category;
  list: ListItem[];
  onToggle: (item: Product, categoryId: string, checked: boolean) => void;
  sortMode: SortMode;
};

export function CategoryProductList({ category, list, onToggle, sortMode }: Props) {
  const items = sortedItems(category, sortMode);
  const isInList = (item: Product) =>
    list.some((li) => li.id === item.id && li.categoryId === category.id);

  return (
    <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
      {items.length === 0 && (
        <Text style={styles.emptyState}>Todavía no hay productos en esta categoría.</Text>
      )}
      {items.map((item) => {
        const checked = isInList(item);
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.row}
            onPress={() => onToggle(item, category.id, !checked)}
            accessibilityLabel={`${checked ? "Quitar" : "Agregar"} ${item.name}`}
          >
            <View
              style={[
                styles.checkbox,
                { backgroundColor: checked ? SAGE : "transparent", borderColor: checked ? SAGE : MUTED },
              ]}
            >
              {checked && <Check size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.itemName}>{item.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  emptyState: { color: MUTED, fontSize: 14, textAlign: "center", marginTop: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
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
  itemName: { flex: 1, marginLeft: 12, fontSize: 15, color: INK },
});
