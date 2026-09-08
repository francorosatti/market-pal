import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AddModal } from "./src/components/AddModal";
import {
  addExistingItem,
  addToList,
  bumpFreq,
  createItem,
  removeFromList,
  toggleBought,
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
  const [openTripId, setOpenTripId] = useState<string | null>(null);

  const { categories, setCategories, loaded: catalogLoaded } = useCatalog();
  const {
    activeTrips,
    historyTrips,
    setList,
    setIndices,
    setCurrentCategoryId,
    loaded: tripLoaded,
    startNewList,
    finishTrip,
    reactivateTrip,
    deleteTrip,
  } = useTrips(categories, catalogLoaded);

  const openTrip = openTripId ? activeTrips.find((t) => t.id === openTripId) ?? null : null;
  const list = openTrip?.list ?? [];
  const indices = openTrip?.indices ?? {};
  const currentCategoryId = openTrip?.currentCategoryId ?? "";

  const handleAccept = (item: Product, categoryId: string) => {
    setCategories((prev) => bumpFreq(prev, categoryId, item.id));
    setList(openTripId!, (prev) => addToList(prev, item, categoryId));
  };

  const handleSelectExisting = ({
    itemId,
    categoryId,
  }: {
    itemId: string;
    categoryId: string;
  }) => {
    setCategories((prev) => addExistingItem(prev, categoryId, itemId));
    setList(openTripId!, (prev) => {
      const cat = categories.find((c) => c.id === categoryId);
      const item = cat?.items.find((it) => it.id === itemId);
      return item ? addToList(prev, item, categoryId) : prev;
    });
    setCurrentCategoryId(openTripId!, categoryId);
    setShowAdd(false);
  };

  const handleCreateNew = ({
    name,
    categoryId,
    newCategoryName,
    addToList: shouldAddToList,
  }: {
    name: string;
    categoryId: string;
    newCategoryName: string;
    addToList: boolean;
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

    const { categories: updated, item } = createItem(cats, targetId, name);
    setCategories(updated);
    if (item && shouldAddToList) {
      setList(openTripId!, (prev) => addToList(prev, item, targetId));
    }
    setCurrentCategoryId(openTripId!, targetId);
    setShowAdd(false);
  };

  const handleRemove = (id: string, categoryId: string) => {
    const { categories: newCats, list: newList } = removeFromList(categories, list, id, categoryId);
    setCategories(newCats);
    setList(openTripId!, newList);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert("Eliminar lista", "¿Eliminar esta lista? Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteTrip(tripId),
      },
    ]);
  };

  const handleClear = () => {
    if (list.length === 0) return;
    Alert.alert("Vaciar lista", "¿Vaciar la lista actual?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Vaciar",
        style: "destructive",
        onPress: () => {
          setList(openTripId!, []);
          setIndices(openTripId!, {});
        },
      },
    ]);
  };

  useEffect(() => {
    if (view === "list" && !openTrip && historyTrips.length > 0) {
      setViewingTripId(historyTrips[0].id);
      setView("historyDetail");
    }
  }, [view, openTrip, historyTrips]);

  if (!catalogLoaded || !tripLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PAPER} />
      </View>
    );
  }

  const viewingTrip = viewingTripId ? historyTrips.find((t) => t.id === viewingTripId) ?? null : null;

  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      {view === "home" && (
        <HomeScreen
          activeTrips={activeTrips}
          historyTrips={historyTrips}
          onStartNew={() => {
            const id = startNewList();
            setOpenTripId(id);
            setView("swipe");
          }}
          onBuy={(tripId) => {
            setOpenTripId(tripId);
            setView("list");
          }}
          onEdit={(tripId) => {
            setOpenTripId(tripId);
            setView("swipe");
          }}
          onDelete={handleDeleteTrip}
          onOpenHistory={(id) => {
            setViewingTripId(id);
            setView("historyDetail");
          }}
        />
      )}

      {view === "swipe" && (
        <SwipeScreen
          categories={categories}
          list={list}
          currentCategoryId={currentCategoryId}
          setCurrentCategoryId={(id) => setCurrentCategoryId(openTripId!, id)}
          indices={indices}
          setIndices={(updater) => setIndices(openTripId!, updater)}
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
          onToggleBought={(id, categoryId) =>
            setList(openTripId!, (prev) => toggleBought(prev, id, categoryId))
          }
          onRemove={handleRemove}
          onClear={handleClear}
          onFinish={() => {
            finishTrip(openTripId!);
            setOpenTripId(null);
            setView("home");
          }}
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
            setView("home");
          }}
        />
      )}

      {showAdd && (
        <AddModal
          categories={categories}
          defaultCategoryId={currentCategoryId}
          onClose={() => setShowAdd(false)}
          onSelectExisting={handleSelectExisting}
          onCreateNew={handleCreateNew}
        />
      )}

      <StatusBar style="light" />
    </GestureHandlerRootView>
    </SafeAreaProvider>
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
