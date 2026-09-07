import { useEffect, useState } from "react";
import { getTrip, setTrip as persistTrip } from "../data/storage";
import { Category, ListItem } from "../data/types";

export function useTrip(categories: Category[], catalogLoaded: boolean) {
  const [list, setList] = useState<ListItem[]>([]);
  const [indices, setIndices] = useState<Record<string, number>>({});
  const [currentCategoryId, setCurrentCategoryId] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!catalogLoaded) return;
    (async () => {
      const trip = await getTrip();
      setList(trip.list);
      setIndices(trip.indices);
      const validCurrent = categories.some((c) => c.id === trip.currentCategoryId);
      setCurrentCategoryId(validCurrent ? trip.currentCategoryId : categories[0]?.id ?? "");
      setLoaded(true);
    })();
    // catalogLoaded pasa de false a true una sola vez, no hace falta re-cargar
    // cuando cambian las categorías después.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogLoaded]);

  useEffect(() => {
    if (!loaded) return;
    persistTrip({ list, indices, currentCategoryId }).catch(() => {});
  }, [list, indices, currentCategoryId, loaded]);

  return { list, setList, indices, setIndices, currentCategoryId, setCurrentCategoryId, loaded };
}
