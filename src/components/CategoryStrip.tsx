import { useEffect, useRef } from "react";
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Category } from "../data/types";
import { INK, PAPER, PAPER_DARK } from "../theme/colors";

type Props = {
  categories: Category[];
  currentCategoryId: string;
  onSelect: (categoryId: string) => void;
  indices: Record<string, number>;
};

export function CategoryStrip({ categories, currentCategoryId, onSelect, indices }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const stripWidthRef = useRef(0);
  const chipLayoutsRef = useRef<Record<string, { x: number; width: number }>>({});

  useEffect(() => {
    const layout = chipLayoutsRef.current[currentCategoryId];
    const stripWidth = stripWidthRef.current;
    if (!layout || !stripWidth) return;
    const targetX = layout.x - stripWidth / 2 + layout.width / 2;
    scrollViewRef.current?.scrollTo({ x: Math.max(targetX, 0), animated: true });
  }, [currentCategoryId]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.strip}
      contentContainerStyle={styles.stripContent}
      onLayout={(e: LayoutChangeEvent) => {
        stripWidthRef.current = e.nativeEvent.layout.width;
      }}
    >
      {categories.map((c) => {
        const left = Math.max(c.items.length - (indices[c.id] || 0), 0);
        const active = c.id === currentCategoryId;
        return (
          <TouchableOpacity
            key={c.id}
            onPress={() => onSelect(c.id)}
            onLayout={(e: LayoutChangeEvent) => {
              chipLayoutsRef.current[c.id] = {
                x: e.nativeEvent.layout.x,
                width: e.nativeEvent.layout.width,
              };
            }}
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
    flex: 1,
    maxHeight: 56,
    backgroundColor: PAPER,
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
