import { ChevronRight, Plus } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Trip } from "../data/types";
import { AWNING, INK, MUTED, PAPER, PAPER_DARK } from "../theme/colors";

type Props = {
  activeTrip: Trip | null;
  historyTrips: Trip[];
  onStartNew: () => void;
  onContinue: () => void;
  onFinish: () => void;
  onOpenHistory: (tripId: string) => void;
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export function HomeScreen({
  activeTrip,
  historyTrips,
  onStartNew,
  onContinue,
  onFinish,
  onOpenHistory,
}: Props) {
  const boughtCount = activeTrip?.list.filter((i) => i.bought).length ?? 0;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>LA LISTA</Text>
          <Text style={styles.tagline}>tus compras, a mano</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.sectionTitle}>Lista en curso</Text>
        {activeTrip ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeDate}>Creada el {formatDate(activeTrip.createdAt)}</Text>
            <Text style={styles.activeCount}>
              {boughtCount}/{activeTrip.list.length} producto{activeTrip.list.length === 1 ? "" : "s"}
              {" "}comprados
            </Text>
            <View style={styles.activeActions}>
              <TouchableOpacity style={styles.ghostBtn} onPress={onFinish}>
                <Text style={styles.ghostBtnText}>Terminar lista</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={onContinue}>
                <Text style={styles.primaryBtnText}>Continuar</Text>
                <ChevronRight size={16} color={PAPER} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyState}>No tenés una lista en curso.</Text>
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
    paddingTop: 18,
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
  },
  activeDate: { fontSize: 13, color: MUTED },
  activeCount: { fontSize: 18, fontWeight: "700", color: INK, marginTop: 4 },
  activeActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  ghostBtn: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  ghostBtnText: { fontSize: 14, fontWeight: "600", color: AWNING },
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
  primaryBtnText: { fontSize: 14, fontWeight: "600", color: PAPER },
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
