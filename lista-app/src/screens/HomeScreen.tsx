import { ChevronRight, Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trip } from "../data/types";
import { AWNING, BRICK, INK, MUTED, PAPER, PAPER_DARK } from "../theme/colors";

type Props = {
  activeTrips: Trip[];
  historyTrips: Trip[];
  onStartNew: () => void;
  onBuy: (tripId: string) => void;
  onEdit: (tripId: string) => void;
  onDelete: (tripId: string) => void;
  onOpenHistory: (tripId: string) => void;
};

function formatDate(ts: number) {
  const d = new Date(ts);
  const day = d.getDate();
  const month = d.toLocaleDateString("es-AR", { month: "long" });
  return `${day} de ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
}

export function HomeScreen({
  activeTrips,
  historyTrips,
  onStartNew,
  onBuy,
  onEdit,
  onDelete,
  onOpenHistory,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: 18 + insets.top }]}>
        <View>
          <Text style={styles.logo}>LA LISTA</Text>
          <Text style={styles.tagline}>tus compras, a mano</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
        <Text style={styles.sectionTitle}>Listas en curso</Text>
        {activeTrips.length === 0 ? (
          <Text style={styles.emptyState}>No tenés listas en curso.</Text>
        ) : (
          activeTrips.map((trip) => {
            const boughtCount = trip.list.filter((i) => i.bought).length;
            return (
              <View key={trip.id} style={styles.activeCard}>
                <Text style={styles.activeDate}>Creada el {formatDate(trip.createdAt)}</Text>
                <Text style={styles.activeCount}>
                  {boughtCount}/{trip.list.length} producto{trip.list.length === 1 ? "" : "s"}
                  {" "}comprados
                </Text>
                <View style={styles.activeActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(trip.id)}>
                    <Trash2 size={18} color={BRICK} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(trip.id)}>
                    <Pencil size={18} color={AWNING} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => onBuy(trip.id)}>
                    <ShoppingCart size={18} color={PAPER} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.newListBtn} onPress={onStartNew}>
          <Plus size={18} color={PAPER} />
          <Text style={styles.newListBtnText}>Nueva lista</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Historial</Text>
        {historyTrips.length === 0 ? (
          <Text style={styles.emptyState}>Todavía no completaste ninguna lista.</Text>
        ) : (
          historyTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.historyRow}
              onPress={() => onOpenHistory(trip.id)}
            >
              <View>
                <Text style={styles.historyDate}>
                  {trip.completedAt ? formatDate(trip.completedAt) : ""}
                </Text>
                <Text style={styles.historyCount}>
                  {trip.list.length} producto{trip.list.length === 1 ? "" : "s"}
                </Text>
              </View>
              <ChevronRight size={18} color={MUTED} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  logo: { fontSize: 26, letterSpacing: 1.5, color: PAPER, fontWeight: "800" },
  tagline: { fontSize: 12, color: "#C9CDBE", marginTop: 2 },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emptyState: { color: MUTED, fontSize: 14, textAlign: "center", marginVertical: 16 },
  activeCard: {
    backgroundColor: "#FAF8F0",
    borderWidth: 2,
    borderColor: PAPER_DARK,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  activeDate: { fontSize: 13, color: MUTED },
  activeCount: { fontSize: 18, fontWeight: "700", color: INK, marginTop: 4 },
  activeActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  iconBtn: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
    borderRadius: 10,
    paddingVertical: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: AWNING,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  newListBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AWNING,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  newListBtnText: { fontSize: 15, fontWeight: "700", color: PAPER },
  separator: {
    height: 1,
    backgroundColor: PAPER_DARK,
    marginVertical: 24,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PAPER_DARK,
  },
  historyDate: { fontSize: 14, fontWeight: "600", color: INK },
  historyCount: { fontSize: 12, color: MUTED, marginTop: 2 },
});
