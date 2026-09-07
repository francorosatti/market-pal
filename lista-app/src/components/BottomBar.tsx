import { Check, Plus, X } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BRICK, INK, PAPER, PAPER_DARK, SAGE } from "../theme/colors";

type Props = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onAdd: () => void;
  disabled: boolean;
};

export function BottomBar({ onSwipeLeft, onSwipeRight, onAdd, disabled }: Props) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={[styles.circleBtn, styles.big, { backgroundColor: BRICK }]}
        onPress={onSwipeLeft}
        disabled={disabled}
        accessibilityLabel="Paso"
      >
        <X size={26} color={PAPER} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.circleBtn, { backgroundColor: PAPER_DARK }]}
        onPress={onAdd}
        accessibilityLabel="Agregar manualmente"
      >
        <Plus size={20} color={INK} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.circleBtn, styles.big, { backgroundColor: SAGE }]}
        onPress={onSwipeRight}
        disabled={disabled}
        accessibilityLabel="Lo llevo"
      >
        <Check size={26} color={PAPER} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 16,
    paddingBottom: 28,
  },
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  big: { width: 58, height: 58 },
});
