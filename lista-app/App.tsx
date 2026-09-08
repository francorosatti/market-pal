import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AddModal } from "./src/components/AddModal";
import {
  addToList,
  bumpFreq,
  removeFromList,
  toggleBought,
  upsertItem,
} from "./src/data/catalogLogic";
import { Category, Product } from "./src/data/types";
import { useCatalog } from "./src/hooks/useCatalog";
import { useTrips } from "./src/hooks/useTrips";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ListScreen } from "./src/screens/ListScreen";
import { SwipeScreen } from "./src/screens/SwipeScreen";
import { AWNING_DARK, PAPER } from "./src/theme/colors";

const NEW_CATEGORY = "__new__";

type ViewName = "home" | "swipe" | "list" | "historyDetail";

export default function App() {
  const [view, setView] = useState<ViewName>("home");
  const [showAdd, setShowAdd] = useState(false);
  const [viewingTripId, setViewingTripId] = useState<string | null>(null);

  const { categories, setCategories, loaded: catalogLoaded } = useCatalog();
  const {
    activeTrip,
    historyTrips,
    list,
    setList,
    indices,
    setIndices,
    currentCategoryId,
    setCurrentCategoryId,
    loaded: tripLoaded,
    startNewList,
    finishActiveList,
    reactivateTrip,
  } = useTrips(categories, catalogLoaded);

  const handleAccept = (item: Product, categoryId: string) => {
    setCategories((prev) => bumpFreq(prev, categoryId, item.id));
    setList((prev) => addToList(prev, item, categoryId));
  };

  const handleManualAdd = ({
    name,
    categoryId,
    newCategoryName,
  }: {
    name: string;
    categoryId: string;
    newCategoryName: string;
  }) => {
    if (!name.trim()) return;

    let cats = categories;
    let targetId = categoryId;
    if (categoryId === NEW_CATEGORY && newCategoryName.trim()) {
      const id = `c-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      const newCategory: Category = {
        id,
        name: newCategoryName.trim(),
        emoji: "🛒",
        color: "#6B6558",
        items: [],
      };
      cats = [...cats, newCategory];
      targetId = id;
    }

    const { categories: updated, item } = upsertItem(cats, targetId, name);
    setCategories(updated);
    if (item) {
      setList((prev) => addToList(prev, item, targetId));
    }
    setCurrentCategoryId(targetId);
    setShowAdd(false);
  };

  const handleRemove = (id: string, categoryId: string) => {
    const { categories: newCats, list: newList } = removeFromList(categories, list, id, categoryId);
    setCategories(newCats);
    setList(newList);
  };

  const handleClear = () => {
    if (list.length === 0) return;
    Alert.alert("Vaciar lista", "¿Vaciar la lista actual?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Vaciar",
        style: "destructive",
        onPress: () => {
          setList([]);
          setIndices({});
        },
      },
    ]);
  };

  if (!catalogLoaded || !tripLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PAPER} />
      </View>
    );
  }

  const viewingTrip = viewingTripId ? historyTrips.find((t) => t.id === viewingTripId) ?? null : null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {view === "home" && (
        <HomeScreen
          activeTrip={activeTrip}
          historyTrips={historyTrips}
          onStartNew={() => {
            startNewList();
            setView("swipe");
          }}
          onContinue={() => setView("swipe")}
          onFinish={finishActiveList}
          onOpenHistory={(id) => {
            setViewingTripId(id);
            setView("historyDetail");
          }}
        />
      )}

      {view === "swipe" && (
        <SwipeScreen
          categories={categories}
          currentCategoryId={currentCategoryId}
          setCurrentCategoryId={setCurrentCategoryId}
          indices={indices}
          setIndices={setIndices}
          onAccept={handleAccept}
          listCount={list.length}
          onOpenList={() => setView("list")}
          onOpenHome={() => setView("home")}
          onAdd={() => setShowAdd(true)}
        />
      )}

      {view === "list" && (
        <ListScreen
          list={list}
          categories={categories}
          onBack={() => setView("swipe")}
          onToggleBought={(id, categoryId) => setList((prev) => toggleBought(prev, id, categoryId))}
          onRemove={handleRemove}
          onClear={handleClear}
        />
      )}

      {view === "historyDetail" && viewingTrip && (
        <ListScreen
          list={viewingTrip.list}
          categories={categories}
          onBack={() => setView("home")}
          onToggleBought={() => {}}
          onRemove={() => {}}
          onClear={() => {}}
          readOnly
          onReactivate={() => {
            reactivateTrip(viewingTrip.id);
            setView("swipe");
          }}
        />
      )}

      {showAdd && (
        <AddModal
          categories={categories}
          defaultCategoryId={currentCategoryId}
          onClose={() => setShowAdd(false)}
          onSubmit={handleManualAdd}
        />
      )}

      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AWNING_DARK,
  },
});
