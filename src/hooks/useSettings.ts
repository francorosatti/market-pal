import { useEffect, useState } from "react";
import { getSettings, ListSortMode, setSettings as persistSettings, ViewMode } from "../data/storage";

export function useSettings() {
  const [viewMode, setViewMode] = useState<ViewMode>("swipe");
  const [listSortMode, setListSortMode] = useState<ListSortMode>("freq");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      setViewMode(settings.viewMode);
      setListSortMode(settings.listSortMode);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    persistSettings({ viewMode, listSortMode }).catch(() => {});
  }, [viewMode, listSortMode, loaded]);

  return { viewMode, setViewMode, listSortMode, setListSortMode, loaded };
}
