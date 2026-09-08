import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { findMatches } from "../data/catalogLogic";
import { Category } from "../data/types";
import { AWNING, INK, MUTED, PAPER, PAPER_DARK, SAGE } from "../theme/colors";

const NEW_CATEGORY = "__new__";

type Props = {
  categories: Category[];
  defaultCategoryId: string;
  onClose: () => void;
  onSelectExisting: (input: { itemId: string; categoryId: string }) => void;
  onCreateNew: (input: {
    name: string;
    categoryId: string;
    newCategoryName: string;
    addToList: boolean;
  }) => void;
};

export function AddModal({
  categories,
  defaultCategoryId,
  onClose,
  onSelectExisting,
  onCreateNew,
}: Props) {
  const [name, setName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addToList, setAddToList] = useState(false);
  const insets = useSafeAreaInsets();

  const { exact, similar } = useMemo(
    () => findMatches(categories, name),
    [categories, name]
  );
  const matches = exact ? [exact, ...similar] : similar;
  const canSubmit = name.trim().length > 0;

  const categoryOf = (id: string) => categories.find((c) => c.id === id);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.card, { paddingBottom: 22 + insets.bottom }]}>
          <Text style={styles.title}>Agregar producto</Text>
          <TextInput
            autoFocus
            style={styles.input}
            placeholder="¿Qué necesitás?"
            placeholderTextColor={PAPER_DARK}
            value={name}
            onChangeText={(t) => {
              setName(t);
              setCreatingNew(false);
            }}
          />

          {!creatingNew && canSubmit && (
            <>
              {matches.length > 0 && (
                <>
                  <Text style={styles.label}>¿Es alguno de estos?</Text>
                  <ScrollView style={styles.matchList}>
                    {matches.map(({ item, categoryId: mCatId }) => {
                      const cat = categoryOf(mCatId);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.matchRow}
                          onPress={() =>
                            onSelectExisting({ itemId: item.id, categoryId: mCatId })
                          }
                        >
                          <Text style={styles.matchText}>
                            {cat?.emoji ?? "🛒"} {item.name}
                          </Text>
                          <Text style={styles.matchCat}>{cat?.name ?? ""}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              <TouchableOpacity
                style={styles.newBtn}
                onPress={() => setCreatingNew(true)}
              >
                <Text style={styles.newBtnText}>
                  {matches.length > 0
                    ? `Ninguno, crear "${name.trim()}" como producto nuevo`
                    : `Crear "${name.trim()}" como producto nuevo`}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {creatingNew && (
            <>
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

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAddToList((v) => !v)}
              >
                <View style={[styles.checkbox, addToList && styles.checkboxChecked]}>
                  {addToList && <Check size={14} color={PAPER} />}
                </View>
                <Text style={styles.checkboxLabel}>Agregar a la lista en curso</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.ghostBtn} onPress={onClose}>
              <Text style={styles.ghostBtnText}>Cancelar</Text>
            </TouchableOpacity>
            {creatingNew && (
              <TouchableOpacity
                style={[styles.primaryBtn, !canSubmit && styles.disabled]}
                disabled={!canSubmit}
                onPress={() =>
                  onCreateNew({ name, categoryId, newCategoryName, addToList })
                }
              >
                <Text style={styles.primaryBtnText}>Crear</Text>
              </TouchableOpacity>
            )}
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
  matchList: { maxHeight: 160 },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: PAPER_DARK,
    marginBottom: 6,
  },
  matchText: { fontSize: 14, fontWeight: "600", color: INK },
  matchCat: { fontSize: 12, color: MUTED },
  newBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  newBtnText: { fontSize: 13, fontWeight: "600", color: AWNING },
  catStrip: { flexDirection: "row" },
  catChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignSelf: "flex-start",
  },
  catChipText: { fontSize: 13, fontWeight: "600" },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: PAPER_DARK,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: SAGE, borderColor: SAGE },
  checkboxLabel: { fontSize: 13, color: INK },
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
