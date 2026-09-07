import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Category } from "../data/types";
import { AWNING, INK, PAPER, PAPER_DARK } from "../theme/colors";

const NEW_CATEGORY = "__new__";

type Props = {
  categories: Category[];
  defaultCategoryId: string;
  onClose: () => void;
  onSubmit: (input: { name: string; categoryId: string; newCategoryName: string }) => void;
};

export function AddModal({ categories, defaultCategoryId, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [newCategoryName, setNewCategoryName] = useState("");

  const canSubmit = name.trim().length > 0;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Agregar producto</Text>
          <TextInput
            autoFocus
            style={styles.input}
            placeholder="¿Qué necesitás?"
            placeholderTextColor={PAPER_DARK}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catStrip}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[
                  styles.catChip,
                  { backgroundColor: categoryId === c.id ? c.color : PAPER_DARK },
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: categoryId === c.id ? PAPER : INK },
                  ]}
                >
                  {c.emoji} {c.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setCategoryId(NEW_CATEGORY)}
              style={[
                styles.catChip,
                { backgroundColor: categoryId === NEW_CATEGORY ? AWNING : PAPER_DARK },
              ]}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: categoryId === NEW_CATEGORY ? PAPER : INK },
                ]}
              >
                + Nueva categoría…
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {categoryId === NEW_CATEGORY && (
            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoría"
              placeholderTextColor={PAPER_DARK}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.ghostBtn} onPress={onClose}>
              <Text style={styles.ghostBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, !canSubmit && styles.disabled]}
              disabled={!canSubmit}
              onPress={() => onSubmit({ name, categoryId, newCategoryName })}
            >
              <Text style={styles.primaryBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,36,28,0.55)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: PAPER,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    gap: 10,
  },
  title: { fontSize: 20, fontWeight: "700", color: INK, marginBottom: 4 },
  label: { fontSize: 12, color: INK, fontWeight: "600", marginTop: 4 },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PAPER_DARK,
    fontSize: 14,
    backgroundColor: "#fff",
    color: INK,
  },
  catStrip: { flexDirection: "row" },
  catChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignSelf: "flex-start",
  },
  catChipText: { fontSize: 13, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  ghostBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: PAPER_DARK,
    borderRadius: 10,
    paddingVertical: 12,
  },
  ghostBtnText: { fontSize: 14, fontWeight: "600", color: INK },
  primaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AWNING,
    borderRadius: 10,
    paddingVertical: 12,
  },
  primaryBtnText: { fontSize: 14, fontWeight: "600", color: PAPER },
  disabled: { opacity: 0.5 },
});
