import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Category } from "../data/types";
import { INK, PAPER, PAPER_DARK } from "../theme/colors";

type Props = {
  categories: Category[];
  currentCategoryId: string;
  onSelect: (categoryId: string) => void;
  indices: Record<string, number>;
};

export function CategoryStrip({ categories, currentCategoryId, onSelect, indices }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.strip}
      contentContainerStyle={styles.stripContent}
    >
      {categories.map((c) => {
        const left = Math.max(c.items.length - (indices[c.id] || 0), 0);
        const active = c.id === currentCategoryId;
        return (
          <TouchableOpacity
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={[styles.chip, { backgroundColor: active ? c.color : PAPER_DARK }]}
          >
            <Text style={[styles.chipText, { color: active ? PAPER : INK }]}>
              {c.emoji} {c.name}
            </Text>
            {left > 0 && (
              <View style={styles.badge}>
                <Text style={[styles.badgeText, { color: active ? PAPER : INK }]}>{left}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexGrow: 0,
    maxHeight: 56,
    backgroundColor: PAPER,
    borderBottomWidth: 1,
    borderBottomColor: PAPER_DARK,
  },
  stripContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  badge: { marginLeft: 6 },
  badgeText: { fontSize: 11, opacity: 0.75, fontWeight: "700" },
});
