import {
  ArrowDownAZ,
  ChevronRight,
  Flame,
  Home,
  List,
  Plus,
  RotateCcw,
  ShoppingCart,
  SquareStack,
} from "lucide-react-native";
import { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomBar } from "../components/BottomBar";
import { CategoryProductList } from "../components/CategoryProductList";
import { CategoryStrip } from "../components/CategoryStrip";
import { SwipeCard, SwipeCardHandle } from "../components/SwipeCard";
import { sortedItems } from "../data/catalogLogic";
import { ListSortMode, ViewMode } from "../data/storage";
import { Category, ListItem, Product } from "../data/types";
import { AWNING, MUSTARD, MUTED, PAPER, PAPER_DARK } from "../theme/colors";

type Props = {
  categories: Category[];
  list: ListItem[];
  currentCategoryId: string;
  setCurrentCategoryId: (id: string) => void;
  indices: Record<string, number>;
  setIndices: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  onAccept: (item: Product, categoryId: string) => void;
  onRemove: (id: string, categoryId: string) => void;
  listCount: number;
  onOpenList: () => void;
  onOpenHome: () => void;
  onAdd: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  listSortMode: ListSortMode;
  onToggleListSortMode: () => void;
};

export function SwipeScreen({
  categories,
  list,
  currentCategoryId,
  setCurrentCategoryId,
  indices,
  setIndices,
  onAccept,
  onRemove,
  listCount,
  onOpenList,
  onOpenHome,
  onAdd,
  viewMode,
  onToggleViewMode,
  listSortMode,
  onToggleListSortMode,
}: Props) {
  const cardRef = useRef<SwipeCardHandle>(null);
  const insets = useSafeAreaInsets();

  const currentCategory = categories.find((c) => c.id === currentCategoryId) ?? categories[0];
  const items = sortedItems(currentCategory);
  const isInList = (item: Product) =>
    list.some((li) => li.id === item.id && li.categoryId === currentCategoryId);

  // Los productos ya agregados a la lista (por swipe o manualmente) no deben
  // volver a mostrarse para swipear, aunque el índice guardado los alcance.
  let currentIndex = indices[currentCategoryId] || 0;
  while (currentIndex < items.length && isInList(items[currentIndex])) currentIndex++;
  let nextIndex = currentIndex + 1;
  while (nextIndex < items.length && isInList(items[nextIndex])) nextIndex++;

  const currentItem = items[currentIndex];
  const nextItem = items[nextIndex];
  const remaining = items.slice(currentIndex).filter((it) => !isInList(it)).length;

  const advance = () => {
    setIndices((prev) => ({ ...prev, [currentCategoryId]: currentIndex + 1 }));
  };

  const handleSwipeRight = () => {
    if (!currentItem) return;
    onAccept(currentItem, currentCategoryId);
    advance();
  };

  const handleSwipeLeft = () => {
    if (!currentItem) return;
    advance();
  };

  const handleToggleItem = (item: Product, categoryId: string, checked: boolean) => {
    if (checked) {
      onAccept(item, categoryId);
    } else {
      onRemove(item.id, categoryId);
    }
  };

  const resetCategory = () => {
    setIndices((prev) => ({ ...prev, [currentCategoryId]: 0 }));
  };

  const jumpToNextCategory = () => {
    const idx = categories.findIndex((c) => c.id === currentCategoryId);
    const nextIdx = (idx + 1) % categories.length;
    setCurrentCategoryId(categories[nextIdx].id);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: 18 + insets.top }]}>
        <View>
          <Text style={styles.logo}>LA LISTA</Text>
          <Text style={styles.tagline}>
            {viewMode === "swipe" ? "deslizá para armar tu compra" : "tildá para armar tu compra"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.cartBtn} onPress={onOpenHome} accessibilityLabel="Ir al inicio">
            <Home size={20} color={PAPER} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartBtn} onPress={onOpenList} accessibilityLabel="Ver lista">
            <ShoppingCart size={20} color={PAPER} />
            {listCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{listCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stripRow}>
        <TouchableOpacity
          style={styles.viewModeBtn}
          onPress={onToggleViewMode}
          accessibilityLabel={viewMode === "swipe" ? "Ver como lista" : "Ver como swipe"}
        >
          {viewMode === "swipe" ? (
            <List size={18} color={AWNING} />
          ) : (
            <SquareStack size={18} color={AWNING} />
          )}
        </TouchableOpacity>
        {viewMode === "list" && (
          <TouchableOpacity
            style={styles.viewModeBtn}
            onPress={onToggleListSortMode}
            accessibilityLabel={
              listSortMode === "freq" ? "Ordenar alfabéticamente" : "Ordenar por frecuencia"
            }
          >
            {listSortMode === "freq" ? (
              <Flame size={18} color={AWNING} />
            ) : (
              <ArrowDownAZ size={18} color={AWNING} />
            )}
          </TouchableOpacity>
        )}
        <CategoryStrip
          categories={categories}
          currentCategoryId={currentCategoryId}
          onSelect={setCurrentCategoryId}
          indices={indices}
        />
      </View>

      {viewMode === "swipe" ? (
        <>
          <View style={styles.stage}>
            {currentItem ? (
              <>
                {nextItem && (
                  <View style={[styles.backCard, { borderColor: currentCategory.color }]}>
                    <Text style={styles.backCardEmoji}>{currentCategory.emoji}</Text>
                  </View>
                )}
                <SwipeCard
                  key={currentItem.id}
                  ref={cardRef}
                  category={currentCategory}
                  item={currentItem}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
              </>
            ) : (
              <View style={[styles.doneCard, { borderColor: currentCategory.color }]}>
                <Text style={styles.doneEmoji}>{currentCategory.emoji}</Text>
                <Text style={styles.doneTitle}>¡Terminaste {currentCategory.name}!</Text>
                <Text style={styles.doneSub}>Repasá de nuevo o pasá a la próxima categoría.</Text>
                <View style={styles.doneActions}>
                  <TouchableOpacity style={styles.ghostBtn} onPress={resetCategory}>
                    <RotateCcw size={16} color={AWNING} />
                    <Text style={styles.ghostBtnText}>Repasar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={jumpToNextCategory}>
                    <Text style={styles.primaryBtnText}>Siguiente</Text>
                    <ChevronRight size={16} color={PAPER} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <Text style={styles.counter}>
            {currentItem ? `${remaining} producto${remaining === 1 ? "" : "s"} en esta categoría` : ""}
          </Text>

          {currentItem && categories.length > 1 && (
            <TouchableOpacity style={styles.skipBtn} onPress={jumpToNextCategory}>
              <Text style={styles.skipBtnText}>Saltar categoría</Text>
              <ChevronRight size={14} color={MUTED} />
            </TouchableOpacity>
          )}

          <BottomBar
            disabled={!currentItem}
            onSwipeLeft={() => cardRef.current?.triggerSwipe("left")}
            onSwipeRight={() => cardRef.current?.triggerSwipe("right")}
            onAdd={onAdd}
          />
        </>
      ) : (
        <>
          <CategoryProductList
            category={currentCategory}
            list={list}
            onToggle={handleToggleItem}
            sortMode={listSortMode}
          />

          {categories.length > 1 && (
            <TouchableOpacity style={styles.skipBtn} onPress={jumpToNextCategory}>
              <Text style={styles.skipBtnText}>Saltar categoría</Text>
              <ChevronRight size={14} color={MUTED} />
            </TouchableOpacity>
          )}

          <View style={[styles.listFooter, { paddingBottom: 20 + insets.bottom }]}>
            <TouchableOpacity style={styles.listAddBtn} onPress={onAdd}>
              <Plus size={18} color={PAPER} />
              <Text style={styles.listAddBtnText}>Agregar producto</Text>
            </TouchableOpacity>
          </View>
        </>
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
  logo: { fontSize: 22, letterSpacing: 1.5, color: PAPER, fontWeight: "800" },
  tagline: { fontSize: 12, color: "#C9CDBE", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 10 },
  stripRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: PAPER,
    borderBottomWidth: 1,
    borderBottomColor: PAPER_DARK,
  },
  viewModeBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: PAPER_DARK,
  },
  cartBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: MUSTARD,
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { fontSize: 11, fontWeight: "700", color: AWNING },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  backCard: {
    position: "absolute",
    width: "100%",
    maxWidth: 320,
    height: 380,
    backgroundColor: "#FAF8F0",
    borderWidth: 3,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
    transform: [{ scale: 0.94 }, { translateY: 10 }],
  },
  backCardEmoji: { fontSize: 60, opacity: 0.5 },
  doneCard: {
    width: "100%",
    maxWidth: 320,
    height: 380,
    backgroundColor: "#FAF8F0",
    borderWidth: 3,
    borderStyle: "dashed",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  doneEmoji: { fontSize: 34, opacity: 0.35, position: "absolute", top: 18 },
  doneTitle: { fontSize: 22, fontWeight: "700", marginTop: 46, textAlign: "center" },
  doneSub: { fontSize: 13, color: MUTED, marginTop: 8, maxWidth: 220, textAlign: "center" },
  doneActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ghostBtnText: { fontSize: 14, fontWeight: "600", color: AWNING },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AWNING,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  primaryBtnText: { fontSize: 14, fontWeight: "600", color: PAPER },
  counter: { textAlign: "center", fontSize: 12, color: MUTED, paddingVertical: 10 },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingBottom: 6,
  },
  skipBtnText: { fontSize: 13, fontWeight: "600", color: MUTED },
  listFooter: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 4 },
  listAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AWNING,
    borderRadius: 10,
    paddingVertical: 14,
  },
  listAddBtnText: { fontSize: 14, fontWeight: "600", color: PAPER },
});
