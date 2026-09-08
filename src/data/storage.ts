import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildInitialCatalog } from "./seed";
import { Catalog, Trip } from "./types";

const CATALOG_KEY = "catalog";
const TRIPS_KEY = "trips";
const SETTINGS_KEY = "settings";

export type ViewMode = "swipe" | "list";

export type Settings = {
  viewMode: ViewMode;
};

const DEFAULT_SETTINGS: Settings = { viewMode: "swipe" };

export type TripsData = {
  trips: Record<string, Trip>;
};

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

function parseTrip(raw: any): Trip | null {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "string") return null;
  return {
    id: raw.id,
    status: raw.status === "done" ? "done" : "active",
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    completedAt: typeof raw.completedAt === "number" ? raw.completedAt : null,
    list: Array.isArray(raw.list) ? raw.list : [],
    indices: raw.indices && typeof raw.indices === "object" ? raw.indices : {},
    currentCategoryId: raw.currentCategoryId ?? "",
  };
}

export async function getTripsData(): Promise<TripsData> {
  const empty: TripsData = { trips: {} };
  const raw = await AsyncStorage.getItem(TRIPS_KEY);
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw);
    const trips: Record<string, Trip> = {};
    if (parsed.trips && typeof parsed.trips === "object") {
      for (const [id, rawTrip] of Object.entries(parsed.trips)) {
        const trip = parseTrip(rawTrip);
        if (trip) trips[id] = trip;
      }
    }
    return { trips };
  } catch {
    return empty;
  }
}

export async function setTripsData(data: TripsData): Promise<void> {
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(data));
}

export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.viewMode === "swipe" || parsed.viewMode === "list")) {
      return { viewMode: parsed.viewMode };
    }
  } catch {
    // JSON corrupto: se ignora y se cae al default
  }
  return DEFAULT_SETTINGS;
}

export async function setSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
