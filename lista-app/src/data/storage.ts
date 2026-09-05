import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildInitialCatalog } from "./seed";
import { Catalog, Trip } from "./types";

const CATALOG_KEY = "catalog";
const TRIP_KEY = "trip";

export async function getCatalog(): Promise<Catalog> {
  const raw = await AsyncStorage.getItem(CATALOG_KEY);
  if (!raw) return buildInitialCatalog();
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.categories)) return parsed as Catalog;
  } catch {
    // JSON corrupto: se ignora y se cae al catálogo inicial
  }
  return buildInitialCatalog();
}

export async function setCatalog(catalog: Catalog): Promise<void> {
  await AsyncStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}

export async function getTrip(): Promise<Trip> {
  const empty: Trip = { list: [], indices: {}, currentCategoryId: "" };
  const raw = await AsyncStorage.getItem(TRIP_KEY);
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw);
    return {
      list: Array.isArray(parsed.list) ? parsed.list : [],
      indices: parsed.indices && typeof parsed.indices === "object" ? parsed.indices : {},
      currentCategoryId: parsed.currentCategoryId ?? "",
    };
  } catch {
    return empty;
  }
}

export async function setTrip(trip: Trip): Promise<void> {
  await AsyncStorage.setItem(TRIP_KEY, JSON.stringify(trip));
}
