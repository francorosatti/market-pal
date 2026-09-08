import { useEffect, useState } from "react";
import { isListComplete, uid } from "../data/catalogLogic";
import { getTripsData, setTripsData, TripsData } from "../data/storage";
import { Category, ListItem, Trip } from "../data/types";

function makeTrip(currentCategoryId: string): Trip {
  return {
    id: `t-${uid()}`,
    status: "active",
    createdAt: Date.now(),
    completedAt: null,
    list: [],
    indices: {},
    currentCategoryId,
  };
}

function archive(trip: Trip): Trip {
  return { ...trip, status: "done", completedAt: Date.now() };
}

export function useTrips(categories: Category[], catalogLoaded: boolean) {
  const [data, setData] = useState<TripsData>({ trips: {}, activeTripId: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!catalogLoaded) return;
    (async () => {
      const loadedData = await getTripsData();
      setData(loadedData);
      setLoaded(true);
    })();
    // catalogLoaded pasa de false a true una sola vez, no hace falta re-cargar
    // cuando cambian las categorías después.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogLoaded]);

  useEffect(() => {
    if (!loaded) return;
    setTripsData(data).catch(() => {});
  }, [data, loaded]);

  const activeTrip = data.activeTripId ? data.trips[data.activeTripId] ?? null : null;
  const historyTrips = Object.values(data.trips)
    .filter((t) => t.status === "done")
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  const updateActiveTrip = (updater: (trip: Trip) => Trip) => {
    setData((prev) => {
      if (!prev.activeTripId) return prev;
      const current = prev.trips[prev.activeTripId];
      if (!current) return prev;
      const updated = updater(current);
      return { ...prev, trips: { ...prev.trips, [updated.id]: updated } };
    });
  };

  const setList = (updater: ListItem[] | ((prev: ListItem[]) => ListItem[])) => {
    setData((prev) => {
      if (!prev.activeTripId) return prev;
      const current = prev.trips[prev.activeTripId];
      if (!current) return prev;
      const newList = typeof updater === "function" ? (updater as any)(current.list) : updater;
      if (isListComplete(newList)) {
        const done = archive({ ...current, list: newList });
        return { trips: { ...prev.trips, [done.id]: done }, activeTripId: null };
      }
      return { ...prev, trips: { ...prev.trips, [current.id]: { ...current, list: newList } } };
    });
  };

  const setIndices = (
    updater:
      | Record<string, number>
      | ((prev: Record<string, number>) => Record<string, number>)
  ) => {
    updateActiveTrip((trip) => ({
      ...trip,
      indices: typeof updater === "function" ? (updater as any)(trip.indices) : updater,
    }));
  };

  const setCurrentCategoryId = (id: string) => {
    updateActiveTrip((trip) => ({ ...trip, currentCategoryId: id }));
  };

  const startNewList = () => {
    setData((prev) => {
      const trips = { ...prev.trips };
      if (prev.activeTripId && trips[prev.activeTripId]) {
        trips[prev.activeTripId] = archive(trips[prev.activeTripId]);
      }
      const newTrip = makeTrip(categories[0]?.id ?? "");
      trips[newTrip.id] = newTrip;
      return { trips, activeTripId: newTrip.id };
    });
  };

  const finishActiveList = () => {
    setData((prev) => {
      if (!prev.activeTripId || !prev.trips[prev.activeTripId]) return prev;
      const trips = { ...prev.trips };
      trips[prev.activeTripId] = archive(trips[prev.activeTripId]);
      return { trips, activeTripId: null };
    });
  };

  const reactivateTrip = (id: string) => {
    setData((prev) => {
      if (!prev.trips[id]) return prev;
      const trips = { ...prev.trips };
      if (prev.activeTripId && trips[prev.activeTripId]) {
        trips[prev.activeTripId] = archive(trips[prev.activeTripId]);
      }
      trips[id] = { ...trips[id], status: "active", completedAt: null };
      return { trips, activeTripId: id };
    });
  };

  return {
    activeTrip,
    historyTrips,
    list: activeTrip?.list ?? [],
    setList,
    indices: activeTrip?.indices ?? {},
    setIndices,
    currentCategoryId: activeTrip?.currentCategoryId ?? "",
    setCurrentCategoryId,
    loaded,
    startNewList,
    finishActiveList,
    reactivateTrip,
  };
}
