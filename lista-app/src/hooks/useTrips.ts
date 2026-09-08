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
  const [data, setData] = useState<TripsData>({ trips: {} });
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

  const activeTrips = Object.values(data.trips)
    .filter((t) => t.status === "active")
    .sort((a, b) => b.createdAt - a.createdAt);
  const historyTrips = Object.values(data.trips)
    .filter((t) => t.status === "done")
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  const updateTrip = (tripId: string, updater: (trip: Trip) => Trip) => {
    setData((prev) => {
      const current = prev.trips[tripId];
      if (!current) return prev;
      const updated = updater(current);
      return { trips: { ...prev.trips, [updated.id]: updated } };
    });
  };

  const setList = (
    tripId: string,
    updater: ListItem[] | ((prev: ListItem[]) => ListItem[])
  ) => {
    setData((prev) => {
      const current = prev.trips[tripId];
      if (!current) return prev;
      const newList = typeof updater === "function" ? (updater as any)(current.list) : updater;
      if (isListComplete(newList)) {
        const done = archive({ ...current, list: newList });
        return { trips: { ...prev.trips, [done.id]: done } };
      }
      return { trips: { ...prev.trips, [tripId]: { ...current, list: newList } } };
    });
  };

  const setIndices = (
    tripId: string,
    updater:
      | Record<string, number>
      | ((prev: Record<string, number>) => Record<string, number>)
  ) => {
    updateTrip(tripId, (trip) => ({
      ...trip,
      indices: typeof updater === "function" ? (updater as any)(trip.indices) : updater,
    }));
  };

  const setCurrentCategoryId = (tripId: string, id: string) => {
    updateTrip(tripId, (trip) => ({ ...trip, currentCategoryId: id }));
  };

  const startNewList = (): string => {
    const newTrip = makeTrip(categories[0]?.id ?? "");
    setData((prev) => ({ trips: { ...prev.trips, [newTrip.id]: newTrip } }));
    return newTrip.id;
  };

  const finishTrip = (tripId: string) => {
    setData((prev) => {
      const current = prev.trips[tripId];
      if (!current) return prev;
      return { trips: { ...prev.trips, [tripId]: archive(current) } };
    });
  };

  const reactivateTrip = (id: string) => {
    setData((prev) => {
      if (!prev.trips[id]) return prev;
      return {
        trips: {
          ...prev.trips,
          [id]: { ...prev.trips[id], status: "active", completedAt: null },
        },
      };
    });
  };

  return {
    activeTrips,
    historyTrips,
    setList,
    setIndices,
    setCurrentCategoryId,
    loaded,
    startNewList,
    finishTrip,
    reactivateTrip,
  };
}
