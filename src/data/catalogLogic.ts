import { Category, ListItem, Product } from "./types";

export const norm = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export const uid = () => `c-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const sortedItems = (category: Category): Product[] =>
  [...category.items].sort(
    (a, b) => b.freq - a.freq || a.name.localeCompare(b.name, "es")
  );

/**
 * Busca un producto por nombre dentro de una categoría, o lo crea.
 * Devuelve { categories, item, isNew } de forma inmutable.
 */
export function upsertItem(
  categories: Category[],
  categoryId: string,
  rawName: string
): { categories: Category[]; item: Product | null; isNew: boolean } {
  const name = cap(rawName.trim());
  const catIndex = categories.findIndex((c) => c.id === categoryId);
  if (catIndex === -1) return { categories, item: null, isNew: false };
  const cat = categories[catIndex];
  const existingIdx = cat.items.findIndex((it) => norm(it.name) === norm(name));
  let newItems: Product[];
  let item: Product;
  let isNew = false;
  if (existingIdx >= 0) {
    newItems = cat.items.map((it, i) =>
      i === existingIdx ? { ...it, freq: it.freq + 1 } : it
    );
    item = newItems[existingIdx];
  } else {
    item = { id: uid(), name, freq: 0 };
    newItems = [...cat.items, item];
    isNew = true;
  }
  const newCategories = categories.map((c, i) =>
    i === catIndex ? { ...c, items: newItems } : c
  );
  return { categories: newCategories, item, isNew };
}

export type CatalogMatch = { item: Product; categoryId: string };

/**
 * Busca coincidencias de un nombre en todo el catálogo: exacta (mismo nombre
 * normalizado) y similares (contención de substring en cualquier dirección).
 */
export function findMatches(
  categories: Category[],
  rawName: string
): { exact: CatalogMatch | null; similar: CatalogMatch[] } {
  const target = norm(rawName.trim());
  if (!target) return { exact: null, similar: [] };

  let exact: CatalogMatch | null = null;
  const similar: CatalogMatch[] = [];

  for (const cat of categories) {
    for (const item of cat.items) {
      const itemNorm = norm(item.name);
      if (itemNorm === target) {
        exact = { item, categoryId: cat.id };
      } else if (itemNorm.includes(target) || target.includes(itemNorm)) {
        similar.push({ item, categoryId: cat.id });
      }
    }
  }

  return { exact, similar };
}

/**
 * Crea un producto nuevo en una categoría sin tocar ninguna lista.
 * Devuelve { categories, item } de forma inmutable.
 */
export function createItem(
  categories: Category[],
  categoryId: string,
  rawName: string
): { categories: Category[]; item: Product | null } {
  const name = cap(rawName.trim());
  const catIndex = categories.findIndex((c) => c.id === categoryId);
  if (catIndex === -1) return { categories, item: null };
  const item: Product = { id: uid(), name, freq: 0 };
  const newCategories = categories.map((c, i) =>
    i === catIndex ? { ...c, items: [...c.items, item] } : c
  );
  return { categories: newCategories, item };
}

/**
 * Suma 1 a la frecuencia de un producto existente identificado por id.
 * Equivalente a bumpFreq pero pensado para el flujo de agregado manual.
 */
export function addExistingItem(
  categories: Category[],
  categoryId: string,
  itemId: string
): Category[] {
  return bumpFreq(categories, categoryId, itemId);
}

export function addToList(
  list: ListItem[],
  item: Product,
  categoryId: string
): ListItem[] {
  if (list.some((p) => p.id === item.id && p.categoryId === categoryId)) return list;
  return [...list, { id: item.id, name: item.name, categoryId, bought: false }];
}

export function bumpFreq(
  categories: Category[],
  categoryId: string,
  itemId: string
): Category[] {
  return categories.map((c) =>
    c.id !== categoryId
      ? c
      : {
          ...c,
          items: c.items.map((it) =>
            it.id === itemId ? { ...it, freq: it.freq + 1 } : it
          ),
        }
  );
}

export function toggleBought(
  list: ListItem[],
  id: string,
  categoryId: string
): ListItem[] {
  return list.map((it) =>
    it.id === id && it.categoryId === categoryId ? { ...it, bought: !it.bought } : it
  );
}

export const isListComplete = (list: ListItem[]): boolean =>
  list.length > 0 && list.every((it) => it.bought);

export function removeFromList(
  categories: Category[],
  list: ListItem[],
  id: string,
  categoryId: string
): { categories: Category[]; list: ListItem[] } {
  const newList = list.filter((it) => !(it.id === id && it.categoryId === categoryId));
  const newCategories = categories.map((c) =>
    c.id !== categoryId
      ? c
      : {
          ...c,
          items: c.items.map((it) =>
            it.id === id ? { ...it, freq: Math.max(0, it.freq - 1) } : it
          ),
        }
  );
  return { categories: newCategories, list: newList };
}
